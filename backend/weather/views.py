from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import WeatherStation, CurrentWeather, HourlyForecast, DailyForecast
from .serializers import (
    WeatherStationSerializer,
    CurrentWeatherSerializer,
    HourlyForecastSerializer,
    DailyForecastSerializer,
)
from rest_framework.views import APIView
from django.db.models import F
from math import radians, cos, sin, asin, sqrt
from .tasks import update_weather_for_location, fetch_and_update_weather
from django.utils import timezone
import requests
import os
from django.conf import settings
from django.db import models
from datetime import datetime, timedelta
import traceback
from typing import Dict, Any, Optional

TOMORROW_API_KEY = os.getenv("TOMORROW_API_KEY", "0pf6M1hLTRzQHdAY0dQuAcl5R1YP5G5X")

WEATHER_CODE_MAP = {
    1000: {"description": "Clear", "icon": "☀️"},
    1100: {"description": "Mostly Clear", "icon": "🌤️"},
    1101: {"description": "Partly Cloudy", "icon": "⛅"},
    1102: {"description": "Mostly Cloudy", "icon": "☁️"},
    1001: {"description": "Cloudy", "icon": "☁️"},
    2000: {"description": "Fog", "icon": "🌫️"},
}

def get_weather_info(code):
    return WEATHER_CODE_MAP.get(code, {"description": "Unknown", "icon": "❓"})

