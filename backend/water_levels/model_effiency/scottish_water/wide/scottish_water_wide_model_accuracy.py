from water_levels.models import (
        ScottishWaterForecast,
        ScottishWaterAverageLevel,
        ScottishWaterForecastAccuracy,
    )

def calculate_scottish_water_wide_accuracy():
    """Calculate accuracy of Scotland-wide Scottish Water forecasts."""
    latest_actual = ScottishWaterAverageLevel.objects.order_by("-date").first()
    if latest_actual:
        forecasts = ScottishWaterForecast.objects.filter(date=latest_actual.date)
        if forecasts.exists():
            for f in forecasts:
                try:
                    error = (
                        abs((latest_actual.current - f.predicted_percentage) / latest_actual.current)
                        * 100
                    )
                except ZeroDivisionError:
                    error = 0.0
                ScottishWaterForecastAccuracy.objects.update_or_create(
                    date=f.date,
                    model_type=f.model_type,
                    defaults={
                        "predicted_percentage": f.predicted_percentage,
                        "actual_percentage": latest_actual.current,
                        "percentage_error": round(error, 2),
                    },
                )
                print(
                    f"[Scotland-wide] Accuracy for {f.model_type} on {f.date}: "
                    f"Prediction={f.predicted_percentage}, "
                    f"Actual={latest_actual.current}, Error={round(error,2)}%"
                )
        else:
            print(f"No forecasts for Scotland-wide {latest_actual.date}")
    else:
        print("No actual data for Scotland-wide.")

    return "scotland-wide forecast accuracy updated"

if __name__ == "__main__":
    calculate_scottish_water_wide_accuracy()