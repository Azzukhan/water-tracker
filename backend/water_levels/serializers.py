from rest_framework import serializers
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
)


class ScottishWaterAverageLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterAverageLevel
        fields = [
            "id",
            "date",
            "current",
            "change_from_last_week",
            "difference_from_average",
        ]


class ScottishWaterRegionalLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterRegionalLevel
        fields = [
            "id",
            "area",
            "date",
            "current",
            "change_from_last_week",
            "difference_from_average",
        ]


class SevernTrentReservoirLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SevernTrentReservoirLevel
        fields = ["date", "percentage"]


class SevernTrentForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = SevernTrentReservoirForecast
        fields = "__all__"
