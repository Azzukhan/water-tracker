from django.contrib import admin
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
    SouthernWaterReservoirForecast,
    SouthernWaterReservoirLevel,
    EAwaterStation,
    EAwaterLevel,
    EAwaterPrediction,
    EAwaterPredictionAccuracy,
    SevernTrentForecastAccuracy,
    YorkshireWaterPredictionAccuracy,
    SouthernWaterForecastAccuracy,
    ScottishWaterPredictionAccuracy,
    ScottishWaterForecast,
    ScottishWaterRegionalForecast,
    ScottishWaterForecastAccuracy,
)


@admin.register(ScottishWaterAverageLevel)
class ScottishWaterAverageLevelAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "current",
        "change_from_last_week",
        "difference_from_average",
    )


@admin.register(ScottishWaterRegionalLevel)
class ScottishWaterRegionalLevelAdmin(admin.ModelAdmin):
    list_display = (
        "area",
        "date",
        "current",
        "change_from_last_week",
        "difference_from_average",
    )
    list_filter = ("area",)


@admin.register(SevernTrentReservoirLevel)
class SevernTrentReservoirLevelAdmin(admin.ModelAdmin):
    list_display = ("date", "percentage")


@admin.register(SevernTrentReservoirForecast)
class SevernTrentReservoirForecastAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "predicted_percentage",
        "model_type",
    )


@admin.register(YorkshireWaterPrediction)
class YorkshireWaterPredictionAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "predicted_reservoir_percent",
        "predicted_demand_mld",
        "model_type",
    )
    list_filter = ("model_type",)


@admin.register(YorkshireReservoirData)
class YorkshireReservoirDataAdmin(admin.ModelAdmin):
    list_display = (
        "report_date",
        "reservoir_level",
        "weekly_difference",
        "direction",
    )


@admin.register(SouthernWaterReservoirLevel)
class SouthernWaterReservoirLevelAdmin(admin.ModelAdmin):
    list_display = (
        "reservoir",
        "date",
        "current_level",
        "average_level",
        "change_week",
        "change_month",
        "difference_from_average",
    )
    list_filter = ("reservoir",)


@admin.register(SouthernWaterReservoirForecast)
class SouthernWaterReservoirForecastAdmin(admin.ModelAdmin):
    list_display = (
        "reservoir",
        "date",
        "predicted_level",
        "model_type",
    )
    list_filter = ("reservoir", "model_type")


@admin.register(EAwaterStation)
class EAwaterStationAdmin(admin.ModelAdmin):
    list_display = (
        "station_id",
        "name",
        "region",
        "latitude",
        "longitude",
    )
    list_filter = ("region",)


@admin.register(EAwaterLevel)
class EAwaterLevelAdmin(admin.ModelAdmin):
    list_display = (
        "station",
        "date",
        "value",
        "quality",
    )
    ordering = ("-date",)  # Show most recent records first
    list_filter = ("station", "quality")


@admin.register(EAwaterPrediction)
class EAwaterPredictionAdmin(admin.ModelAdmin):
    list_display = (
        "region",
        "date",
        "model_type",
        "predicted_value",
    )
    list_filter = ("region", "model_type")


@admin.register(EAwaterPredictionAccuracy)
class EAwaterPredictionAccuracyAdmin(admin.ModelAdmin):
    list_display = (
        "region",
        "date",
        "model_type",
        "predicted_value",
        "actual_value",
        "percentage_error",
    )
    list_filter = ("region", "model_type")


@admin.register(SevernTrentForecastAccuracy)
class SevernTrentForecastAccuracyAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "model_type",
        "predicted_percentage",
        "actual_percentage",
        "percentage_error",
    )
    list_filter = ("model_type",)


@admin.register(YorkshireWaterPredictionAccuracy)
class YorkshireWaterPredictionAccuracyAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "model_type",
        "predicted_reservoir_percent",
        "actual_reservoir_percent",
        "reservoir_error",
        "predicted_demand_mld",
        "actual_demand_mld",
        "demand_error",
    )
    list_filter = ("model_type",)


@admin.register(SouthernWaterForecastAccuracy)
class SouthernWaterForecastAccuracyAdmin(admin.ModelAdmin):
    list_display = (
        "reservoir",
        "date",
        "model_type",
        "predicted_level",
        "actual_level",
        "percentage_error",
        "forecast_date",
    )
    list_filter = ("reservoir", "model_type")


@admin.register(ScottishWaterPredictionAccuracy)
class ScottishWaterPredictionAccuracyAdmin(admin.ModelAdmin):
    list_display = (
        "area",
        "date",
        "model_type",
        "predicted_value",
        "actual_value",
        "percentage_error",
    )
    list_filter = ("area", "model_type")


@admin.register(ScottishWaterForecast)
class ScottishWaterForecastAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "predicted_percentage",
        "model_type",
    )
    list_filter = ("model_type",)


@admin.register(ScottishWaterRegionalForecast)
class ScottishWaterRegionalForecastAdmin(admin.ModelAdmin):
    list_display = (
        "area",
        "date",
        "predicted_level",
        "model_type",
    )
    list_filter = ("area", "model_type")


@admin.register(ScottishWaterForecastAccuracy)
class ScottishWaterForecastAccuracyAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "model_type",
        "predicted_percentage",
        "actual_percentage",
        "percentage_error",
    )
    list_filter = ("model_type",)
