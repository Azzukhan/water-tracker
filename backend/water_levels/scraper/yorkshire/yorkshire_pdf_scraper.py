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
    from water_levels.models import YorkshireReservoirData


URL = "https://datamillnorth.org/dataset/vqxw4/watsit-water-situation-report"

DATE_RE = re.compile(
    r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}",
    re.I,
)
TO_LEVEL_RE = re.compile(r"Reservoir Stocks.*?(?:Have\s+(?:Increased|Decreased))?.*?To\s+([\d.]+)%", re.I)
FROM_TO_LEVEL_RE = re.compile(r"Reservoir Stocks.*?from\s+([\d.]+)%\s+to\s+([\d.]+)%", re.I)
DIRECTION_RE = re.compile(r"(increased|decreased|up|down)", re.I)
DIFF_RE = re.compile(r"\(up ([\d.]+)%|down ([\d.]+)%", re.I)


def extract_yorkshire_reservoir_data():
    """Scrape reservoir summary blocks from the Yorkshire Water dataset page."""
    data_list = []
    processed_texts = set()
    max_pages = 10

    for page in range(1, max_pages + 1):
        try:
            response = requests.get(f"{URL}?page={page}", timeout=20)
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to fetch page {page}: {e}")
            break

        soup = BeautifulSoup(response.content, "html.parser")
        blocks = soup.find_all("div", class_="container is-flex")

        if not blocks:
            print(f"No blocks found on page {page}. Stopping pagination.")
            break

        for block in blocks:
            text = " ".join(block.get_text(separator=" ", strip=True).split()).replace("%%", "%")
            if text in processed_texts:
                print(f"Skipping duplicate block: {text[:50]}...")
                continue
            processed_texts.add(text)

            date_match = DATE_RE.search(text)
            from_to_match = FROM_TO_LEVEL_RE.search(text)
            to_level_match = TO_LEVEL_RE.search(text)
            direction_match = DIRECTION_RE.search(text)
            diff_match = DIFF_RE.search(text)

            if not date_match:
                continue

            report_date = datetime.strptime(date_match.group(), "%B %Y").date()
            report_date = datetime(report_date.year, report_date.month, 1).date()

            level = None
            if from_to_match:
                level = float(from_to_match.group(2))
            elif to_level_match:
                level = float(to_level_match.group(1))
            else:
                continue

            direction = direction_match.group(1).lower() if direction_match else ""

            weekly_diff = None
            if diff_match:
                up = diff_match.group(1)
                down = diff_match.group(2)
                if up:
                    weekly_diff = float(up)
                elif down:
                    weekly_diff = -float(down)

            data_list.append({
                "report_date": report_date,
                "reservoir_level": level,
                "weekly_difference": weekly_diff,
                "direction": direction,
            })

        time.sleep(0.5)

    return data_list


def scrape_site():
    """Fetch and store Yorkshire reservoir data into the database."""
    records = extract_yorkshire_reservoir_data()
    if not records:
        return False

    inserted = False
    for item in records:
        _, created = YorkshireReservoirData.objects.update_or_create(
            report_date=item["report_date"],
            defaults={
                "reservoir_level": item["reservoir_level"],
                "weekly_difference": item["weekly_difference"],
                "direction": item["direction"],
            },
        )
        inserted = inserted or created

    return inserted


if __name__ == "__main__":
    scrape_site()
