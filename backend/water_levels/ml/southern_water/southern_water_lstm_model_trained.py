import pandas as pd
from datetime import timedelta
from water_levels.ml.general_lstm.lstm import train_lstm
from water_levels.models import SouthernWaterReservoirLevel, SouthernWaterReservoirForecast

def generate_southern_lstm_forecast():
    """
    Generate LSTM-based forecasts for Southern Water reservoirs and save predictions to the DB.
    """
    qs = SouthernWaterReservoirLevel.objects.order_by("reservoir", "date")
    if not qs.exists():
        return "no data"

    for reservoir in qs.values_list("reservoir", flat=True).distinct():
        res_qs = qs.filter(reservoir=reservoir)
        if res_qs.count() < 30:
            continue 

        df = pd.DataFrame(res_qs.values("date", "current_level"))
        df = df.rename(columns={"current_level": "percentage"})

        preds = train_lstm(df, steps=24)

        last_date = res_qs.last().date
        for i, val in enumerate(preds):
            target = last_date + timedelta(weeks=i + 1)
            SouthernWaterReservoirForecast.objects.update_or_create(
                reservoir=reservoir,
                date=target,
                model_type="LSTM",
                defaults={"predicted_level": round(float(val), 2)},
            )
    return "lstm"

if __name__ == "__main__":
    generate_southern_lstm_forecast()