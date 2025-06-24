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
from sklearn.linear_model import LinearRegression
import numpy as np

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
def generate_scottish_arima_forecast():
    """Generate 4-week ARIMA forecast for Scottish Water average levels."""
    from .models import ScottishWaterAverageLevel, ScottishWaterForecast
    import pandas as pd
    from statsmodels.tsa.arima.model import ARIMA
    from datetime import timedelta

    qs = ScottishWaterAverageLevel.objects.order_by("date")
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "current"))
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").asfreq("W")
    df["current"] = df["current"].interpolate()

    model = ARIMA(df["current"], order=(2, 1, 2))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=4)

    last_date = qs.last().date
    for i, value in enumerate(forecast):
        target_date = last_date + timedelta(weeks=i + 1)
        ScottishWaterForecast.objects.update_or_create(
            date=target_date,
            model_type="ARIMA",
            defaults={"predicted_percentage": round(float(value), 2)},
        )
    return "ARIMA forecast complete"


@shared_task
def generate_scottish_lstm_forecast():
    """Generate 4-week LSTM forecast for Scottish Water average levels."""
    from .models import ScottishWaterAverageLevel, ScottishWaterForecast
    from ml.lstm_model import train_lstm
    import pandas as pd
    from datetime import timedelta

    qs = ScottishWaterAverageLevel.objects.order_by("date")
    if qs.count() < 30:
        return "Not enough data"

    df = pd.DataFrame(qs.values("date", "current"))
    df = df.rename(columns={"current": "percentage"})
    preds = train_lstm(df, steps=4)
    last_date = qs.last().date

    for i, val in enumerate(preds):
        target = last_date + timedelta(weeks=i + 1)
        ScottishWaterForecast.objects.update_or_create(
            date=target,
            model_type="LSTM",
            defaults={"predicted_percentage": round(float(val), 2)},
        )
    return "LSTM forecast complete"


@shared_task
def generate_scottish_regression_forecast():
    """Generate regression-based forecast for Scottish Water average levels."""
    from .models import ScottishWaterAverageLevel, ScottishWaterForecast
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    from datetime import timedelta

    qs = ScottishWaterAverageLevel.objects.order_by("date")
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "current"))
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").asfreq("W")
    df["current"] = df["current"].interpolate()

    df["t"] = np.arange(len(df))
    period = 52
    df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
    df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
    X = sm.add_constant(df[["t", "sin_t", "cos_t"]])
    model = sm.OLS(df["current"], X).fit()

    last_t = df["t"].iloc[-1]
    last_date = qs.last().date
    for i in range(1, 5):
        t = last_t + i
        sin_t = np.sin(2 * np.pi * t / period)
        cos_t = np.cos(2 * np.pi * t / period)
        X_new = sm.add_constant(
            pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
            has_constant="add",
        )
        pred = model.predict(X_new)[0]
        target = last_date + timedelta(weeks=i)
        ScottishWaterForecast.objects.update_or_create(
            date=target,
            model_type="REGRESSION",
            defaults={"predicted_percentage": round(float(pred), 2)},
        )
    return "REGRESSION forecast complete"


@shared_task
def weekly_scottish_predictions():
    generate_scottish_arima_forecast.delay()
    generate_scottish_lstm_forecast.delay()
    generate_scottish_regression_forecast.delay()
    return "scheduled"


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
def generate_regression_forecast():
    """Generate simple sin/cos regression forecast for Severn Trent."""
    from .models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    from datetime import timedelta

    qs = SevernTrentReservoirLevel.objects.order_by("date")
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "percentage"))
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").asfreq("W-MON")
    df["percentage"] = df["percentage"].interpolate()

    df["t"] = np.arange(len(df))
    period = 52
    df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
    df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
    X = sm.add_constant(df[["t", "sin_t", "cos_t"]])
    model = sm.OLS(df["percentage"], X).fit()

    last_t = df["t"].iloc[-1]
    last_date = qs.last().date
    for i in range(1, 5):
        t = last_t + i
        sin_t = np.sin(2 * np.pi * t / period)
        cos_t = np.cos(2 * np.pi * t / period)
        X_new = sm.add_constant(
            pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
            has_constant="add",
        )
        pred = model.predict(X_new)[0]
        target = last_date + timedelta(weeks=i)
        SevernTrentReservoirForecast.objects.update_or_create(
            date=target,
            model_type="REGRESSION",
            defaults={"predicted_percentage": round(float(pred), 2)},
        )
    return "REGRESSION forecast complete"