def haversine_distance(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  
    return c * r

def fetch_astronomy(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Retrieve sunrise, sunset and moon data using sunrise-sunset.org with
    Open-Meteo as a fallback."""
    try:
        url = (
            "https://api.sunrise-sunset.org/json?"
            f"lat={lat}&lng={lon}&formatted=0"
        )
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200 and resp.json().get("status") == "OK":
            r = resp.json().get("results", {})
            return {
                "sunrise": r.get("sunrise"),
                "sunset": r.get("sunset"),
                "day_length": r.get("day_length"),
                "moonrise": r.get("moonrise"),
                "moonset": r.get("moonset"),
                "phase": None,
            }
    except Exception:
        pass
    try:
        today = timezone.now().date().isoformat()
        url = (
            "https://api.open-meteo.com/v1/astronomy?"
            f"latitude={lat}&longitude={lon}&date={today}&timezone=UTC"
        )
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return None
        data = resp.json().get("daily")
        if not data:
            return None
        return {
            "sunrise": data.get("sunrise", [None])[0],
            "sunset": data.get("sunset", [None])[0],
            "day_length": data.get("day_length", [None])[0],
            "moonrise": data.get("moonrise", [None])[0],
            "moonset": data.get("moonset", [None])[0],
            "phase": data.get("moon_phase", [None])[0],
        }
    except Exception:
        return None

def get_aqi_category(aqi: float) -> str:
    """Return UK DAQI category for the given AQI value."""
    if aqi <= 3:
        return "Low"
    if aqi <= 6:
        return "Moderate"
    if aqi <= 9:
        return "High"
    return "Very High"


def convert_to_uk_daqi(aqi: float) -> int:
    """Convert WAQI (0-500) value to UK DAQI 1-10 scale."""
    if aqi is None:
        return 1
    return max(1, min(10, round(aqi / 10)))

WAQI_TOKEN = os.getenv(
    "WAQI_TOKEN", "aec42c8095c1320774446550b357ba9edb44ad97"
)

def fetch_air_quality(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Retrieve air quality data from the World Air Quality Index service."""
    if not WAQI_TOKEN:
        return None
    try:
        url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_TOKEN}"
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") != "ok":
            return None
        aqi_raw = data.get("data", {}).get("aqi")
        if aqi_raw is None:
            return None
        aqi = convert_to_uk_daqi(aqi_raw)

        iaqi = data.get("data", {}).get("iaqi", {})
        pollutant_map = {
            "pm25": "PM2.5",
            "pm10": "PM10",
            "o3": "O3",
            "no2": "NO2",
            "so2": "SO2",
            "co": "CO",
        }
        pollutants = []
        for key, name in pollutant_map.items():
            val = iaqi.get(key, {}).get("v")
            if val is not None:
                pollutants.append({"name": name, "value": round(val), "unit": "µg/m³"})

        return {
            "value": aqi,
            "status": get_aqi_category(aqi),
            "pollutants": pollutants,
            "forecast": [],
        }
    except Exception:
        return None

class GeocodeAPIView(APIView):
    def get(self, request):
        query = request.GET.get("query")
        latitude = request.GET.get("latitude")
        longitude = request.GET.get("longitude")
        results = []
        if query:
            url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5"
            resp = requests.get(url, headers={"User-Agent": "uk-water-tracker"})
            if resp.status_code == 200 and resp.json():
                for item in resp.json():
                    results.append(
                        {
                            "name": item.get("display_name", ""),
                            "lat": float(item["lat"]),
                            "lon": float(item["lon"]),
                        }
                    )
            return Response({"locations": results}, status=200)
        elif latitude and longitude:
            url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
            resp = requests.get(url, headers={"User-Agent": "uk-water-tracker"})
            if resp.status_code == 200 and resp.json():
                item = resp.json()
                results.append(
                    {
                        "name": item.get("display_name", ""),
                        "lat": float(item["lat"]),
                        "lon": float(item["lon"]),
                    }
                )
            return Response({"locations": results}, status=200)
        else:
            return Response({"locations": []}, status=200)

class PopularLocationsAPIView(APIView):
    def get(self, request):
        cities = [
            {"name": "London", "query": "London, England"},
            {"name": "Manchester", "query": "Manchester, England"},
            {"name": "Edinburgh", "query": "Edinburgh, Scotland"},
            {"name": "Cardiff", "query": "Cardiff, Wales"},
            {"name": "Belfast", "query": "Belfast, Northern Ireland"},
        ]
        results = []
        for city in cities:
            url = f'https://nominatim.openstreetmap.org/search?q={city["query"]}&format=json&limit=1'
            resp = requests.get(url, headers={"User-Agent": "uk-water-tracker"})
            if resp.status_code == 200 and resp.json():
                data = resp.json()[0]
                lat, lon = float(data["lat"]), float(data["lon"])
                stations = WeatherStation.objects.filter(is_active=True)
                if stations.exists():
                    nearest_station = min(
                        stations,
                        key=lambda s: haversine_distance(
                            lat, lon, s.latitude, s.longitude
                        ),
                    )
                    current = (
                        CurrentWeather.objects.filter(station=nearest_station)
                        .order_by("-timestamp")
                        .first()
                    )
                    results.append(
                        {
                            "name": city["name"],
                            "latitude": lat,
                            "longitude": lon,
                            "station": WeatherStationSerializer(nearest_station).data,
                            "current": (
                                CurrentWeatherSerializer(current).data
                                if current
                                else None
                            ),
                        }
                    )
        return Response(results)

class UnifiedWeatherAPIView(APIView):
    def get(self, request):
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        query = request.query_params.get("query")
        if (not latitude or not longitude) and query:
            geocode_url = f'https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1'
            resp = requests.get(geocode_url, headers={'User-Agent': 'uk-water-tracker'})
            if resp.status_code == 200 and resp.json():
                data = resp.json()[0]
                latitude = data['lat']
                longitude = data['lon']
            else:
                return Response({'error': 'Location not found'}, status=404)
        if not latitude or not longitude:
            return Response(
                {"error": "Latitude and longitude are required"}, status=400
            )
        try:
            lat, lon = float(latitude), float(longitude)
            stations = WeatherStation.objects.filter(is_active=True)
            nearest_station = None
            min_dist = float("inf")
            for s in stations:
                dist = haversine_distance(lat, lon, s.latitude, s.longitude)
                if dist < min_dist:
                    min_dist = dist
                    nearest_station = s
            if nearest_station is None or min_dist > 10:
                display_name = None
                try:
                    resp = requests.get(
                        f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json",
                        headers={"User-Agent": "uk-weather-tracker"},
                        timeout=5,
                    )
                    if resp.status_code == 200 and resp.json():
                        display_name = resp.json().get("display_name")
                except Exception:
                    display_name = None
                if display_name:
                    parts = [p.strip() for p in display_name.split(",")]
                    name = parts[0]
                    location = ", ".join(parts[1:])
                else:
                    name = f"Custom Location ({lat:.4f}, {lon:.4f})"
                    location = f"Lat {lat:.4f}, Lon {lon:.4f}"
                nearest_station = WeatherStation.objects.create(
                    name=name,
                    location=location,
                    latitude=lat,
                    longitude=lon,
                    is_active=True,
                )
                fetch_and_update_weather(nearest_station.id)
            current = (
                CurrentWeather.objects.filter(station=nearest_station)
                .order_by("-timestamp")
                .first()
            )
            if not current or (timezone.now() - current.timestamp) > timedelta(
                minutes=30
            ):
                fetch_and_update_weather(nearest_station.id)
                current = (
                    CurrentWeather.objects.filter(station=nearest_station)
                    .order_by("-timestamp")
                    .first()
                )
                if not current:
                    return Response(
                        {"error": "Failed to retrieve weather data"}, status=500
                    )
            hourly = HourlyForecast.objects.filter(
                station=nearest_station, time__gt=timezone.now()
            ).order_by("time")[:24]
            daily = DailyForecast.objects.filter(
                station=nearest_station, date__gte=timezone.now().date()
            ).order_by("date")[:7]
            astronomy = fetch_astronomy(lat, lon) or {}
            air_quality = fetch_air_quality(lat, lon) or {}

            sunrise_val = astronomy.get("sunrise")
            sunset_val = astronomy.get("sunset")
            day_len = astronomy.get("day_length")
            if (not sunrise_val or not sunset_val) and daily:
                first = daily[0]
                if not sunrise_val and first.sunrise_time:
                    sunrise_val = first.sunrise_time.isoformat()
                if not sunset_val and first.sunset_time:
                    sunset_val = first.sunset_time.isoformat()
            if not day_len and sunrise_val and sunset_val:
                try:
                    sr = datetime.fromisoformat(sunrise_val)
                    ss = datetime.fromisoformat(sunset_val)
                    day_len = str(int((ss - sr).total_seconds()))
                except Exception:
                    pass
            response = {
                "location": {
                    "name": nearest_station.name,
                    "region": nearest_station.location,
                    "lat": nearest_station.latitude,
                    "lon": nearest_station.longitude,
                },
                "current": {
                    "temperature": current.temperature,
                    "feels_like": current.feels_like,
                    "condition": current.condition,
                    "icon": current.icon,
                    "humidity": current.humidity,
                    "wind_speed": current.wind_speed,
                    "wind_direction": current.wind_direction,
                    "pressure": current.pressure,
                    "visibility": current.visibility,
                    "uv_index": current.uv_index,
                    "timestamp": current.timestamp.isoformat(),
                },
                "hourly": [
                    {
                        "time": h.time.isoformat(),
                        "temperature": h.temperature,
                        "feels_like": h.temperature_apparent,
                        "condition": h.condition,
                        "icon": h.icon,
                        "humidity": h.humidity,
                        "wind_speed": h.wind_speed,
                        "precipitation": h.precipitation_probability,
                        "uv_index": h.uv_index,
                    }
                    for h in hourly
                ],
                "daily": [
                    {
                        "date": d.date.isoformat(),
                        "high": d.temperature_max,
                        "low": d.temperature_min,
                        "condition": d.condition,
                        "icon": d.icon,
                        "humidity": d.humidity_avg,
                        "wind_speed": d.wind_speed_avg,
                        "precipitation": d.precipitation_probability_avg,
                        "sunrise": (
                            d.sunrise_time.isoformat() if d.sunrise_time else None
                        ),
                        "sunset": (
                            d.sunset_time.isoformat() if d.sunset_time else None
                        ),
                    }
                    for d in daily
                ],
                "sun": {
                    "sunrise": sunrise_val,
                    "sunset": sunset_val,
                    "day_length": day_len,
                },
                "moon": {
                    "rise": astronomy.get("moonrise"),
                    "set": astronomy.get("moonset"),
                    "phase": astronomy.get("phase"),
                },
                "aqi": air_quality,
            }
            return Response(response, status=200)
        except Exception as e:
            print("Exception in UnifiedWeatherAPIView:", e)
            traceback.print_exc()
            return Response(
                {"error": "Internal server error", "details": str(e)}, status=500
            )

class WeatherStationViewSet(viewsets.ModelViewSet):
    queryset = WeatherStation.objects.all()
    serializer_class = WeatherStationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_active", "location"]
    search_fields = ["name", "location"]

    @action(detail=True, methods=["get"])
    def current_weather(self, request, pk=None):
        station = self.get_object()
        weather = (
            CurrentWeather.objects.filter(station=station)
            .order_by("-timestamp")
            .first()
        )
        if weather:
            serializer = CurrentWeatherSerializer(weather)
            return Response(serializer.data)
        return Response(
            {"detail": "No current weather data available for this station."},
            status=404,
        )

    @action(detail=True, methods=["get"])
    def hourly_forecast(self, request, pk=None):
        station = self.get_object()
        forecasts = HourlyForecast.objects.filter(station=station).order_by("time")[:24]
        serializer = HourlyForecastSerializer(forecasts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def daily_forecast(self, request, pk=None):
        station = self.get_object()
        forecasts = DailyForecast.objects.filter(station=station).order_by("date")[:7]
        serializer = DailyForecastSerializer(forecasts, many=True)
        return Response(serializer.data)

class CurrentWeatherViewSet(viewsets.ModelViewSet):
    queryset = CurrentWeather.objects.all().order_by("-timestamp")
    serializer_class = CurrentWeatherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["station"]

class HourlyForecastViewSet(viewsets.ModelViewSet):
    queryset = HourlyForecast.objects.all().order_by("time")
    serializer_class = HourlyForecastSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["station"]

class DailyForecastViewSet(viewsets.ModelViewSet):
    queryset = DailyForecast.objects.all().order_by("date")
    serializer_class = DailyForecastSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["station"]
