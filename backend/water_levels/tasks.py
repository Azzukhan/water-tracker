from celery import shared_task

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
    generate_scottish_water_wide_arima_forecast()
    generate_scottish_water_wide_lstm_forecast()
    generate_scottish_water_wide_regression_forecast()
    calculate_scottish_water_wide_accuracy()
    return "scheduled"

@shared_task
def weekly_scottish_water_regional_predictions():
    generate_scottish_water_regional_arima_forecast()
    generate_scottish_water_regional_lstm_forecast()
    generate_scottish_water_regional_regression_forecast()
    calculate_scottish_water_regional_accuracy()
    return "scheduled"

@shared_task
def fetch_and_generate_severn_trent_forecasts():
    extract_severn_trent_water_levels()
    return "done"

@shared_task
def weekly_severn_trent_predictions():
    generate_severn_trent_arima_forecast()
    generate_severn_trent_lstm_forecast()
    generate_severn_trent_regression_forecast()
    calculate_severn_trent_accuracy()
    return "scheduled"

@shared_task
def fetch_and_generate_yorkshire_water_forecasts():    
    scrape_site()
    return "done"

@shared_task
def monthly_yorkshire_predictions():
    generate_yorkshire_arima_forecast()
    generate_yorkshire_lstm_forecast()
    generate_yorkshire_regression_forecast()
    calculate_yorkshire_accuracy()
    return "scheduled"

@shared_task
def fetch_and_generate_southern_water_forecasts():
    extract_southern_water_levels()
    return "done"

@shared_task
def weekly_southernwater_predictions():
    generate_southern_arima_forecast()
    generate_southern_lstm_forecast()
    generate_southern_regression_forecast()
    calculate_southernwater_accuracy()
    return "scheduled"

@shared_task
def fetch_and_generate_EA_stations_water_forecasts():
    extract_EA_stations_water_levels()
    return "done"

@shared_task
def weekly_EA_stations_water_predictions():
    generate_EA_station_arima_forecast()
    generate_EA_station_lstm_forecast()
    generate_EA_station_regression_forecast()
    calculate_EA_stations_water_prediction_accuracy()
    return "done"    
