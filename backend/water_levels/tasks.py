import re
from datetime import datetime
import os
import sys
import warnings
import django
import requests
from bs4 import BeautifulSoup
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from celery import shared_task
from datetime import timedelta
from ml.lstm_model import train_lstm

if __package__ in (None, ""):
    # Allow running this module as a standalone script for quick testing
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()
    from water_levels.models import (
        SevernTrentReservoirLevel,
        SevernTrentReservoirForecast,
        YorkshireReservoirData,
        YorkshireWaterPrediction,
    )
    from water_levels.utils import fetch_scottish_water_resource_levels
else:
    from .models import (
        SevernTrentReservoirLevel,
        SevernTrentReservoirForecast,
        YorkshireReservoirData,
        YorkshireWaterPrediction,
        SouthernWaterReservoirLevel,
        SouthernWaterReservoirForecast,
    )
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
def generate_yorkshire_arima_forecast():
    """Generate 4-month ARIMA forecast for Yorkshire Water."""
    from ml.yorkshire_arima_model import generate_arima_forecast as _gen

    _gen()
    return "ARIMA forecast complete"


@shared_task
def fetch_yorkshire_water_reports():
    from .scraper.yorkshire_pdf_scraper import scrape_site
    from ml.yorkshire_lstm_model import train_and_predict_yorkshire
    from ml.yorkshire_arima_model import generate_arima_forecast as _gen_arima

    inserted = scrape_site()
    if inserted:
        train_and_predict_yorkshire()
        _gen_arima()
    return "done"

@shared_task
def run_yorkshire_lstm_prediction_task():
    """Generate monthly Yorkshire predictions using both models."""
    from ml.yorkshire_lstm_model import train_and_predict_yorkshire
    from ml.yorkshire_arima_model import generate_arima_forecast as _gen_arima

    train_and_predict_yorkshire()
    _gen_arima()
    return "predictions generated"

@shared_task
def fetch_southern_water_levels():
    url = "https://www.southernwater.co.uk/about-us/environmental-performance/water-levels/reservoir-levels/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        response = requests.get(url, headers=headers, timeout=20)
        html = response.text
    except Exception as e:
        print(f"Failed to fetch southern water page: {e}")
        return "error"

    blocks = re.findall(r"addRows\(\[\s*(.*?)\s*\]\);", html, re.DOTALL)[:4]
    reservoir_names = ["Bewl", "Darwell", "Powdermill", "Weir Wood"]
    water_year = 2024  # Adjust for your season

    for i, block in enumerate(blocks):
        rows = re.findall(r"\['(.*?)',\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\]", block)
        df = pd.DataFrame(rows, columns=["date", "actual", "average", "minimum"])
        df["actual"] = df["actual"].astype(float)
        df["average"] = df["average"].astype(float)
        df = df.reset_index(drop=True)
        name = reservoir_names[i]
        for j, row in df.iterrows():
            date_str = row["date"].replace(",", "").strip()
            date = pd.to_datetime(date_str, dayfirst=True).date()
            current = row["actual"]
            avg = row["average"]
            diff = round(current - avg, 2)
            change_week = round(current - df.loc[j-1, "actual"], 2) if j > 0 else 0.0
            change_month = round(current - df.loc[j-4, "actual"], 2) if j >= 4 else 0.0

            SouthernWaterReservoirLevel.objects.update_or_create(
                reservoir=name,
                date=date,
                defaults={
                    "current_level": current,
                    "average_level": avg,
                    "change_week": change_week,
                    "change_month": change_month,
                    "difference_from_average": diff,
                },
            )
    return "done"


@shared_task
def generate_southern_arima_forecast():
    warnings.filterwarnings("ignore")  # Optionally suppress warnings
    qs = SouthernWaterReservoirLevel.objects.order_by("reservoir", "date")
    if not qs.exists():
        print("No data in SouthernWaterReservoirLevel")
        return "no data"

    for reservoir in qs.values_list("reservoir", flat=True).distinct():
        res_qs = qs.filter(reservoir=reservoir)
        if res_qs.count() < 12:
            print(f"Skipping {reservoir}: not enough data ({res_qs.count()})")
            continue

        df = pd.DataFrame(res_qs.values("date", "current_level"))
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index()
        df = df.resample("W").ffill()

        # Debug: Print recent values
        print(f"Reservoir: {reservoir}")
        print("Last values before interpolate:")
        print(df["current_level"].tail(10))

        # Only interpolate if there are a few missing values (not all)
        if df["current_level"].isnull().all():
            print(f"All NaN for {reservoir}, skipping.")
            continue

        df["current_level"] = df["current_level"].interpolate()
        print("Last values after interpolate:")
        print(df["current_level"].tail(10))

        if df["current_level"].nunique() == 1:
            print(f"{reservoir} is constant value, skipping.")
            continue

        try:
            model = ARIMA(df["current_level"], order=(2,1,2))
            fit = model.fit()
            # Predict the next 6 months (approx. 24 weeks)
            forecast = fit.forecast(steps=24)
        except Exception as e:
            print(f"ARIMA fit error for {reservoir}: {e}")
            continue

        last_date = df.index[-1].date()
        for i, val in enumerate(forecast):
            target = last_date + timedelta(weeks=i+1)
            SouthernWaterReservoirForecast.objects.update_or_create(
                reservoir=reservoir,
                date=target,
                model_type="ARIMA",
                defaults={"predicted_level": round(float(val),2)},
            )
        print(f"ARIMA forecast for {reservoir}: {[round(float(x),2) for x in forecast]}")
    return "arima"



@shared_task
def generate_southern_lstm_forecast():
    """
    Generate LSTM-based forecasts for Southern Water reservoirs and save predictions to the DB.
    """
    qs = SouthernWaterReservoirLevel.objects.order_by("reservoir", "date")
    if not qs.exists():
        return "no data"

    for reservoir in qs.values_list("reservoir", flat=True).distinct():
        res_qs = qs.filter(reservoir=reservoir)
        if res_qs.count() < 30:
            continue  # not enough data for robust prediction

        # Build dataframe and match column names to what the LSTM expects
        df = pd.DataFrame(res_qs.values("date", "current_level"))
        df = df.rename(columns={"current_level": "percentage"})

        # Predict 6 months (~24 weeks) of reservoir levels
        preds = train_lstm(df, steps=24)

        last_date = res_qs.last().date
        for i, val in enumerate(preds):
            target = last_date + timedelta(weeks=i+1)
            SouthernWaterReservoirForecast.objects.update_or_create(
                reservoir=reservoir,
                date=target,
                model_type="LSTM",
                defaults={"predicted_level": round(float(val), 2)},
            )
    return "lstm"

@shared_task
def monthly_southernwater_predictions():
    fetch_southern_water_levels.delay()
    generate_southern_arima_forecast.delay()
    generate_southern_lstm_forecast.delay()
    return "scheduled"
