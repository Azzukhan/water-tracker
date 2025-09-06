from datetime import timedelta
from water_levels.ml.general_lstm.lstm import train_lstm
from water_levels.utils import get_region_timeseries
from water_levels.models import EAwaterPrediction

def predict_lstm(df):
    lstm_df = df.dropna().reset_index().rename(columns={"value": "percentage"})
    return train_lstm(lstm_df, steps=16)

def generate_EA_station_lstm_forecast():

    for region in ["north", "south", "east", "west"]:
        series = get_region_timeseries(region)
        if len(series.dropna()) < 32:
            continue

        last_date = series.index[-1]

        lstm_preds = predict_lstm(series)

        for i in range(16):
            pred_date = last_date + timedelta(weeks=i + 1)
            EAwaterPrediction.objects.update_or_create(
                region=region,
                model_type="LSTM",
                date=pred_date,
                defaults={"predicted_value": float(lstm_preds[i])},
            )
    return "predictions updated"

if __name__ == "__main__":
    generate_EA_station_lstm_forecast()