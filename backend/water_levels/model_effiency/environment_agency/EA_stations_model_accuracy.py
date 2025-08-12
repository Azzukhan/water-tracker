from datetime import datetime, timedelta
from django.db.models import Avg
from water_levels.models import EAwaterLevel, EAwaterPrediction, EAwaterPredictionAccuracy

# This script calculates the accuracy of EA water level predictions by comparing them with actual values.
def calculate_EA_stations_water_prediction_accuracy():
    today = datetime.today().date()
    model_types = ['ARIMA', 'LSTM', 'REGRESSION']

    regions = EAwaterLevel.objects.values_list('station__region', flat=True).distinct()
    for region in regions:
        # 1. Find latest actual date and value
        last_actual = (
            EAwaterLevel.objects
            .filter(station__region=region, date__lte=today)
            .values('date')
            .annotate(avg_actual=Avg('value'))
            .order_by('-date')
            .first()
        )
        if not last_actual:
            continue

        last_actual_date = last_actual['date']
        last_actual_value = last_actual['avg_actual']

        # 2. For each model, look for closest forecast within ±7 days
        for model_type in model_types:
            forecasts = (
                EAwaterPrediction.objects
                .filter(
                    region=region,
                    model_type=model_type,
                    date__gte=last_actual_date - timedelta(days=7),
                    date__lte=last_actual_date + timedelta(days=7),
                )
                .values('date', 'predicted_value')
            )

            if not forecasts:
                continue

            # 3. Find forecast with the smallest date difference to actual
            closest = min(
                forecasts,
                key=lambda f: abs((f['date'] - last_actual_date).days)
            )
            forecast_date = closest['date']
            predicted_value = closest['predicted_value']

            # 4. Calculate and store accuracy
            if last_actual_value is not None and predicted_value is not None:
                error = abs((last_actual_value - predicted_value) / last_actual_value) * 100
                EAwaterPredictionAccuracy.objects.update_or_create(
                    region=region,
                    date=forecast_date,
                    model_type=model_type,
                    defaults={
                        "predicted_value": predicted_value,
                        "actual_value": last_actual_value,
                        "percentage_error": round(error, 2),
                    },
                )

    return "accuracy updated"

if __name__ == "__main__":
    calculate_EA_stations_water_prediction_accuracy()