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
DIFF_RE = re.compile(r"(up|down) ([\d.]+)% from previous week", re.I)

def scrape_site():
    try:
        response = requests.get(URL, timeout=20)
        response.raise_for_status()
    except Exception:
        print("Failed to fetch Yorkshire page")
        return

    soup = BeautifulSoup(response.content, "html.parser")
    items = soup.find_all("li", class_="resource-item")
    if not items:
        print("No PDF reports found")
    for block in items:
        text = block.get_text(strip=True)
        date_match = DATE_RE.search(text)
        if not date_match:
            continue
        report_date = datetime.strptime(date_match.group(0), "%B %Y").date()

        stock_match = LEVEL_RE.search(text)
        if not stock_match:
            continue
        direction = stock_match.group(1).lower()
        level = float(stock_match.group(2))

        diff_match = DIFF_RE.search(text)
        diff = float(diff_match.group(2)) if diff_match else None

        YorkshireReservoirData.objects.update_or_create(
            report_date=report_date,
            defaults={
                "reservoir_level": level,
                "weekly_difference": diff,
                "direction": direction,
            },
        )
        print({
            "date": report_date,
            "level": level,
            "diff": diff,
            "direction": direction,
        })

if __name__ == "__main__":
    scrape_site()
