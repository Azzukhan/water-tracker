import datetime
import pytest
from weather.models import WeatherStation, CurrentWeather, HourlyForecast, DailyForecast

@pytest.mark.django_db
def test_weather_station_list(api_client):
    WeatherStation.objects.create(name='S1', location='Loc', latitude=1.0, longitude=1.0)
    resp = api_client.get('/api/weather/stations/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_current_weather_list(api_client):
    station = WeatherStation.objects.create(name='S2', location='Loc', latitude=1.0, longitude=1.0)
    CurrentWeather.objects.create(station=station, temperature=10, feels_like=10, condition='sunny', icon='i', humidity=50, wind_speed=5, wind_direction='N', pressure=1000, visibility=10, uv_index=1)
    resp = api_client.get('/api/weather/current/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_hourly_forecast_list(api_client):
    station = WeatherStation.objects.create(name='S3', location='Loc', latitude=1.0, longitude=1.0)
    HourlyForecast.objects.create(station=station, time=datetime.datetime.now(), temperature=10)
    resp = api_client.get('/api/weather/hourly/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_daily_forecast_list(api_client):
    station = WeatherStation.objects.create(name='S4', location='Loc', latitude=1.0, longitude=1.0)
    DailyForecast.objects.create(station=station, date=datetime.date.today(), temperature_max=15, temperature_min=5)
    resp = api_client.get('/api/weather/daily/')
    assert resp.status_code == 200
