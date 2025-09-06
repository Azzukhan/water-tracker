from datetime import datetime
from water_levels.models import (
        ScottishWaterPredictionAccuracy,
        ScottishWaterRegionalLevel,
        ScottishWaterRegionalForecast,
    )

def calculate_scottish_water_regional_accuracy():
    """Calculate accuracy of Scottish Water regional forecasts."""
    today = datetime.today().date()
    areas = (
        ScottishWaterRegionalLevel.objects.values_list("area", flat=True).distinct()
    )
    for area in areas:
        latest_actual = (
            ScottishWaterRegionalLevel.objects
            .filter(area=area, date__lte=today)
            .order_by("-date")
            .first()
        )
        if not latest_actual:
            continue

        forecasts = ScottishWaterRegionalForecast.objects.filter(
            area=area, date=latest_actual.date
        )
        for f in forecasts:
            try:
                error = (
                    abs((latest_actual.current - f.predicted_level) / latest_actual.current)
                    * 100
                )
            except ZeroDivisionError:
                error = 0.0
            ScottishWaterPredictionAccuracy.objects.update_or_create(
                area=area,
                date=f.date,
                model_type=f.model_type,
                defaults={
                    "predicted_value": f.predicted_level,
                    "actual_value": latest_actual.current,
                    "percentage_error": round(error, 2),
                },
            )
    return "scottish regional accuracy updated"

if __name__ == "__main__":
    calculate_scottish_water_regional_accuracy()