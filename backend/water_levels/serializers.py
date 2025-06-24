from rest_framework import serializers
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    ScottishWaterForecast,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterReport,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
    SouthernWaterReservoirLevel,
    SouthernWaterReservoirForecast,
    GroundwaterStation,
    GroundwaterLevel,
    GroundwaterPrediction,
    GroundwaterPredictionAccuracy,
    SevernTrentForecastAccuracy,
    YorkshireWaterPredictionAccuracy,
    SouthernWaterForecastAccuracy,
    ScottishWaterPredictionAccuracy,
    ScottishWaterRegionalForecast,
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


class ScottishWaterForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterForecast
        fields = "__all__"


class ScottishWaterRegionalForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterRegionalForecast
        fields = "__all__"


class YorkshireWaterReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = YorkshireWaterReport
        fields = "__all__"


class YorkshireWaterPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = YorkshireWaterPrediction
        fields = "__all__"


class YorkshireReservoirSerializer(serializers.ModelSerializer):
    class Meta:
        model = YorkshireReservoirData
        fields = "__all__"


class SouthernWaterReservoirLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SouthernWaterReservoirLevel
        fields = "__all__"


class SouthernWaterForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = SouthernWaterReservoirForecast
        fields = "__all__"


class GroundwaterStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundwaterStation
        fields = "__all__"


class GroundwaterLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundwaterLevel
        fields = "__all__"


class GroundwaterPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundwaterPrediction
        fields = "__all__"


class GroundwaterPredictionAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundwaterPredictionAccuracy
        fields = "__all__"


class SevernTrentForecastAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = SevernTrentForecastAccuracy
        fields = "__all__"


class YorkshireWaterPredictionAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = YorkshireWaterPredictionAccuracy
        fields = "__all__"


class SouthernWaterForecastAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = SouthernWaterForecastAccuracy
        fields = "__all__"


class ScottishWaterPredictionAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterPredictionAccuracy
        fields = "__all__"
