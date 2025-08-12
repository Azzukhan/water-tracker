from datetime import datetime
import os
import sys
import django
from celery import shared_task
from .ml.general_lstm.lstm import train_lstm

# Yorkshire Water
from .scraper.yorkshire.yorkshire_pdf_scraper import scrape_site
from .ml.yorkshire.yorkshire_lstm_model import generate_yorkshire_lstm_forecast
from .ml.yorkshire.yorkshire_arima_model import generate_yorkshire_arima_forecast
from .ml.yorkshire.yorkshire_regression_model import generate_yorkshire_regression_forecast
from .model_effiency.yorkshire.yorkshire_model_accuracy import calculate_yorkshire_accuracy

# Severn Trent
from .ml.severn_trent.severn_trent_arima_model_trained import generate_severn_trent_arima_forecast
from .ml.severn_trent.severn_trent_lstm_model_trained import generate_severn_trent_lstm_forecast
from .ml.severn_trent.severn_trent_regression_model_trained import generate_severn_trent_regression_forecast
from .scraper.severn_trent.severn_trent_scrapper import extract_severn_trent_water_levels
from .model_effiency.severn_trent.severn_trent_model_accuracy import calculate_severn_trent_accuracy

# Southern Water
from .scraper.southern_water.southern_water_scrapper import extract_southern_water_levels
from .ml.southern_water.southern_water_arima_model_trained import generate_southern_arima_forecast
from .ml.southern_water.southern_water_regression_model_trained import generate_southern_regression_forecast
from .ml.southern_water.southern_water_lstm_model_trained import generate_southern_lstm_forecast
from .model_effiency.southern_water.southern_water_model_accuracy import calculate_southernwater_accuracy

# EA Water
from .scraper.environment_agency.EA_Stations_scraper import extract_EA_stations_water_levels
from .ml.environment_agency.EA_stations_arima_trained import generate_EA_station_arima_forecast
from .ml.environment_agency.EA_stations_lstm_trained import generate_EA_station_lstm_forecast
from .ml.environment_agency.EA_stations_regression_trained import generate_EA_station_regression_forecast
from .model_effiency.environment_agency.EA_stations_model_accuracy import calculate_EA_stations_water_prediction_accuracy
# Scottish Water
from .models import EAwaterStation, EAwaterLevel, EAwaterPrediction, EAwaterPredictionAccuracy
if __package__ in (None, ""):
    # Allow running this module as a standalone script for quick testing
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()
    from water_levels.utils import fetch_scottish_water_resource_levels
else:
    from .models import (
        EAwaterPrediction,
        EAwaterPredictionAccuracy
    )
    from .utils import fetch_scottish_water_resource_levels

from water_levels.models import EAwaterStation, EAwaterLevel
from water_levels.utils import get_region

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
    calculate_severn_trent_accuracy.delay()
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
    calculate_yorkshire_accuracy.delay()
    return "scheduled"


@shared_task
def fetch_and_generate_southern_water_forecasts():
    extract_southern_water_levels()
    generate_southern_arima_forecast()
    generate_southern_lstm_forecast()
    generate_southern_regression_forecast()
    return "done"


@shared_task
def weekly_southernwater_predictions():
    """Generate Southern Water forecasts and calculate accuracy."""
    generate_southern_arima_forecast.delay()
    generate_southern_lstm_forecast.delay()
    generate_southern_regression_forecast.delay()
    calculate_southernwater_accuracy.delay()
    return "scheduled"

def fetch_and_generate_EA_stations_water_forecasts():
    extract_EA_stations_water_levels()
    generate_EA_station_arima_forecast()
    generate_EA_station_lstm_forecast()
    generate_EA_station_regression_forecast()
    calculate_EA_stations_water_prediction_accuracy()
    return "done"

def weekly_EA_stations_water_predictions():
    generate_EA_station_arima_forecast.delay()
    generate_EA_station_lstm_forecast.delay()
    generate_EA_station_regression_forecast.delay()
    calculate_EA_stations_water_prediction_accuracy.delay()
    return "done"    


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
