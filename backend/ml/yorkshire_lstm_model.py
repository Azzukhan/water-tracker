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


def train_yorkshire_lstm(df: pd.DataFrame, target: str):
    df = df.set_index("date")
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[[target]])
    X, y = [], []
    for i in range(10, len(scaled)):
        X.append(scaled[i-10:i])
        y.append(scaled[i])
    X, y = np.array(X), np.array(y)
    model = Sequential()
    model.add(Input(shape=(X.shape[1], 1)))
    model.add(LSTM(50, activation="relu"))
    model.add(Dense(1))
    model.compile(optimizer="adam", loss="mse")
    model.fit(X, y, epochs=50, verbose=0)
    preds = []
    last_input = scaled[-10:]
    for _ in range(4):
        pred = model.predict(last_input.reshape(1, 10, 1), verbose=0)
        preds.append(pred[0][0])
        last_input = np.vstack((last_input[1:], pred))
    inv = scaler.inverse_transform(np.array(preds).reshape(-1, 1)).flatten()
    return inv


def train_and_predict_yorkshire() -> None:
    """Train LSTM on Yorkshire reservoir data and save predictions."""
    qs = YorkshireReservoirData.objects.order_by("report_date")
    if qs.count() < 12:
        return

    df = pd.DataFrame(qs.values("report_date", "reservoir_level"))
    df = df.rename(columns={"report_date": "date", "reservoir_level": "level"})

    preds = train_yorkshire_lstm(df, target="level")

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
