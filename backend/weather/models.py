from django.db import models
from django.utils import timezone
from django.db.models import Count

class WeatherStation(models.Model):
    """Model representing a weather station"""
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.location})"

class CurrentWeather(models.Model):
    """Model representing current weather conditions"""
    station = models.ForeignKey(WeatherStation, on_delete=models.CASCADE, related_name='current_weather')
    temperature = models.FloatField(help_text="Temperature in Celsius")
    feels_like = models.FloatField(help_text="Feels like temperature in Celsius")
    condition = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)
    humidity = models.IntegerField(help_text="Humidity percentage")
    wind_speed = models.FloatField(help_text="Wind speed in mph")
    wind_direction = models.CharField(max_length=10)
    pressure = models.IntegerField(help_text="Pressure in mb")
    visibility = models.FloatField(help_text="Visibility in km")
    uv_index = models.IntegerField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.station.name}: {self.temperature}°C, {self.condition}"

class HourlyForecast(models.Model):
    """Model representing hourly weather forecast"""
    station = models.ForeignKey(WeatherStation, on_delete=models.CASCADE, related_name='hourly_forecasts')
    time = models.DateTimeField()
    temperature = models.FloatField(null=True, blank=True, help_text="Temperature in Celsius")
    temperature_apparent = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    wind_gust = models.FloatField(null=True, blank=True)
    wind_direction = models.FloatField(null=True, blank=True)
    cloud_cover = models.FloatField(null=True, blank=True)
    precipitation_probability = models.FloatField(null=True, blank=True)
    rain_intensity = models.FloatField(null=True, blank=True)
    snow_intensity = models.FloatField(null=True, blank=True)
    sleet_intensity = models.FloatField(null=True, blank=True)
    freezing_rain_intensity = models.FloatField(null=True, blank=True)
    dew_point = models.FloatField(null=True, blank=True)
    pressure_sea_level = models.FloatField(null=True, blank=True)
    visibility = models.FloatField(null=True, blank=True)
    uv_index = models.FloatField(null=True, blank=True)
    weather_code = models.IntegerField(null=True, blank=True)
    condition = models.CharField(max_length=100, blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="")
    precipitation = models.IntegerField(null=True, blank=True, help_text="Precipitation probability percentage")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.station.name}: {self.time.strftime('%H:%M')} - {self.temperature}°C"

    class Meta:
        unique_together = ('station', 'time')

class DailyForecast(models.Model):
    """Model representing daily weather forecast"""
    station = models.ForeignKey(WeatherStation, on_delete=models.CASCADE, related_name='daily_forecasts')
    date = models.DateField()
    temperature_max = models.FloatField(null=True, blank=True)
    temperature_min = models.FloatField(null=True, blank=True)
    temperature_avg = models.FloatField(null=True, blank=True)
    humidity_max = models.FloatField(null=True, blank=True)
    humidity_min = models.FloatField(null=True, blank=True)
    humidity_avg = models.FloatField(null=True, blank=True)
    wind_speed_max = models.FloatField(null=True, blank=True)
    wind_speed_min = models.FloatField(null=True, blank=True)
    wind_speed_avg = models.FloatField(null=True, blank=True)
    cloud_cover_max = models.FloatField(null=True, blank=True)
    cloud_cover_min = models.FloatField(null=True, blank=True)
    cloud_cover_avg = models.FloatField(null=True, blank=True)
    precipitation_probability_max = models.FloatField(null=True, blank=True)
    precipitation_probability_min = models.FloatField(null=True, blank=True)
    precipitation_probability_avg = models.FloatField(null=True, blank=True)
    sunrise_time = models.DateTimeField(null=True, blank=True)
    sunset_time = models.DateTimeField(null=True, blank=True)
    weather_code_max = models.IntegerField(null=True, blank=True)
    weather_code_min = models.IntegerField(null=True, blank=True)
    high_temp = models.FloatField(null=True, blank=True, help_text="High temperature in Celsius")
    low_temp = models.FloatField(null=True, blank=True, help_text="Low temperature in Celsius")
    condition = models.CharField(max_length=100, blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="")
    precipitation = models.IntegerField(null=True, blank=True, help_text="Precipitation probability percentage")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.station.name}: {self.date.strftime('%Y-%m-%d')} - {self.temperature_max}°C/{self.temperature_min}°C"

    class Meta:
        unique_together = ('station', 'date')
