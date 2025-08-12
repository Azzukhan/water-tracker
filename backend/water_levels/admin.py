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
    EnglandwaterStation,
    EnglandwaterLevel,
    EnglandwaterPrediction,
    EnglandwaterPredictionAccuracy,
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


admin.site.register(YorkshireWaterPrediction)
admin.site.register(YorkshireReservoirData)
admin.site.register(SouthernWaterReservoirLevel)
admin.site.register(SouthernWaterReservoirForecast)
admin.site.register(EnglandwaterStation)
@admin.register(EnglandwaterLevel)
class EnglandwaterLevelAdmin(admin.ModelAdmin):
    list_display = (
        "station",
        "date",
        "value",
        "quality",
    )
    ordering = ("-date",)  # Show most recent records first
    list_filter = ("station", "quality")

admin.site.register(EnglandwaterPrediction)
admin.site.register(EnglandwaterPredictionAccuracy)
admin.site.register(SevernTrentForecastAccuracy)
admin.site.register(YorkshireWaterPredictionAccuracy)
admin.site.register(SouthernWaterForecastAccuracy)
admin.site.register(ScottishWaterPredictionAccuracy)
admin.site.register(ScottishWaterForecast)
admin.site.register(ScottishWaterRegionalForecast)
admin.site.register(ScottishWaterForecastAccuracy)
