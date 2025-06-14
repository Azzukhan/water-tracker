from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WeatherStationViewSet, 
    CurrentWeatherViewSet, 
    HourlyForecastViewSet, 
    DailyForecastViewSet,
    UnifiedWeatherAPIView,
    GeocodeAPIView,
    PopularLocationsAPIView
)

router = DefaultRouter()
router.register(r'stations', WeatherStationViewSet)
router.register(r'current', CurrentWeatherViewSet)
router.register(r'hourly', HourlyForecastViewSet)
router.register(r'daily', DailyForecastViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('unified/', UnifiedWeatherAPIView.as_view(), name='unified-weather'),
    path('geocode/', GeocodeAPIView.as_view(), name='weather-geocode'),
    path('popular/', PopularLocationsAPIView.as_view(), name='weather-popular'),
]

