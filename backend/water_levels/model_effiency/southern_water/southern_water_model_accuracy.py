from water_levels.models import (
        SouthernWaterReservoirForecast,
        SouthernWaterReservoirLevel,
        SouthernWaterForecastAccuracy,
    )

def calculate_southernwater_accuracy():
    """Calculate accuracy of Southern Water forecasts for the most recent actual value per reservoir and model."""

    reservoirs = (
        SouthernWaterReservoirLevel.objects.values_list('reservoir', flat=True).distinct()
    )

    for reservoir in reservoirs:
        latest_actual = (
            SouthernWaterReservoirLevel.objects
            .filter(reservoir=reservoir)
            .order_by('-date')
            .first()
        )
        if not latest_actual:
            print(f"No actual data for {reservoir}")
            continue

        model_types = (
            SouthernWaterReservoirForecast.objects
            .filter(reservoir=reservoir)
            .values_list('model_type', flat=True)
            .distinct()
        )

        for model in model_types:
            candidates = (
                SouthernWaterReservoirForecast.objects
                .filter(reservoir=reservoir, model_type=model)
            )
            if not candidates.exists():
                print(f"No forecast for {reservoir} {model}")
                continue

            closest = min(
                candidates,
                key=lambda f: abs((f.date - latest_actual.date).days)
            )

            actual_val = latest_actual.current_level
            predicted_val = closest.predicted_level
            try:
                error = abs((actual_val - predicted_val) / actual_val) * 100
            except ZeroDivisionError:
                error = 0.0

            SouthernWaterForecastAccuracy.objects.update_or_create(
                reservoir=reservoir,
                date=latest_actual.date,
                model_type=model,
                defaults={
                    "predicted_level": predicted_val,
                    "actual_level": actual_val,
                    "percentage_error": round(error, 2),
                },
            )
            print(f"Accuracy for {reservoir} {model} on {latest_actual.date}: pred={predicted_val} (forecast for {closest.date}), actual={actual_val}, error={round(error,2)}%")

    return "southern accuracy updated"


if __name__ == "__main__":
    calculate_southernwater_accuracy()
    