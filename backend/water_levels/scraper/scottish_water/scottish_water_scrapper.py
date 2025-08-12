
from datetime import datetime
import re
from typing import Tuple

from bs4 import BeautifulSoup
import requests

from water_levels.models import ScottishWaterAverageLevel, ScottishWaterRegionalLevel
from water_levels.utils import _parse_last_updated, _parse_percentage


def extract_scottish_water_levels() -> Tuple[int, datetime.date]:
    """Fetch average and regional resource levels from Scottish Water."""
    url = (
        "https://www.scottishwater.co.uk/Your-Home/Your-Water/Managing-Water-Resources/"
        "Scotlands-Water-Resource-Levels"
    )
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    page_text = soup.get_text(" ", strip=True)
    last_updated = _parse_last_updated(page_text)

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

    return total_count, last_updated

if __name__ == "__main__":
   extract_scottish_water_levels()