from water_levels.models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
import pandas as pd
from datetime import timedelta
from water_levels.ml.general_lstm.lstm import train_lstm

def generate_severn_trent_lstm_forecast():
    """Generate LSTM forecast for Severn Trent reservoir levels."""
    qs = SevernTrentReservoirLevel.objects.order_by("date")
    if qs.count() < 30:
        return "Not enough data"

    df = pd.DataFrame(qs.values("date", "percentage"))
    preds = train_lstm(df)
    last_date = qs.last().date

    for i, val in enumerate(preds):
        target = last_date + timedelta(weeks=i + 1)
        SevernTrentReservoirForecast.objects.update_or_create(
            date=target,
            model_type="LSTM",
            defaults={"predicted_percentage": round(val, 2)},
        )
    return "LSTM forecast complete"

if __name__ == "__main__":
    generate_severn_trent_lstm_forecast()