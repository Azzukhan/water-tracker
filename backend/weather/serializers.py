from rest_framework import serializers
from .models import WeatherStation, CurrentWeather, HourlyForecast, DailyForecast

class WeatherStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherStation
        fields = '__all__'

class CurrentWeatherSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_location = serializers.CharField(source='station.location', read_only=True)
    
    class Meta:
        model = CurrentWeather
        fields = ['id', 'station', 'station_name', 'station_location', 'temperature', 
                  'feels_like', 'condition', 'icon', 'humidity', 'wind_speed', 
                  'wind_direction', 'pressure', 'visibility', 'uv_index', 'timestamp']

class HourlyForecastSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    
    class Meta:
        model = HourlyForecast
        fields = ['id', 'station', 'station_name', 'time', 'temperature', 
                  'condition', 'icon', 'precipitation', 'created_at']

class DailyForecastSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    
    class Meta:
        model = DailyForecast
        fields = ['id', 'station', 'station_name', 'date', 'high_temp', 
                  'low_temp', 'condition', 'icon', 'precipitation', 'created_at']
