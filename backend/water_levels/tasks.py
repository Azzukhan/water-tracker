import re
from datetime import datetime
import os
import sys

import django
import requests
from bs4 import BeautifulSoup
from celery import shared_task

if __package__ in (None, ""):
    # Allow running this module as a standalone script for quick testing
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()
    from water_levels.models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
    from water_levels.utils import fetch_scottish_water_resource_levels
else:
    from .models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
    from .utils import fetch_scottish_water_resource_levels


@shared_task
def update_scottish_resources():
    """Fetch Scottish Water resource levels and store them."""
    count, _ = fetch_scottish_water_resource_levels()
    return count


@shared_task
def fetch_severn_trent_reservoir_data():
    """
    Celery task to scrape Severn Trent reservoir level data and save into DB.
    """
    import requests
    from bs4 import BeautifulSoup
    import re
    from datetime import datetime

    from water_levels.models import SevernTrentReservoirLevel

    def clean_date(date_str):
        return re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)

    print("🔍 [TASK] Fetching Severn Trent reservoir data...")
    url = url = "https://www.stwater.co.uk/about-us/reservoir-levels/"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        lines = [line.strip() for line in soup.text.split("\n") if line.strip()]
        count = 0

        for i in range(len(lines) - 1):
            if "%" in lines[i] and "20" in lines[i + 1]:
                try:
                    percentage = float(lines[i].replace("%", "").strip())
                    raw_date = clean_date(lines[i + 1])
                    date_parsed = datetime.strptime(raw_date, "%d %B %Y").date()

                    SevernTrentReservoirLevel.objects.update_or_create(
                        date=date_parsed,
                        defaults={"percentage": percentage},
                    )
                    count += 1
                except Exception as e:
                    print(f"❌ Skipped {lines[i]}, {lines[i+1]} → {e}")

        print(f"✅ Task completed: {count} entries saved/updated.")
        return f"{count} records updated."
    
    except Exception as e:
        print(f"❌ Failed to fetch Severn Trent data: {e}")
        return "Error"


@shared_task
def generate_arima_forecast():
    from .models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
    import pandas as pd
    from statsmodels.tsa.arima.model import ARIMA
    from datetime import timedelta

    qs = SevernTrentReservoirLevel.objects.order_by("date")
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "percentage"))
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").asfreq("W-MON")
    df["percentage"] = df["percentage"].interpolate()

    model = ARIMA(df["percentage"], order=(2, 1, 2))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=4)

    latest_date = qs.last().date
    for i, value in enumerate(forecast):
        target_date = latest_date + timedelta(weeks=i + 1)
        SevernTrentReservoirForecast.objects.update_or_create(
            date=target_date,
            model_type="ARIMA",
            defaults={"predicted_percentage": round(value, 2)},
        )
    return "ARIMA forecast complete"


@shared_task
def generate_lstm_forecast():
    from .models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
    from datetime import timedelta
    import pandas as pd
    from ml.lstm_model import train_lstm

    qs = SevernTrentReservoirLevel.objects.order_by("date")
    if qs.count() < 30:
        return "Not enough data"

    df = pd.DataFrame(qs.values("date", "percentage"))
    preds = train_lstm(df)
    last_date = qs.last().date

    for i, val in enumerate(preds):
        target = last_date + timedelta(weeks=i + 1)
        SevernTrentReservoirForecast.objects.update_or_create(
            date=target,
            model_type="LSTM",
            defaults={"predicted_percentage": round(val, 2)},
        )
    return "LSTM forecast complete"


@shared_task
def weekly_severn_trent_predictions():
    generate_arima_forecast.delay()
    generate_lstm_forecast.delay()
    return "scheduled"


@shared_task
def fetch_yorkshire_water_reports():
    from .scraper.yorkshire_pdf_scraper import fetch_and_store_reports
    fetch_and_store_reports()
    return "done"
