from django.contrib import admin
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterReport,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
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


admin.site.register(YorkshireWaterReport)
admin.site.register(YorkshireWaterPrediction)
admin.site.register(YorkshireReservoirData)
