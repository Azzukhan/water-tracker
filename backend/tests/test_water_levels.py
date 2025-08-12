import datetime
import pytest
from water_levels.models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    ScottishWaterForecast,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
    SouthernWaterReservoirLevel,
    SouthernWaterReservoirForecast,
    EnglandwaterStation,
    EnglandwaterLevel,
    EnglandwaterPrediction,
    EnglandwaterPredictionAccuracy,
    ScottishWaterRegionalForecast,
    SevernTrentForecastAccuracy,
    YorkshireWaterPredictionAccuracy,
    SouthernWaterForecastAccuracy,
    ScottishWaterForecastAccuracy,
    ScottishWaterPredictionAccuracy,
)


@pytest.mark.django_db
def test_scottish_average_list(api_client):
    ScottishWaterAverageLevel.objects.create(
        date=datetime.date(2024, 1, 1),
        current=50.0,
        change_from_last_week=1.0,
        difference_from_average=-5.0,
    )
    resp = api_client.get("/api/water-levels/scottish-averages/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_scottish_regional_list(api_client):
    ScottishWaterRegionalLevel.objects.create(
        area="Test",
        date=datetime.date(2024, 1, 1),
        current=40.0,
        change_from_last_week=1.0,
        difference_from_average=-3.0,
    )
    resp = api_client.get("/api/water-levels/scottish-regions/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_scottish_forecast(api_client):
    ScottishWaterForecast.objects.create(
        date=datetime.date(2024, 1, 8), predicted_percentage=55.0, model_type="ARIMA"
    )
    resp = api_client.get("/api/water-levels/scottishwater/ARIMA/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_scottish_regional_forecast(api_client):
    ScottishWaterRegionalForecast.objects.create(
        area="north",
        date=datetime.date(2024, 1, 8),
        predicted_level=60.0,
        model_type="ARIMA",
    )
    resp = api_client.get("/api/water-levels/scottishwater/regional/north/ARIMA/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_severn_trent_levels(api_client):
    SevernTrentReservoirLevel.objects.create(
        date=datetime.date(2024, 1, 1), percentage=70.0
    )
    resp = api_client.get("/api/water-levels/severn-trent-reservoirs/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_severn_trent_forecast(api_client):
    SevernTrentReservoirForecast.objects.create(
        date=datetime.date(2024, 1, 8), predicted_percentage=75.0, model_type="ARIMA"
    )
    resp = api_client.get("/api/water-levels/severn-trent/forecast/")
    assert resp.status_code == 200



@pytest.mark.django_db
def test_yorkshire_predictions(api_client):
    YorkshireWaterPrediction.objects.create(
        date=datetime.date(2024, 1, 2),
        predicted_reservoir_percent=82.0,
        predicted_demand_mld=101.0,
        model_type="ARIMA",
    )
    resp = api_client.get("/api/water-levels/yorkshire-predictions/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_yorkshire_reservoir_data(api_client):
    YorkshireReservoirData.objects.create(
        report_date=datetime.date(2024, 1, 3),
        reservoir_level=81.0,
        weekly_difference=1.0,
        direction="UP",
    )
    resp = api_client.get("/api/water-levels/yorkshire/reservoir-data/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_southernwater_levels(api_client):
    SouthernWaterReservoirLevel.objects.create(
        reservoir="TestRes",
        date=datetime.date(2024, 1, 1),
        current_level=60.0,
        average_level=65.0,
        change_week=1.0,
        change_month=2.0,
        difference_from_average=-5.0,
    )
    resp = api_client.get("/api/water-levels/southernwater-reservoirs/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_southernwater_forecast(api_client):
    SouthernWaterReservoirForecast.objects.create(
        reservoir="TestRes",
        date=datetime.date(2024, 1, 8),
        predicted_level=62.0,
        model_type="ARIMA",
    )
    resp = api_client.get("/api/water-levels/southernwater/TestRes/ARIMA/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_englandwater_region_summary(api_client):
    station = EnglandwaterStation.objects.create(
        station_id="s1", name="S1", region="north"
    )
    EnglandwaterLevel.objects.create(
        station=station, date=datetime.date(2024, 1, 1), value=10.0
    )
    resp = api_client.get("/api/water-levels/groundwater/summary/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_englandwater_levels_list(api_client):
    station = EnglandwaterStation.objects.create(
        station_id="s1", name="S1", region="north"
    )
    EnglandwaterLevel.objects.create(
        station=station, date=datetime.date(2024, 1, 1), value=10.0
    )
    resp = api_client.get("/api/water-levels/groundwater-levels/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_englandwater_predictions(api_client):
    EnglandwaterPrediction.objects.create(
        region="north",
        model_type="ARIMA",
        date=datetime.date(2024, 1, 8),
        predicted_value=12.3,
    )
    resp = api_client.get("/api/water-levels/groundwater-predictions/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_englandwater_prediction_accuracy(api_client):
    station = EnglandwaterStation.objects.create(
        station_id="s1", name="S1", region="north"
    )
    EnglandwaterLevel.objects.create(
        station=station, date=datetime.date(2024, 1, 8), value=10.0
    )
    EnglandwaterPrediction.objects.create(
        region="north",
        model_type="ARIMA",
        date=datetime.date(2024, 1, 8),
        predicted_value=12.0,
    )
    EnglandwaterPredictionAccuracy.objects.create(
        region="north",
        model_type="ARIMA",
        date=datetime.date(2024, 1, 8),
        predicted_value=12.0,
        actual_value=10.0,
        percentage_error=20.0,
    )
    resp = api_client.get("/api/water-levels/groundwater-prediction-accuracy/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_severn_trent_accuracy(api_client):
    SevernTrentReservoirLevel.objects.create(
        date=datetime.date(2024, 1, 8), percentage=70.0
    )
    SevernTrentReservoirForecast.objects.create(
        date=datetime.date(2024, 1, 8), predicted_percentage=72.0, model_type="ARIMA"
    )
    SevernTrentForecastAccuracy.objects.create(
        date=datetime.date(2024, 1, 8),
        model_type="ARIMA",
        predicted_percentage=72.0,
        actual_percentage=70.0,
        percentage_error=2.5,
    )
    resp = api_client.get("/api/water-levels/severn-trent-prediction-accuracy/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_yorkshire_accuracy(api_client):
    YorkshireReservoirData.objects.create(
        report_date=datetime.date(2024, 1, 8),
        reservoir_level=80.0,
        weekly_difference=1.0,
        direction="OK",
    )
    YorkshireWaterPrediction.objects.create(
        date=datetime.date(2024, 1, 8),
        predicted_reservoir_percent=82.0,
        predicted_demand_mld=102.0,
        model_type="ARIMA",
    )
    YorkshireWaterPredictionAccuracy.objects.create(
        date=datetime.date(2024, 1, 8),
        model_type="ARIMA",
        predicted_reservoir_percent=82.0,
        actual_reservoir_percent=80.0,
        reservoir_error=2.5,
        predicted_demand_mld=102.0,
        actual_demand_mld=100.0,
        demand_error=2.0,
    )
    resp = api_client.get("/api/water-levels/yorkshire-prediction-accuracy/")
    assert resp.status_code == 200

@pytest.mark.django_db
def test_southernwater_accuracy(api_client):
    SouthernWaterReservoirLevel.objects.create(
        reservoir="TestRes",
        date=datetime.date(2024, 1, 8),
        current_level=60.0,
        average_level=65.0,
        change_week=1.0,
        change_month=2.0,
        difference_from_average=-5.0,
    )
    SouthernWaterReservoirForecast.objects.create(
        reservoir="TestRes",
        date=datetime.date(2024, 1, 8),
        predicted_level=62.0,
        model_type="ARIMA",
    )
    SouthernWaterForecastAccuracy.objects.create(
        reservoir="TestRes",
        date=datetime.date(2024, 1, 8),
        model_type="ARIMA",
        predicted_level=62.0,
        actual_level=60.0,
        percentage_error=3.33,
    )
    resp = api_client.get("/api/water-levels/southernwater-prediction-accuracy/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_scottishwater_forecast_accuracy(api_client):
    ScottishWaterForecastAccuracy.objects.create(
        date=datetime.date(2024, 1, 8),
        model_type="ARIMA",
        predicted_percentage=70.0,
        actual_percentage=69.0,
        percentage_error=1.43,
    )
    resp = api_client.get("/api/water-levels/scottishwater-forecast-accuracy/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_scottishwater_prediction_accuracy(api_client):
    ScottishWaterPredictionAccuracy.objects.create(
        area="north",
        date=datetime.date(2024, 1, 8),
        model_type="ARIMA",
        predicted_value=60.0,
        actual_value=58.0,
        percentage_error=3.33,
    )
    resp = api_client.get("/api/water-levels/scottishwater-prediction-accuracy/")
    assert resp.status_code == 200
