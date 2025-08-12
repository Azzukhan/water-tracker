from datetime import datetime
from water_levels.models import (
        SevernTrentReservoirForecast,
        SevernTrentReservoirLevel,
        SevernTrentForecastAccuracy,
    )

def calculate_severn_trent_accuracy():
    """Calculate accuracy of Severn Trent reservoir forecasts."""

    today = datetime.today().date()
    forecasts = SevernTrentReservoirForecast.objects.filter(date__lte=today)
    for f in forecasts:
        actual = SevernTrentReservoirLevel.objects.filter(date=f.date).first()
        if actual:
            error = (
                abs((actual.percentage - f.predicted_percentage) / actual.percentage)
                * 100
            )
            SevernTrentForecastAccuracy.objects.update_or_create(
                date=f.date,
                model_type=f.model_type,
                defaults={
                    "predicted_percentage": f.predicted_percentage,
                    "actual_percentage": actual.percentage,
                    "percentage_error": round(error, 2),
                },
            )
        else:
            print(f"Actual data missing for {f.date} {f.model_type}")
    return "severn accuracy updated"

if __name__ == "__main__":
    calculate_severn_trent_accuracy()