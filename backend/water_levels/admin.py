from django.contrib import admin
from .models import ScottishWaterAverageLevel, ScottishWaterRegionalLevel


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
