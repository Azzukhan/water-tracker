import os
import re
import sys
from datetime import datetime

import requests
from bs4 import BeautifulSoup

if __package__ in (None, ""):
    import django
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()
    from water_levels.models import YorkshireReservoirData
else:
    from ..models import YorkshireReservoirData

URL = "https://datamillnorth.org/dataset/vqxw4/watsit-water-situation-report"
DATE_RE = re.compile(
    r"(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}",
    re.I,
)
LEVEL_RE = re.compile(r"Reservoir Stocks Have (increased|decreased) to ([\d.]+)%", re.I)
DIFF_RE = re.compile(r"\(up ([\d.]+)%|down ([\d.]+)%", re.I)


def extract_yorkshire_reservoir_data():
    """Scrape reservoir summary blocks from the Yorkshire Water dataset page."""

    try:
        response = requests.get(URL, timeout=20)
        response.raise_for_status()
    except Exception:
        print("Failed to fetch Yorkshire page")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    data_list = []
    blocks = soup.find_all("div", class_="container is-flex")

    for block in blocks:
        text = block.get_text(separator=" ", strip=True)

        date_match = DATE_RE.search(text)
        stock_match = LEVEL_RE.search(text)
        diff_match = DIFF_RE.search(text)

        if not (date_match and stock_match):
            continue

        report_date = datetime.strptime(date_match.group(), "%B %Y").date()
        direction = stock_match.group(1).lower()
        level = float(stock_match.group(2))

        weekly_diff = None
        if diff_match:
            if diff_match.group(1):
                weekly_diff = float(diff_match.group(1))
            elif diff_match.group(2):
                weekly_diff = float(diff_match.group(2)) * -1

        data_list.append(
            {
                "report_date": report_date,
                "reservoir_level": level,
                "weekly_difference": weekly_diff,
                "direction": direction,
            }
        )

    return data_list

def scrape_site():
    """Fetch Yorkshire reservoir data and store it in the database."""

    records = extract_yorkshire_reservoir_data()
    if not records:
        print("No data found. Check scraping structure.")
        return

    for item in records:
        YorkshireReservoirData.objects.update_or_create(
            report_date=item["report_date"],
            defaults={
                "reservoir_level": item["reservoir_level"],
                "weekly_difference": item["weekly_difference"],
                "direction": item["direction"],
            },
        )
        print(item)

if __name__ == "__main__":
    scrape_site()
