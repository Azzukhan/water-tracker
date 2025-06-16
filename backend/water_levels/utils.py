import re
from datetime import datetime
from typing import Tuple

import requests
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
