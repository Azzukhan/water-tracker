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
from datetime import timedelta
import traceback

TOMORROW_API_KEY = os.getenv("TOMORROW_API_KEY", "0pf6M1hLTRzQHdAY0dQuAcl5R1YP5G5X")

# Example mapping for weather codes (expand as needed)
WEATHER_CODE_MAP = {
    1000: {"description": "Clear", "icon": "☀️"},
    1100: {"description": "Mostly Clear", "icon": "🌤️"},
    1101: {"description": "Partly Cloudy", "icon": "⛅"},
    1102: {"description": "Mostly Cloudy", "icon": "☁️"},
    1001: {"description": "Cloudy", "icon": "☁️"},
    2000: {"description": "Fog", "icon": "🌫️"},
    # ... add more codes as needed
}


def get_weather_info(code):
    return WEATHER_CODE_MAP.get(code, {"description": "Unknown", "icon": "❓"})


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r


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
        # List of popular UK cities
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
                # Find nearest station
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

        if not latitude or not longitude:
            return Response(
                {"error": "Latitude and longitude are required"}, status=400
            )

        try:
            lat, lon = float(latitude), float(longitude)
            # Find the nearest active weather station within 10km
            stations = WeatherStation.objects.filter(is_active=True)
            nearest_station = None
            min_dist = float("inf")
            for s in stations:
                dist = haversine_distance(lat, lon, s.latitude, s.longitude)
                if dist < min_dist:
                    min_dist = dist
                    nearest_station = s
            if nearest_station is None or min_dist > 10:
                # Create a new station if none within 10km
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

                nearest_station = WeatherStation.objects.create(
                    name=display_name or f"Custom Location ({lat:.4f}, {lon:.4f})",
                    location=display_name or f"Lat {lat:.4f}, Lon {lon:.4f}",
                    latitude=lat,
                    longitude=lon,
                    is_active=True,
                )
                fetch_and_update_weather(nearest_station.id)
            # Get current weather
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
            # Get hourly forecast
            hourly = HourlyForecast.objects.filter(
                station=nearest_station, time__gt=timezone.now()
            ).order_by("time")[:24]
            # Get daily forecast
            daily = DailyForecast.objects.filter(
                station=nearest_station, date__gte=timezone.now().date()
            ).order_by("date")[:7]
            response = {
                "location": {
                    "name": nearest_station.name,
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
                    "timestamp": current.timestamp,
                },
                "hourly": [
                    {
                        "time": h.time,
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
                        "date": d.date,
                        "high": d.temperature_max,
                        "low": d.temperature_min,
                        "condition": d.condition,
                        "icon": d.icon,
                        "humidity": d.humidity_avg,
                        "wind_speed": d.wind_speed_avg,
                        "precipitation": d.precipitation_probability_avg,
                        "sunrise": d.sunrise_time,
                        "sunset": d.sunset_time,
                    }
                    for d in daily
                ],
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
