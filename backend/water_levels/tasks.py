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
from .scraper.scottish_water.scottish_water_scrapper import extract_scottish_water_levels

# Scottish Water Wide
from .ml.scottish_water.wide.scottish_water_wide_arima_model_trained import generate_scottish_water_wide_arima_forecast
from .ml.scottish_water.wide.scottish_water_wide_lstm_model_trained import generate_scottish_water_wide_lstm_forecast
from .ml.scottish_water.wide.scottish_water_wide_regression_model_trained import generate_scottish_water_wide_regression_forecast
from .model_effiency.scottish_water.wide.scottish_water_wide_model_accuracy import calculate_scottish_water_wide_accuracy

# Scottish Water Regional
from .ml.scottish_water.regional.scottish_water_regional_arima_model_trained import generate_scottish_water_regional_arima_forecast
from .ml.scottish_water.regional.scottish_water_regional_lstm_model_trained import generate_scottish_water_regional_lstm_forecast
from .ml.scottish_water.regional.scottish_water_regional_regression_model_trained import generate_scottish_water_regional_regression_forecast
from .model_effiency.scottish_water.regional.scottish_water_regional_model_accuracy import calculate_scottish_water_regional_accuracy

@shared_task
def fetch_scottish_water_forecasts():
    """Fetch Scottish Water resource levels and store them."""
    count, _ = extract_scottish_water_levels()
    return count


@shared_task
def weekly_scottish_water_wide_predictions():
    generate_scottish_water_wide_arima_forecast.delay()
    generate_scottish_water_wide_lstm_forecast.delay()
    generate_scottish_water_wide_regression_forecast.delay()
    calculate_scottish_water_wide_accuracy.delay()
    return "scheduled"

@shared_task
def weekly_scottish_water_regional_predictions():
    generate_scottish_water_regional_arima_forecast.delay()
    generate_scottish_water_regional_lstm_forecast.delay()
    generate_scottish_water_regional_regression_forecast.delay()
    calculate_scottish_water_regional_accuracy.delay()
    return "scheduled"

@shared_task
def generate_scottish_regional_forecasts(): #todo: improve this
    """Generate forecasts for each Scottish Water region."""
    from .models import (
        ScottishWaterRegionalLevel,
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
