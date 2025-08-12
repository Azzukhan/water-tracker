from rest_framework import serializers
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    ScottishWaterForecast,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
    SouthernWaterReservoirLevel,
    SouthernWaterReservoirForecast,
    EAwaterStation,
    EAwaterLevel,
    EAwaterPrediction,
    EAwaterPredictionAccuracy,
    SevernTrentForecastAccuracy,
    YorkshireWaterPredictionAccuracy,
    SouthernWaterForecastAccuracy,
    ScottishWaterPredictionAccuracy,
    ScottishWaterForecastAccuracy,
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


class EAwaterStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EAwaterStation
        fields = "__all__"


class EAwaterLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EAwaterLevel
        fields = "__all__"


class EAwaterPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EAwaterPrediction
        fields = "__all__"


class EAwaterPredictionAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = EAwaterPredictionAccuracy
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



class ScottishWaterForecastAccuracySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScottishWaterForecastAccuracy
        fields = "__all__"
