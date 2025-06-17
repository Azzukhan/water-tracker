import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from celery import shared_task

from .models import SevernTrentReservoirLevel
from .utils import fetch_scottish_water_resource_levels


@shared_task
def update_scottish_resources():
    """Fetch Scottish Water resource levels and store them."""
    count, _ = fetch_scottish_water_resource_levels()
    return count


@shared_task
def fetch_severn_trent_reservoir_data():
    """Fetch current Severn Trent reservoir levels and store them."""

    print("🔄 [TASK] Fetching Severn Trent reservoir data...")

    url = "https://www.stwater.co.uk/wonderful-on-tap/our-performance/reservoir-levels/"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        lines = [line.strip() for line in soup.get_text("\n").split("\n") if line.strip()]

        count = 0
        for i in range(len(lines) - 1):
            if "%" in lines[i] and re.search(r"\d{1,2} \w+ 20\d{2}", lines[i + 1]):
                try:
                    percentage = float(lines[i].replace("%", "").strip())
                    clean_date = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", lines[i + 1])
                    date_obj = datetime.strptime(clean_date, "%d %B %Y").date()

                    SevernTrentReservoirLevel.objects.update_or_create(
                        date=date_obj,
                        defaults={"percentage": percentage},
                    )
                    count += 1
                except Exception as e:  # pragma: no cover - best effort parsing
                    print(f"❌ Skipped {lines[i]} / {lines[i + 1]}: {e}")

        print(f"✅ Task completed: {count} entries updated.")
        return f"{count} records updated."

    except Exception as e:  # pragma: no cover - network errors
        print(f"❌ Failed to fetch data: {e}")
        return "Error"
