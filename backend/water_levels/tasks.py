import requests
from bs4 import BeautifulSoup
from celery import shared_task
from datetime import datetime
from .models import SevernTrentReservoirLevel
from .utils import fetch_scottish_water_resource_levels


@shared_task
def update_scottish_resources():
    """Fetch Scottish Water resource levels and store them."""
    count, _ = fetch_scottish_water_resource_levels()
    return count


@shared_task
def fetch_severn_trent_reservoir_data():
    print("🔄 [TASK] Fetching Severn Trent reservoir data...")

    url = "https://www.stwater.co.uk/wonderful-on-tap/our-performance/reservoir-levels/"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        percentages = [p.get_text(strip=True).replace('%', '') for p in soup.select("div.reservoir-level-number")]
        dates = [d.get_text(strip=True) for d in soup.select("div.reservoir-level-date")]

        count = 0

        for perc, date_str in zip(percentages, dates):
            try:
                clean_date = datetime.strptime(
                    date_str.replace('st', '').replace('nd', '').replace('rd', '').replace('th', ''),
                    "%d %B %Y"
                ).date()
                percentage = float(perc)

                SevernTrentReservoirLevel.objects.update_or_create(
                    date=clean_date,
                    defaults={"percentage": percentage}
                )
                count += 1
            except Exception as e:  # pragma: no cover - best effort parsing
                print(f"❌ Skipped {perc}% - {date_str}: {e}")

        print(f"✅ Task completed: {count} entries updated.")
        return f"{count} records updated."

    except Exception as e:  # pragma: no cover - network errors
        print(f"❌ Failed to fetch data: {e}")
        return "Error"