@shared_task
def weekly_severn_trent_predictions():
    generate_arima_forecast.delay()
    generate_lstm_forecast.delay()
    generate_regression_forecast.delay()
    return "scheduled"


@shared_task
def generate_yorkshire_arima_forecast():
    """Generate 4-month ARIMA forecast for Yorkshire Water."""
    from ml.yorkshire_arima_model import generate_arima_forecast as _gen

    _gen()
    return "ARIMA forecast complete"


@shared_task
def generate_yorkshire_regression_forecast():
    """Generate regression-based forecast for Yorkshire Water."""
    from ml.yorkshire_regression_model import generate_regression_forecast as _gen

    _gen()
    return "REGRESSION forecast complete"


@shared_task
def fetch_yorkshire_water_reports():
    from .scraper.yorkshire_pdf_scraper import scrape_site
    from ml.yorkshire_lstm_model import train_and_predict_yorkshire
    from ml.yorkshire_arima_model import generate_arima_forecast as _gen_arima
    from ml.yorkshire_regression_model import generate_regression_forecast as _gen_reg

    inserted = scrape_site()
    if inserted:
        train_and_predict_yorkshire()
        _gen_arima()
        _gen_reg()
    return "done"

@shared_task
def run_yorkshire_lstm_prediction_task():
    """Generate monthly Yorkshire predictions using both models."""
    from ml.yorkshire_lstm_model import train_and_predict_yorkshire
    from ml.yorkshire_arima_model import generate_arima_forecast as _gen_arima
    from ml.yorkshire_regression_model import generate_regression_forecast as _gen_reg

    train_and_predict_yorkshire()
    _gen_arima()
    _gen_reg()
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
def generate_southern_regression_forecast():
    """Generate regression-based forecasts for Southern Water reservoirs."""
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    qs = SouthernWaterReservoirLevel.objects.order_by("reservoir", "date")
    if not qs.exists():
        return "no data"

    for reservoir in qs.values_list("reservoir", flat=True).distinct():
        res_qs = qs.filter(reservoir=reservoir)
        if res_qs.count() < 12:
            continue

        df = pd.DataFrame(res_qs.values("date", "current_level"))
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index().resample("W").ffill()
        if df["current_level"].isnull().all():
            continue

        df["current_level"] = df["current_level"].interpolate()
        df["t"] = np.arange(len(df))
        period = 52
        df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
        df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
        X = sm.add_constant(df[["t", "sin_t", "cos_t"]], has_constant="add")
        model = sm.OLS(df["current_level"], X).fit()

        last_t = df["t"].iloc[-1]
        last_date = df.index[-1].date()
        for i in range(1, 25):
            t = last_t + i
            sin_t = np.sin(2 * np.pi * t / period)
            cos_t = np.cos(2 * np.pi * t / period)
            X_new = sm.add_constant(
                pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
                has_constant="add",
            )
            pred = model.predict(X_new)[0]
            target = last_date + timedelta(weeks=i)
            SouthernWaterReservoirForecast.objects.update_or_create(
                reservoir=reservoir,
                date=target,
                model_type="REGRESSION",
                defaults={"predicted_level": round(float(pred), 2)},
            )
    return "regression"



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
    generate_southern_regression_forecast.delay()
    return "scheduled"

