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
from .ml.general_lstm.lstm import train_lstm
from sklearn.linear_model import LinearRegression
import numpy as np

# Yorkshire Water
from .scraper.yorkshire.yorkshire_pdf_scraper import scrape_site
from .ml.yorkshire.yorkshire_lstm_model import generate_yorkshire_lstm_forecast
from .ml.yorkshire.yorkshire_arima_model import generate_yorkshire_arima_forecast
from .ml.yorkshire.yorkshire_regression_model import generate_yorkshire_regression_forecast

# Severn Trent
from .ml.severn_trent.severn_trent_arima_model_trained import generate_severn_trent_arima_forecast
from .ml.severn_trent.severn_trent_lstm_model_trained import generate_severn_trent_lstm_forecast
from .ml.severn_trent.severn_trent_regression_model_trained import generate_severn_trent_regression_forecast
from .scraper.severn_trent.severn_trent_scrapper import extract_severn_trent_water_levels

# Southern Water
from .scraper.southern_water.southern_water_scrapper import extract_southern_water_levels
from .ml.southern_water.southern_water_arima_model_trained import generate_southern_arima_forecast
from .ml.southern_water.southern_water_regression_model_trained import generate_southern_regression_forecast
from .ml.southern_water.southern_water_lstm_model_trained import generate_southern_lstm_forecast

if __package__ in (None, ""):
    # Allow running this module as a standalone script for quick testing
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()
    from water_levels.utils import fetch_scottish_water_resource_levels
