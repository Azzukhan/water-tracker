import os
import re
import sys
from datetime import datetime
import time

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
LEVEL_RE = re.compile(r"Reservoir Stocks[^\d]*([\d.]+)%", re.I)
DIRECTION_RE = re.compile(r"(increased|decreased|up|down)", re.I)
DIFF_RE = re.compile(r"\(up ([\d.]+)%|down ([\d.]+)%", re.I)


def extract_yorkshire_reservoir_data():
    """Scrape reservoir summary blocks from the Yorkshire Water dataset page."""

    data_list = []
    page = 1

    while True:
        try:
            response = requests.get(f"{URL}?page={page}", timeout=20)
            response.raise_for_status()
        except Exception:
            if page == 1:
                print("Failed to fetch Yorkshire page")
            break

        soup = BeautifulSoup(response.content, "html.parser")
        # Each report summary is wrapped in a flex container
        blocks = soup.find_all("div", class_="container is-flex")

        if not blocks:
            break

        for block in blocks:
            # Get the text content and normalise whitespace
            text = " ".join(block.get_text(separator=" ", strip=True).split())

            date_match = DATE_RE.search(text)
            level_match = LEVEL_RE.search(text)
            direction_match = DIRECTION_RE.search(text)
            diff_match = DIFF_RE.search(text)

            if not (date_match and level_match):
                print("❌ Skipping:", text)
                continue

            report_date = datetime.strptime(date_match.group(), "%B %Y")
            # normalise to first of month
            report_date = datetime(report_date.year, report_date.month, 1).date()
            level = float(level_match.group(1))
            direction = direction_match.group(1).lower() if direction_match else ""

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

        page += 1
        time.sleep(0.5)

    return data_list

def scrape_site():
    """Fetch Yorkshire reservoir data and store it in the database."""

    records = extract_yorkshire_reservoir_data()
    if not records:
        print("No data found. Check scraping structure.")
        return False

    inserted = False
    for item in records:
        obj, created = YorkshireReservoirData.objects.update_or_create(
            report_date=item["report_date"],
            defaults={
                "reservoir_level": item["reservoir_level"],
                "weekly_difference": item["weekly_difference"],
                "direction": item["direction"],
            },
        )
        inserted = inserted or created
        print(item)

    return inserted

if __name__ == "__main__":
    scrape_site()