from .models import GroundwaterStation, GroundwaterLevel
from .utils import get_region

@shared_task
def import_historical_groundwater_levels():
    stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
    params = {"observedProperty": "groundwaterLevel"}
    response = requests.get(stations_url, params=params, headers={"Accept": "application/json"})
    response.raise_for_status()
    data = response.json()

    for item in data.get("items", []):
        station_id = item["notation"]
        name = item.get("label", station_id)
        lat = float(item.get("lat", 0))
        lon = float(item.get("long", 0))
        region = get_region(lat, lon)

        station, _ = GroundwaterStation.objects.get_or_create(
            station_id=station_id,
            defaults={"name": name, "region": region, "latitude": lat, "longitude": lon},
        )

        measures_url = f"https://environment.data.gov.uk/hydrology/id/measures?station={station_id}"
        measures_response = requests.get(measures_url, headers={"Accept": "application/json"}, timeout=10)
        measures = measures_response.json().get("items", [])

        for measure in measures:
            measure_id = measure["@id"]
            readings_url = "https://environment.data.gov.uk/hydrology/data/readings"
            readings_params = {"measure": measure_id, "_limit": 10000}
            readings_response = requests.get(readings_url, params=readings_params, headers={"Accept": "application/json"}, timeout=10)
            readings = readings_response.json().get("items", [])

            for r in readings:
                value = r.get("value")
                if value is None or r.get("quality") == "Missing":
                    continue
                dt_str = r.get("dateTime") or r.get("date")
                dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S" if "T" in dt_str else "%Y-%m-%d").date()
                GroundwaterLevel.objects.update_or_create(
                    station=station,
                    date=dt,
                    defaults={"value": value, "quality": r.get("quality", "Unknown")},
                )

@shared_task
def fetch_current_groundwater_levels():
    stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
    params = {"observedProperty": "groundwaterLevel"}
    response = requests.get(stations_url, params=params, headers={"Accept": "application/json"})
    response.raise_for_status()
    data = response.json()

    for item in data.get("items", []):
        station_id = item["notation"]
        name = item.get("label", station_id)
        lat = float(item.get("lat", 0))
        lon = float(item.get("long", 0))
        region = get_region(lat, lon)

        station, _ = GroundwaterStation.objects.get_or_create(
            station_id=station_id,
            defaults={"name": name, "region": region, "latitude": lat, "longitude": lon},
        )

        measure_id = f"http://environment.data.gov.uk/hydrology/id/measures/{station_id}-gw-dipped-i-mAOD-qualified"
        readings_url = "https://environment.data.gov.uk/hydrology/data/readings"
        params = {"measure": measure_id, "_limit": 10000}
        readings_response = requests.get(readings_url, params=params, headers={"Accept": "application/json"}, timeout=10)
        readings = readings_response.json().get("items", [])

        if readings:
            latest = max(
                readings,
                key=lambda r: datetime.strptime(
                    r.get("dateTime") or r.get("date"),
                    "%Y-%m-%dT%H:%M:%S" if "T" in (r.get("dateTime") or "") else "%Y-%m-%d",
                ),
            )
            value = latest.get("value")
            if value is not None and latest.get("quality") != "Missing":
                dt_str = latest.get("dateTime") or latest.get("date")
                dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S" if "T" in dt_str else "%Y-%m-%d").date()
                GroundwaterLevel.objects.update_or_create(
                    station=station,
                    date=dt,
                    defaults={"value": value, "quality": latest.get("quality", "Unknown")},
                )


def get_region_timeseries(region):
    station_ids = GroundwaterStation.objects.filter(region=region).values_list("id", flat=True)
    levels = GroundwaterLevel.objects.filter(station_id__in=station_ids).values("date", "value")
    df = pd.DataFrame(list(levels))
    if df.empty:
        return pd.Series(dtype=float)
    df["date"] = pd.to_datetime(df["date"])
    df = df.groupby("date")["value"].mean().asfreq("W")
    return df.sort_index()


