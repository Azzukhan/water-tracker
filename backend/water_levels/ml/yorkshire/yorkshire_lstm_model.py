import pandas as pd

from water_levels.models import (
    YorkshireReservoirData,
    YorkshireWaterPrediction,
)
from dateutil.relativedelta import relativedelta
from water_levels.ml.general_lstm.lstm import train_lstm


def generate_yorkshire_lstm_forecast() -> None:
    """
    Generate LSTM-based forecasts for Yorkshire reservoirs and save predictions to the DB.
    """
    qs = YorkshireReservoirData.objects.order_by("report_date")
    if qs.count() < 12:
        return

    df = pd.DataFrame(qs.values("report_date", "reservoir_level"))
    if df.empty:
        return

    df = df.rename(columns={"report_date": "date", "reservoir_level": "percentage"})
    df = df.dropna(subset=["percentage"]).sort_values("date").reset_index(drop=True)
    df["percentage"] = df["percentage"].astype(float)

    preds = train_lstm(df)  
    last_date = pd.to_datetime(df["date"].iloc[-1])
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