else:
    from .models import (
        EnglandwaterPrediction,
        EnglandwaterPredictionAccuracy
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
    # Scottish Water data is reported weekly on Mondays, so align to that
    df = df.set_index("date").asfreq("W-MON")
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
    from .ml.general_lstm.lstm import train_lstm
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
    # Align to weekly Mondays for consistent time series
    df = df.set_index("date").asfreq("W-MON")
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
def generate_scottish_regional_forecasts(): #todo: improve this
    """Generate forecasts for each Scottish Water region."""
    from .models import (
        ScottishWaterRegionalLevel,
        ScottishWaterPredictionAccuracy,
        ScottishWaterRegionalForecast,
    )
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    from statsmodels.tsa.arima.model import ARIMA
    from datetime import timedelta

    areas = ScottishWaterRegionalLevel.objects.values_list("area", flat=True).distinct()

    for area in areas:
        qs = ScottishWaterRegionalLevel.objects.filter(area=area).order_by("date")
        if qs.count() < 12:
            continue

        df = pd.DataFrame(qs.values("date", "current"))
        df["date"] = pd.to_datetime(df["date"])
        # Align regional data to Mondays to avoid dropping every entry
        df = df.set_index("date").asfreq("W-MON")
        df["current"] = df["current"].interpolate()

        arima_model = ARIMA(df["current"], order=(2, 1, 2)).fit()
        arima_preds = arima_model.forecast(steps=4)

        lstm_df = df.reset_index().rename(columns={"current": "percentage"})
        lstm_preds = train_lstm(lstm_df, steps=4)

        df["t"] = np.arange(len(df))
        period = 52
        df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
        df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
        X = sm.add_constant(df[["t", "sin_t", "cos_t"]])
        reg_model = sm.OLS(df["current"], X).fit()

        last_t = df["t"].iloc[-1]
        reg_preds = []
        for i in range(1, 5):
            t = last_t + i
            sin_t = np.sin(2 * np.pi * t / period)
            cos_t = np.cos(2 * np.pi * t / period)
            X_new = sm.add_constant(
                pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
                has_constant="add",
            )
            reg_preds.append(reg_model.predict(X_new)[0])

        last_date = qs.last().date
        for i in range(4):
            target = last_date + timedelta(weeks=i + 1)
            ScottishWaterPredictionAccuracy.objects.update_or_create(
                area=area,
                date=target,
                model_type="ARIMA",
                defaults={"predicted_value": round(float(arima_preds.iloc[i]), 2)},
            )
            ScottishWaterPredictionAccuracy.objects.update_or_create(
                area=area,
                date=target,
                model_type="LSTM",
                defaults={"predicted_value": round(float(lstm_preds[i]), 2)},
            )
            ScottishWaterPredictionAccuracy.objects.update_or_create(
                area=area,
                date=target,
                model_type="REGRESSION",
                defaults={"predicted_value": round(float(reg_preds[i]), 2)},
            )

            ScottishWaterRegionalForecast.objects.update_or_create(
                area=area,
                date=target,
                model_type="ARIMA",
                defaults={"predicted_level": round(float(arima_preds.iloc[i]), 2)},
            )
            ScottishWaterRegionalForecast.objects.update_or_create(
                area=area,
                date=target,
                model_type="LSTM",
                defaults={"predicted_level": round(float(lstm_preds[i]), 2)},
            )
            ScottishWaterRegionalForecast.objects.update_or_create(
                area=area,
                date=target,
                model_type="REGRESSION",
                defaults={"predicted_level": round(float(reg_preds[i]), 2)},
            )

    return "regional forecasts complete"


@shared_task
def fetch_and_generate_severn_trent_forecasts():
    extract_severn_trent_water_levels()
    generate_severn_trent_arima_forecast()
    generate_severn_trent_lstm_forecast()
    generate_severn_trent_regression_forecast()
    return "done"



@shared_task
def weekly_severn_trent_predictions():
    generate_severn_trent_arima_forecast.delay()
    generate_severn_trent_lstm_forecast.delay()
    generate_severn_trent_regression_forecast.delay()
    return "scheduled"



@shared_task
def fetch_and_generate_yorkshire_water_forecasts():
    
    inserted = scrape_site()
    if inserted:
        generate_yorkshire_lstm_forecast()
        generate_yorkshire_arima_forecast()
        generate_yorkshire_regression_forecast()
    return "done"

@shared_task
def monthly_yorkshire_predictions():
    generate_yorkshire_arima_forecast.delay()
    generate_yorkshire_lstm_forecast.delay()
    generate_yorkshire_regression_forecast.delay()
    return "scheduled"


@shared_task
def fetch_and_generate_southern_water_forecasts():
    extract_southern_water_levels()
    generate_southern_arima_forecast()
    generate_southern_lstm_forecast()
    generate_southern_regression_forecast()
    return "done"


@shared_task
def Weekly_southernwater_predictions():
    extract_southern_water_levels.delay()
    generate_southern_arima_forecast.delay()
    generate_southern_lstm_forecast.delay()
    generate_southern_regression_forecast.delay()
    return "scheduled"


from .models import EnglandwaterStation, EnglandwaterLevel
from .utils import get_region


@shared_task
def import_historical_englandwater_levels():
    stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
    params = {"observedProperty": "groundwaterLevel"}
    response = requests.get(
        stations_url, params=params, headers={"Accept": "application/json"}
    )
    response.raise_for_status()
    data = response.json()

    for item in data.get("items", []):
        station_id = item["notation"]
        name = item.get("label", station_id)
        lat = float(item.get("lat", 0))
        lon = float(item.get("long", 0))
        region = get_region(lat, lon)

        station, _ = EnglandwaterStation.objects.get_or_create(
            station_id=station_id,
            defaults={
                "name": name,
                "region": region,
                "latitude": lat,
                "longitude": lon,
            },
        )

        measures_url = f"https://environment.data.gov.uk/hydrology/id/measures?station={station_id}"
        measures_response = requests.get(
            measures_url, headers={"Accept": "application/json"}, timeout=10
        )
        measures = measures_response.json().get("items", [])

        for measure in measures:
            measure_id = measure["@id"]
            readings_url = "https://environment.data.gov.uk/hydrology/data/readings"
            readings_params = {"measure": measure_id, "_limit": 10000}
            readings_response = requests.get(
                readings_url,
                params=readings_params,
                headers={"Accept": "application/json"},
                timeout=10,
            )
            readings = readings_response.json().get("items", [])

            for r in readings:
                value = r.get("value")
                if value is None or r.get("quality") == "Missing":
                    continue
                dt_str = r.get("dateTime") or r.get("date")
                dt = datetime.strptime(
                    dt_str, "%Y-%m-%dT%H:%M:%S" if "T" in dt_str else "%Y-%m-%d"
                ).date()
                EnglandwaterLevel.objects.update_or_create(
                    station=station,
                    date=dt,
                    defaults={"value": value, "quality": r.get("quality", "Unknown")},
                )


@shared_task
def fetch_current_englandwater_levels():
    stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
    params = {"observedProperty": "groundwaterLevel"}
    response = requests.get(
        stations_url, params=params, headers={"Accept": "application/json"}
    )
    response.raise_for_status()
    data = response.json()

    for item in data.get("items", []):
        station_id = item["notation"]
        name = item.get("label", station_id)
        lat = float(item.get("lat", 0))
        lon = float(item.get("long", 0))
        region = get_region(lat, lon)

        station, _ = EnglandwaterStation.objects.get_or_create(
            station_id=station_id,
            defaults={
                "name": name,
                "region": region,
                "latitude": lat,
                "longitude": lon,
            },
        )

        measure_id = f"http://environment.data.gov.uk/hydrology/id/measures/{station_id}-gw-dipped-i-mAOD-qualified"
        readings_url = "https://environment.data.gov.uk/hydrology/data/readings"
        params = {"measure": measure_id, "_limit": 10000}
        readings_response = requests.get(
            readings_url,
            params=params,
            headers={"Accept": "application/json"},
            timeout=10,
        )
        readings = readings_response.json().get("items", [])

        if readings:
            latest = max(
                readings,
                key=lambda r: datetime.strptime(
                    r.get("dateTime") or r.get("date"),
                    (
                        "%Y-%m-%dT%H:%M:%S"
                        if "T" in (r.get("dateTime") or "")
                        else "%Y-%m-%d"
                    ),
                ),
            )
            value = latest.get("value")
            if value is not None and latest.get("quality") != "Missing":
                dt_str = latest.get("dateTime") or latest.get("date")
                dt = datetime.strptime(
                    dt_str, "%Y-%m-%dT%H:%M:%S" if "T" in dt_str else "%Y-%m-%d"
                ).date()
                EnglandwaterLevel.objects.update_or_create(
                    station=station,
                    date=dt,
                    defaults={
                        "value": value,
                        "quality": latest.get("quality", "Unknown"),
                    },
                )


def get_region_timeseries(region):
    station_ids = EnglandwaterStation.objects.filter(region=region).values_list(
        "id", flat=True
    )
    levels = EnglandwaterLevel.objects.filter(station_id__in=station_ids).values(
        "date", "value"
    )
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
        xt = np.array(
            [[1, t, np.sin(2 * np.pi * t / period), np.cos(2 * np.pi * t / period)]]
        )
        preds.append(model.predict(xt)[0])
    return preds


def predict_lstm(df):
    lstm_df = df.dropna().reset_index().rename(columns={"value": "percentage"})
    return train_lstm(lstm_df, steps=16)


@shared_task
def train_englandwater_prediction_models():
    from .models import EnglandwaterPrediction

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
            EnglandwaterPrediction.objects.update_or_create(
                region=region,
                model_type="ARIMA",
                date=pred_date,
                defaults={"predicted_value": float(arima_preds.iloc[i])},
            )
            EnglandwaterPrediction.objects.update_or_create(
                region=region,
                model_type="LSTM",
                date=pred_date,
                defaults={"predicted_value": float(lstm_preds[i])},
            )
            EnglandwaterPrediction.objects.update_or_create(
                region=region,
                model_type="REGRESSION",
                date=pred_date,
                defaults={"predicted_value": float(reg_preds[i])},
            )
    return "predictions updated"


from django.db.models import Avg
from datetime import datetime, timedelta

@shared_task
def calculate_Englandwater_prediction_accuracy():
    today = datetime.today().date()
    model_types = ['ARIMA', 'LSTM', 'REGRESSION']

    regions = EnglandwaterLevel.objects.values_list('station__region', flat=True).distinct()
    for region in regions:
        # 1. Find latest actual date and value
        last_actual = (
            EnglandwaterLevel.objects
            .filter(station__region=region, date__lte=today)
            .values('date')
            .annotate(avg_actual=Avg('value'))
            .order_by('-date')
            .first()
        )
        if not last_actual:
            continue

        last_actual_date = last_actual['date']
        last_actual_value = last_actual['avg_actual']

        # 2. For each model, look for closest forecast within ±7 days
        for model_type in model_types:
            forecasts = (
                EnglandwaterPrediction.objects
                .filter(
                    region=region,
                    model_type=model_type,
                    date__gte=last_actual_date - timedelta(days=7),
                    date__lte=last_actual_date + timedelta(days=7),
                )
                .values('date', 'predicted_value')
            )

            if not forecasts:
                continue

            # 3. Find forecast with the smallest date difference to actual
            closest = min(
                forecasts,
                key=lambda f: abs((f['date'] - last_actual_date).days)
            )
            forecast_date = closest['date']
            predicted_value = closest['predicted_value']

            # 4. Calculate and store accuracy
            if last_actual_value is not None and predicted_value is not None:
                error = abs((last_actual_value - predicted_value) / last_actual_value) * 100
                EnglandwaterPredictionAccuracy.objects.update_or_create(
                    region=region,
                    date=forecast_date,
                    model_type=model_type,
                    defaults={
                        "predicted_value": predicted_value,
                        "actual_value": last_actual_value,
                        "percentage_error": round(error, 2),
                    },
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
            error = (
                abs((actual.percentage - f.predicted_percentage) / actual.percentage)
                * 100
            )
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
        YorkshireReservoirData,
        YorkshireWaterPredictionAccuracy,
    )
    from datetime import datetime

    today = datetime.today().date()
    preds = YorkshireWaterPrediction.objects.filter(date__lte=today)
    for p in preds:
        # Fixed field name
        report = YorkshireReservoirData.objects.filter(report_date=p.date).first()
        if report:
            res_error = (
                abs(
                    (report.reservoir_level - p.predicted_reservoir_percent)
                    / report.reservoir_level
                )
                * 100
                if report.reservoir_level
                else None
            )
            dem_error = None
            if hasattr(report, "demand_megalitres_per_day") and report.demand_megalitres_per_day:
                dem_error = (
                    abs(
                        (report.demand_megalitres_per_day - p.predicted_demand_mld)
                        / report.demand_megalitres_per_day
                    )
                    * 100
                )
            YorkshireWaterPredictionAccuracy.objects.update_or_create(
                date=p.date,
                model_type=p.model_type,
                defaults={
                    "predicted_reservoir_percent": p.predicted_reservoir_percent,
                    "actual_reservoir_percent": report.reservoir_level,
                    "reservoir_error": (
                        round(res_error, 2) if res_error is not None else None
                    ),
                    "predicted_demand_mld": p.predicted_demand_mld,
                    "actual_demand_mld": getattr(report, "demand_megalitres_per_day", None),
                    "demand_error": (
                        round(dem_error, 2) if dem_error is not None else None
                    ),
                },
            )
        else:
            print(f"No report for {p.date}")
    return "yorkshire accuracy updated"



from datetime import datetime, timedelta

@shared_task
def calculate_southernwater_accuracy():
    """Calculate accuracy of Southern Water forecasts for the most recent actual value per reservoir and model."""
    from .models import (
        SouthernWaterReservoirForecast,
        SouthernWaterReservoirLevel,
        SouthernWaterForecastAccuracy,
    )

    reservoirs = (
        SouthernWaterReservoirLevel.objects.values_list('reservoir', flat=True).distinct()
    )

    for reservoir in reservoirs:
        # Get latest actual value
        latest_actual = (
            SouthernWaterReservoirLevel.objects
            .filter(reservoir=reservoir)
            .order_by('-date')
            .first()
        )
        if not latest_actual:
            print(f"No actual data for {reservoir}")
            continue

        # Find available models for this reservoir's forecasts
        model_types = (
            SouthernWaterReservoirForecast.objects
            .filter(reservoir=reservoir)
            .values_list('model_type', flat=True)
            .distinct()
        )

        for model in model_types:
            # Find forecast closest to the latest actual date
            candidates = (
                SouthernWaterReservoirForecast.objects
                .filter(reservoir=reservoir, model_type=model)
            )
            if not candidates.exists():
                print(f"No forecast for {reservoir} {model}")
                continue

            # Find the forecast with minimum abs(date difference)
            closest = min(
                candidates,
                key=lambda f: abs((f.date - latest_actual.date).days)
            )

            actual_val = latest_actual.current_level
            predicted_val = closest.predicted_level
            try:
                error = abs((actual_val - predicted_val) / actual_val) * 100
            except ZeroDivisionError:
                error = 0.0

            SouthernWaterForecastAccuracy.objects.update_or_create(
                reservoir=reservoir,
                date=latest_actual.date,
                model_type=model,
                defaults={
                    "predicted_level": predicted_val,
                    "actual_level": actual_val,
                    "percentage_error": round(error, 2),
                },
            )
            print(f"Accuracy for {reservoir} {model} on {latest_actual.date}: pred={predicted_val} (forecast for {closest.date}), actual={actual_val}, error={round(error,2)}%")

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
        actual = ScottishWaterRegionalLevel.objects.filter(
            area=rec.area, date=rec.date
        ).first()
        if actual:
            error = abs((actual.current - rec.predicted_value) / actual.current) * 100
            rec.actual_value = actual.current
            rec.percentage_error = round(error, 2)
            rec.save()
    return "scottish accuracy updated"


@shared_task
def calculate_scottish_forecast_accuracy():
    """
    Calculate forecast accuracy for both Scotland-wide and regional predictions,
    using the latest available actual values.
    """
    from .models import (
        ScottishWaterForecast,
        ScottishWaterAverageLevel,
        ScottishWaterForecastAccuracy,
        ScottishWaterRegionalForecast,
        ScottishWaterRegionalLevel,
        ScottishWaterPredictionAccuracy,
    )

    ### Scotland-wide ###
    latest_actual = ScottishWaterAverageLevel.objects.order_by("-date").first()
    if latest_actual:
        forecasts = ScottishWaterForecast.objects.filter(date=latest_actual.date)
        if forecasts.exists():
            for f in forecasts:
                try:
                    error = (
                        abs((latest_actual.current - f.predicted_percentage) / latest_actual.current)
                        * 100
                    )
                except ZeroDivisionError:
                    error = 0.0
                ScottishWaterForecastAccuracy.objects.update_or_create(
                    date=f.date,
                    model_type=f.model_type,
                    defaults={
                        "predicted_percentage": f.predicted_percentage,
                        "actual_percentage": latest_actual.current,
                        "percentage_error": round(error, 2),
                    },
                )
                print(
                    f"[Scotland-wide] Accuracy for {f.model_type} on {f.date}: "
                    f"Prediction={f.predicted_percentage}, "
                    f"Actual={latest_actual.current}, Error={round(error,2)}%"
                )
        else:
            print(f"No forecasts for Scotland-wide {latest_actual.date}")
    else:
        print("No actual data for Scotland-wide.")

    ### Regional (per area) ###
    # Get all areas with actual data
    areas = (
        ScottishWaterRegionalLevel.objects.values_list('area', flat=True).distinct()
    )
    for area in areas:
        latest_area_actual = (
            ScottishWaterRegionalLevel.objects
            .filter(area=area)
            .order_by('-date')
            .first()
        )
        if not latest_area_actual:
            print(f"No actual for area {area}")
            continue

        forecasts = (
            ScottishWaterRegionalForecast.objects
            .filter(area=area, date=latest_area_actual.date)
        )
        if not forecasts.exists():
            print(f"No forecast for area {area} on {latest_area_actual.date}")
            continue

        for f in forecasts:
            try:
                error = (
                    abs((latest_area_actual.current - f.predicted_level) / latest_area_actual.current)
                    * 100
                )
            except ZeroDivisionError:
                error = 0.0
            ScottishWaterPredictionAccuracy.objects.update_or_create(
                area=area,
                date=f.date,
                model_type=f.model_type,
                defaults={
                    "predicted_value": f.predicted_level,
                    "actual_value": latest_area_actual.current,
                    "percentage_error": round(error, 2),
                },
            )
            print(
                f"[{area}] Accuracy for {f.model_type} on {f.date}: "
                f"Prediction={f.predicted_level}, "
                f"Actual={latest_area_actual.current}, Error={round(error,2)}%"
            )

    return "scottish (and regional) forecast accuracy updated"