def predict_arima(df):
    """Return 16-week ARIMA forecast, suppressing convergence warnings."""
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=UserWarning)
        model = ARIMA(df, order=(2, 1, 2))
        fitted = model.fit()
    return fitted.forecast(steps=16)


def predict_regression(df):
    series = df.dropna().reset_index()
    series["t"] = np.arange(len(series))
    period = 52
    X = np.column_stack(
        [
            np.ones(len(series)),
            series["t"],
            np.sin(2 * np.pi * series["t"] / period),
            np.cos(2 * np.pi * series["t"] / period),
        ]
    )
    model = LinearRegression().fit(X, series["value"])
    preds = []
    last_t = series["t"].iloc[-1]
    for i in range(1, 17):
        t = last_t + i
        xt = np.array([[1, t, np.sin(2 * np.pi * t / period), np.cos(2 * np.pi * t / period)]])
        preds.append(model.predict(xt)[0])
    return preds


def predict_lstm(df):
    lstm_df = df.dropna().reset_index().rename(columns={"value": "percentage"})
    return train_lstm(lstm_df, steps=16)


@shared_task
def train_groundwater_prediction_models():
    from .models import GroundwaterPrediction

    for region in ["north", "south", "east", "west"]:
        series = get_region_timeseries(region)
        if len(series.dropna()) < 32:
            continue

        last_date = series.index[-1]

        arima_preds = predict_arima(series)
        lstm_preds = predict_lstm(series)
        reg_preds = predict_regression(series)

        for i in range(16):
            pred_date = last_date + timedelta(weeks=i + 1)
            GroundwaterPrediction.objects.update_or_create(
                region=region,
                model_type="ARIMA",
                date=pred_date,
                defaults={"predicted_value": float(arima_preds.iloc[i])},
            )
            GroundwaterPrediction.objects.update_or_create(
                region=region,
                model_type="LSTM",
                date=pred_date,
                defaults={"predicted_value": float(lstm_preds[i])},
            )
            GroundwaterPrediction.objects.update_or_create(
                region=region,
                model_type="REGRESSION",
                date=pred_date,
                defaults={"predicted_value": float(reg_preds[i])},
            )
    return "predictions updated"


@shared_task
def calculate_prediction_accuracy():
    """Compare predictions with actual groundwater levels and store accuracy."""
    from django.db.models import Avg
    from .models import (
        GroundwaterPrediction,
        GroundwaterLevel,
        GroundwaterPredictionAccuracy,
    )

    today = datetime.today().date()

    predictions = GroundwaterPrediction.objects.filter(date__lte=today)
    for pred in predictions:
        actual = GroundwaterLevel.objects.filter(
            station__region=pred.region, date=pred.date
        ).aggregate(avg_value=Avg("value"))

        actual_value = actual["avg_value"]
        if actual_value is not None:
            error = abs((actual_value - pred.predicted_value) / actual_value) * 100
            GroundwaterPredictionAccuracy.objects.update_or_create(
                region=pred.region,
                date=pred.date,
                model_type=pred.model_type,
                defaults={
                    "predicted_value": pred.predicted_value,
                    "actual_value": actual_value,
                    "percentage_error": round(error, 2),
                },
            )
        else:
            print(
                f"Actual data not available for {pred.region} {pred.date} ({pred.model_type})"
            )
    return "accuracy updated"


