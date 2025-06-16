import re
from datetime import datetime
from typing import Tuple

import requests
import time
from bs4 import BeautifulSoup

from .models import (
    ScottishWaterResourceLevel,
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
)


LAST_UPDATE_REGEX = re.compile(r"(\d{1,2} \w+ \d{4})")


def _parse_last_updated(text: str) -> datetime.date:
    match = LAST_UPDATE_REGEX.search(text)
    if match:
        for fmt in ["%d %B %Y", "%d %b %Y"]:
            try:
                return datetime.strptime(match.group(1), fmt).date()
            except ValueError:
                continue
    return datetime.utcnow().date()


def _parse_percentage(value: str) -> float:
    try:
        return float(value.replace("%", "").strip())
    except ValueError:
        return 0.0


def fetch_scottish_water_resource_levels() -> Tuple[int, datetime.date]:
    """Fetch resource levels from Scottish Water and store them."""
    url = (
        "https://www.scottishwater.co.uk/Your-Home/Your-Water/Managing-Water-Resources/"
        "Scotlands-Water-Resource-Levels"
    )
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    page_text = soup.get_text(" ", strip=True)
    last_updated = _parse_last_updated(page_text)

    # Scotland-wide average table
    total_count = 0
    heading = soup.find(string=re.compile("Average levels Scotland-wide", re.I))
    if heading:
        table = heading.find_next("table")
        if table:
            row = table.find_all("tr")[-1]
            cells = row.find_all(["td", "th"])
            if len(cells) >= 4:
                ScottishWaterAverageLevel.objects.update_or_create(
                    date=last_updated,
                    defaults={
                        "current": _parse_percentage(cells[1].get_text()),
                        "change_from_last_week": _parse_percentage(cells[2].get_text()),
                        "difference_from_average": _parse_percentage(cells[3].get_text()),
                    },
                )

    # Regional averages
    heading = soup.find(string=re.compile("Average levels across regional areas", re.I))
    if heading:
        table = heading.find_next("table")
        if table:
            for row in table.find_all("tr")[1:]:
                cells = row.find_all(["td", "th"])
                if len(cells) >= 4:
                    ScottishWaterRegionalLevel.objects.update_or_create(
                        area=cells[0].get_text(strip=True),
                        date=last_updated,
                        defaults={
                            "current": _parse_percentage(cells[1].get_text()),
                            "change_from_last_week": _parse_percentage(cells[2].get_text()),
                            "difference_from_average": _parse_percentage(cells[3].get_text()),
                        },
                    )
                    total_count += 1

    # Resource levels table (reservoirs)
    tables = soup.find_all("table")
    resource_table = tables[-1] if tables else None
    resources = []
    if resource_table:
        for row in resource_table.find_all("tr"):
            cells = row.find_all(["td", "th"])
            if len(cells) < 2:
                continue
            name = cells[0].get_text(strip=True)
            level_str = cells[1].get_text(strip=True)
            try:
                level = float(level_str.replace("%", ""))
            except ValueError:
                continue
            resources.append((name, level))

    for name, level in resources:
        ScottishWaterResourceLevel.objects.update_or_create(
            name=name,
            defaults={"level": level, "last_updated": last_updated},
        )
        total_count += 1

    return total_count, last_updated


WAYBACK_API = "https://web.archive.org/cdx/search/cdx"
TARGET_URL = (
    "www.scottishwater.co.uk/Your-Home/Your-Water/Managing-Water-Resources/"
    "Scotlands-Water-Resource-Levels"
)


def fetch_scottish_water_history(limit: int = 5000, rate_limit: int = 2) -> int:
    """Import historical resource levels using the Wayback Machine."""

    params = {
        "url": TARGET_URL,
        "output": "json",
        "filter": "statuscode:200",
        "collapse": "timestamp:8",
        "limit": limit,
    }

    try:
        response = requests.get(WAYBACK_API, params=params, timeout=30)
        snapshots = response.json()[1:]
    except Exception:
        return 0

    total_records = 0
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        )
    }

    for snap in snapshots:
        timestamp = snap[1] if isinstance(snap, list) else snap
        url = f"https://web.archive.org/web/{timestamp}/{TARGET_URL}"
        date_obj = datetime.strptime(timestamp[:8], "%Y%m%d").date()

        try:
            res = requests.get(url, headers=headers, timeout=20)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, "html.parser")

            tables = soup.find_all("table", class_=re.compile(r"telerik-reTable"))
            if not tables or len(tables) < 2:
                continue

            row = tables[0].find_all("tr")[-1]
            cells = row.get_text(separator="|").split("|")
            if len(cells) >= 4:
                ScottishWaterAverageLevel.objects.update_or_create(
                    date=date_obj,
                    defaults={
                        "current": _parse_percentage(cells[1]),
                        "change_from_last_week": _parse_percentage(cells[2]),
                        "difference_from_average": _parse_percentage(cells[3]),
                    },
                )
                total_records += 1

            for row in tables[1].find_all("tr"):
                cols = row.find_all("td")
                if len(cols) == 4:
                    ScottishWaterRegionalLevel.objects.update_or_create(
                        area=cols[0].get_text(strip=True),
                        date=date_obj,
                        defaults={
                            "current": _parse_percentage(cols[1].get_text()),
                            "change_from_last_week": _parse_percentage(cols[2].get_text()),
                            "difference_from_average": _parse_percentage(cols[3].get_text()),
                        },
                    )
                    total_records += 1

        except Exception:
            continue

        time.sleep(rate_limit)

    return total_records
