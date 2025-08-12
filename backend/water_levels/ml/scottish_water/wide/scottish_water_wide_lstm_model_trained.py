from water_levels.models import ScottishWaterAverageLevel, ScottishWaterForecast
from water_levels.ml.general_lstm.lstm import train_lstm
import pandas as pd
from datetime import timedelta

def generate_scottish_water_wide_lstm_forecast():

    qs = ScottishWaterAverageLevel.objects.order_by("date")
    if qs.count() < 30:
        return "Not enough data"

    df = pd.DataFrame(qs.values("date", "current"))
    df = df.rename(columns={"current": "percentage"})
    preds = train_lstm(df, steps=4)
    last_date = qs.last().date

    for i, val in enumerate(preds):
        target = last_date + timedelta(weeks=i + 1)
        ScottishWaterForecast.objects.update_or_create(
            date=target,
            model_type="LSTM",
            defaults={"predicted_percentage": round(float(val), 2)},
        )
    return "LSTM forecast complete"

if __name__ == "__main__":
    generate_scottish_water_wide_lstm_forecast()