@shared_task
def calculate_severn_trent_accuracy():
    """Calculate accuracy of Severn Trent reservoir forecasts."""
    from .models import (
        SevernTrentReservoirForecast,
        SevernTrentReservoirLevel,
        SevernTrentForecastAccuracy,
    )

    today = datetime.today().date()
    forecasts = SevernTrentReservoirForecast.objects.filter(date__lte=today)
    for f in forecasts:
        actual = SevernTrentReservoirLevel.objects.filter(date=f.date).first()
        if actual:
            error = abs((actual.percentage - f.predicted_percentage) / actual.percentage) * 100
            SevernTrentForecastAccuracy.objects.update_or_create(
                date=f.date,
                model_type=f.model_type,
                defaults={
                    "predicted_percentage": f.predicted_percentage,
                    "actual_percentage": actual.percentage,
                    "percentage_error": round(error, 2),
                },
            )
        else:
            print(f"Actual data missing for {f.date} {f.model_type}")
    return "severn accuracy updated"


@shared_task
def calculate_yorkshire_accuracy():
    """Calculate accuracy of Yorkshire Water predictions."""
    from .models import (
        YorkshireWaterPrediction,
        YorkshireWaterReport,
        YorkshireWaterPredictionAccuracy,
    )

    today = datetime.today().date()
    preds = YorkshireWaterPrediction.objects.filter(date__lte=today)
    for p in preds:
        report = YorkshireWaterReport.objects.filter(report_month=p.date).first()
        if report:
            res_error = abs((report.reservoir_percent - p.predicted_reservoir_percent) / report.reservoir_percent) * 100 if report.reservoir_percent else None
            dem_error = None
            if report.demand_megalitres_per_day:
                dem_error = abs((report.demand_megalitres_per_day - p.predicted_demand_mld) / report.demand_megalitres_per_day) * 100
            YorkshireWaterPredictionAccuracy.objects.update_or_create(
                date=p.date,
                model_type=p.model_type,
                defaults={
                    "predicted_reservoir_percent": p.predicted_reservoir_percent,
                    "actual_reservoir_percent": report.reservoir_percent,
                    "reservoir_error": round(res_error, 2) if res_error is not None else None,
                    "predicted_demand_mld": p.predicted_demand_mld,
                    "actual_demand_mld": report.demand_megalitres_per_day,
                    "demand_error": round(dem_error, 2) if dem_error is not None else None,
                },
            )
        else:
            print(f"No report for {p.date}")
    return "yorkshire accuracy updated"


@shared_task
def calculate_southernwater_accuracy():
    """Calculate accuracy of Southern Water forecasts."""
    from .models import (
        SouthernWaterReservoirForecast,
        SouthernWaterReservoirLevel,
        SouthernWaterForecastAccuracy,
    )

    today = datetime.today().date()
    forecasts = SouthernWaterReservoirForecast.objects.filter(date__lte=today)
    for f in forecasts:
        actual = SouthernWaterReservoirLevel.objects.filter(reservoir=f.reservoir, date=f.date).first()
        if actual:
            error = abs((actual.current_level - f.predicted_level) / actual.current_level) * 100
            SouthernWaterForecastAccuracy.objects.update_or_create(
                reservoir=f.reservoir,
                date=f.date,
                model_type=f.model_type,
                defaults={
                    "predicted_level": f.predicted_level,
                    "actual_level": actual.current_level,
                    "percentage_error": round(error, 2),
                },
            )
        else:
            print(f"Actual data missing for {f.reservoir} {f.date} {f.model_type}")
    return "southern accuracy updated"


@shared_task
def calculate_scottishwater_accuracy():
    """Placeholder accuracy calculation for Scottish Water predictions."""
    from .models import (
        ScottishWaterPredictionAccuracy,
        ScottishWaterRegionalLevel,
    )
    # This assumes predictions exist in ScottishWaterPredictionAccuracy model
    today = datetime.today().date()
    records = ScottishWaterPredictionAccuracy.objects.filter(date__lte=today)
    for rec in records:
        actual = ScottishWaterRegionalLevel.objects.filter(area=rec.area, date=rec.date).first()
        if actual and rec.predicted_value:
            error = abs((actual.current - rec.predicted_value) / actual.current) * 100
            rec.actual_value = actual.current
            rec.percentage_error = round(error, 2)
            rec.save()
    return "scottish accuracy updated"
