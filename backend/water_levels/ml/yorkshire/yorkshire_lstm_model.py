import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Input, LSTM, Dense

from water_levels.models import (
    YorkshireReservoirData,
    YorkshireWaterPrediction,
)
from dateutil.relativedelta import relativedelta
from water_levels.ml.general_lstm.lstm import train_lstm





def generate_yorkshire_lstm_forecast() -> None:
    """Train LSTM on Yorkshire reservoir data and save predictions."""
    qs = YorkshireReservoirData.objects.order_by("report_date")
    if qs.count() < 12:
        return

    df = pd.DataFrame(qs.values("report_date", "reservoir_level"))
    df = df.rename(columns={"report_date": "date", "reservoir_level": "level"})

    preds = train_lstm(df, target="level")

    last_date = qs.last().report_date
    predicted_dates = [last_date + relativedelta(months=i + 1) for i in range(len(preds))]

    for d, val in zip(predicted_dates, preds):
        YorkshireWaterPrediction.objects.update_or_create(
            date=d,
            model_type="LSTM",
            defaults={
                "predicted_reservoir_percent": round(float(val), 2),
                "predicted_demand_mld": 0.0,
            },
        )


if __name__ == "__main__":
    generate_yorkshire_lstm_forecast()