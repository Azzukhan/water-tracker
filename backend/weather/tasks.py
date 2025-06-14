import requests
from celery import shared_task
from .models import WeatherStation, CurrentWeather, HourlyForecast, DailyForecast
from django.utils import timezone
from datetime import datetime
import pytz
import os
import time
from celery.signals import task_failure
from django.core.cache import cache

TOMORROW_API_KEY = os.getenv('TOMORROW_API_KEY', '0pf6M1hLTRzQHdAY0dQuAcl5R1YP5G5X')
RATE_LIMIT_KEY = 'tomorrow_io_rate_limit'
RATE_LIMIT_WINDOW = 60  # 1 minute window
MAX_REQUESTS_PER_WINDOW = 100  # Tomorrow.io free tier limit

def check_rate_limit():
    """Check if we're within rate limits for Tomorrow.io API"""
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # Get existing requests in the window
    requests_in_window = cache.get(RATE_LIMIT_KEY, [])
    
    # Remove old requests outside the window
    requests_in_window = [t for t in requests_in_window if t > window_start]
    
    if len(requests_in_window) >= MAX_REQUESTS_PER_WINDOW:
        return False
    
    # Add current request
    requests_in_window.append(current_time)
    cache.set(RATE_LIMIT_KEY, requests_in_window, RATE_LIMIT_WINDOW)
    return True


def fetch_and_update_weather(station_id: int) -> bool:
    """Fetch weather data for a station and store it in the database."""
    try:
        station = WeatherStation.objects.get(id=station_id)
        lat, lon = station.latitude, station.longitude

        if not check_rate_limit():
            return False

        url = (
            f"https://api.tomorrow.io/v4/weather/forecast?location={lat},{lon}"
            f"&apikey={TOMORROW_API_KEY}&timesteps=1h,1d&units=metric"
        )
        headers = {"accept": "application/json", "accept-encoding": "deflate, gzip, br"}
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            return False
        data = r.json()
        if "timelines" not in data or "hourly" not in data["timelines"] or "daily" not in data["timelines"]:
            return False

        HourlyForecast.objects.filter(station=station).delete()
        DailyForecast.objects.filter(station=station).delete()

        current = data["timelines"]["hourly"][0]["values"]
        CurrentWeather.objects.create(
            station=station,
            temperature=current.get("temperature"),
            feels_like=current.get("temperatureApparent", current.get("temperature")),
            condition=str(current.get("weatherCode")),
            icon="",
            humidity=current.get("humidity"),
            wind_speed=current.get("windSpeed"),
            wind_direction=str(current.get("windDirection")),
            pressure=current.get("pressureSeaLevel"),
            visibility=current.get("visibility"),
            uv_index=current.get("uvIndex"),
            timestamp=timezone.now(),
        )

        for hour in data["timelines"]["hourly"][:24]:
            time_str = hour["time"]
            time_dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            if timezone.is_naive(time_dt):
                time_dt = timezone.make_aware(time_dt)
            values = hour["values"]
            HourlyForecast.objects.create(
                station=station,
                time=time_dt,
                temperature=values.get("temperature"),
                temperature_apparent=values.get("temperatureApparent"),
                humidity=values.get("humidity"),
                wind_speed=values.get("windSpeed"),
                wind_gust=values.get("windGust"),
                wind_direction=values.get("windDirection"),
                cloud_cover=values.get("cloudCover"),
                precipitation_probability=values.get("precipitationProbability"),
                rain_intensity=values.get("rainIntensity"),
                snow_intensity=values.get("snowIntensity"),
                sleet_intensity=values.get("sleetIntensity"),
                freezing_rain_intensity=values.get("freezingRainIntensity"),
                dew_point=values.get("dewPoint"),
                pressure_sea_level=values.get("pressureSeaLevel"),
                visibility=values.get("visibility"),
                uv_index=values.get("uvIndex"),
                weather_code=values.get("weatherCode"),
                condition=str(values.get("weatherCode")),
                icon="",
                precipitation=values.get("precipitationIntensity"),
            )

        for day in data["timelines"]["daily"][:7]:
            date_str = day["time"]
            date_dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            if timezone.is_naive(date_dt):
                date_dt = timezone.make_aware(date_dt)
            values = day["values"]
            DailyForecast.objects.create(
                station=station,
                date=date_dt,
                temperature_max=values.get("temperatureMax"),
                temperature_min=values.get("temperatureMin"),
                temperature_avg=values.get("temperatureAvg"),
                humidity_max=values.get("humidityMax"),
                humidity_min=values.get("humidityMin"),
                humidity_avg=values.get("humidityAvg"),
                wind_speed_max=values.get("windSpeedMax"),
                wind_speed_min=values.get("windSpeedMin"),
                wind_speed_avg=values.get("windSpeedAvg"),
                cloud_cover_max=values.get("cloudCoverMax"),
                cloud_cover_min=values.get("cloudCoverMin"),
                cloud_cover_avg=values.get("cloudCoverAvg"),
                precipitation_probability_max=values.get("precipitationProbabilityMax"),
                precipitation_probability_min=values.get("precipitationProbabilityMin"),
                precipitation_probability_avg=values.get("precipitationProbabilityAvg"),
                sunrise_time=values.get("sunriseTime"),
                sunset_time=values.get("sunsetTime"),
                weather_code_max=values.get("weatherCodeMax"),
                weather_code_min=values.get("weatherCodeMin"),
                condition=str(values.get("weatherCodeMax")),
                icon="",
                precipitation=values.get("precipitationIntensity"),
            )
        return True
    except Exception:
        return False

@shared_task
def update_all_weather():
    """Update weather data for all active stations"""
    stations = WeatherStation.objects.filter(is_active=True)
    for station in stations:
        fetch_and_update_weather(station.id)
    return None

@shared_task(bind=True, max_retries=3)
def update_weather_for_location(self, station_id):
    """Celery wrapper to fetch weather for a station."""
    if not fetch_and_update_weather(station_id):
        raise self.retry(exc=Exception("fetch failed"), countdown=60)
    return True

@task_failure.connect
def handle_task_failure(task_id, exception, args, kwargs, traceback, einfo, **kw):
    """Handle task failures and log them"""
    print(f"Task {task_id} failed: {exception}")
    # You could add more sophisticated error handling here, like:
    # - Sending notifications
    # - Logging to a monitoring service
    # - Updating a failure counter in the database
