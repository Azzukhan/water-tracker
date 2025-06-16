from rest_framework import serializers
from .models import ScottishWaterAverageLevel, ScottishWaterRegionalLevel


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
