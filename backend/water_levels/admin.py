from django.contrib import admin
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

@admin.register(WaterStation)
class WaterStationAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "station_type", "is_active")
    search_fields = ("name", "location")

@admin.register(WaterLevel)
class WaterLevelAdmin(admin.ModelAdmin):
    list_display = ("station", "level", "status", "trend", "timestamp")
    list_filter = ("status", "trend", "station")
    search_fields = ("station__name",)

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("title", "station", "severity", "status", "created_at")
    list_filter = ("severity", "status", "station")
    search_fields = ("title", "description")

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("station", "next_hour", "next_6_hours", "next_24_hours", "confidence", "created_at")
    list_filter = ("station",)
    search_fields = ("station__name",)

@admin.register(ScottishWaterResourceLevel)
class ScottishWaterResourceLevelAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "last_updated")
    search_fields = ("name",)

@admin.register(ScottishWaterAverageLevel)
class ScottishWaterAverageLevelAdmin(admin.ModelAdmin):
    list_display = ("date", "current", "change_from_last_week", "difference_from_average")

@admin.register(ScottishWaterRegionalLevel)
class ScottishWaterRegionalLevelAdmin(admin.ModelAdmin):
    list_display = ("area", "date", "current", "change_from_last_week", "difference_from_average")
    list_filter = ("area",)

@admin.register(ScottishWaterLevel)
class ScottishWaterLevelAdmin(admin.ModelAdmin):
    list_display = ("date", "region", "current", "change_from_last_week", "diff_from_average")
    list_filter = ("region", "date")
