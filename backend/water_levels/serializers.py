from rest_framework import serializers
from .models import (
    WaterStation,
    WaterLevel,
    Alert,
    Prediction,
    ScottishWaterResourceLevel,
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    ScottishWaterLevel,
)

class WaterStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterStation
        fields = '__all__'

class WaterLevelSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_location = serializers.CharField(source='station.location', read_only=True)
    
    class Meta:
        model = WaterLevel
        fields = ['id', 'station', 'station_name', 'station_location', 'level', 
                  'normal_level', 'status', 'trend', 'timestamp']

class AlertSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_location = serializers.CharField(source='station.location', read_only=True)
    
    class Meta:
        model = Alert
        fields = ['id', 'station', 'station_name', 'station_location', 'title', 
                  'description', 'severity', 'status', 'created_at', 'updated_at']

class PredictionSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_location = serializers.CharField(source='station.location', read_only=True)
    
    class Meta:
        model = Prediction
        fields = ['id', 'station', 'station_name', 'station_location', 'next_hour',
                  'next_6_hours', 'next_24_hours', 'confidence', 'created_at']


class ScottishWaterResourceLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterResourceLevel
        fields = ['id', 'name', 'level', 'last_updated']


class ScottishWaterAverageLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterAverageLevel
        fields = [
            'id',
            'date',
            'current',
            'change_from_last_week',
            'difference_from_average',
        ]


class ScottishWaterRegionalLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterRegionalLevel
        fields = [
            'id',
            'area',
            'date',
            'current',
            'change_from_last_week',
            'difference_from_average',
        ]


class ScottishWaterLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterLevel
        fields = '__all__'
