import re
from datetime import datetime
from typing import Tuple

import requests
from bs4 import BeautifulSoup

from .models import ScottishWaterResourceLevel


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


def fetch_scottish_water_resource_levels() -> Tuple[int, datetime.date]:
    """Fetch resource levels from Scottish Water and store them."""
    url = (
        "https://www.scottishwater.co.uk/Your-Home/Your-Water/Managing-Water-Resources/"
        "Scotlands-Water-Resource-Levels"
    )
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Attempt to find a 'last updated' text on the page
    last_updated_text = ""
    for tag in soup.find_all(string=re.compile("last update", re.I)):
        last_updated_text = str(tag)
        break
    last_updated = _parse_last_updated(last_updated_text)

    resources = []
    table = soup.find("table")
    if table:
        for row in table.find_all("tr"):
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

    count = 0
    for name, level in resources:
        ScottishWaterResourceLevel.objects.update_or_create(
            name=name,
            defaults={"level": level, "last_updated": last_updated},
        )
        count += 1
    return count, last_updated
