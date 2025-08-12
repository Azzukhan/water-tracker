import numpy as np
from water_levels.utils import get_region_timeseries
from sklearn.linear_model import LinearRegression
from datetime import timedelta
from water_levels.models import EAwaterPrediction

def predict_regression(df):
    series = df.dropna().reset_index()
    series["t"] = np.arange(len(series))
    period = 52
    X = np.column_stack(
        [
            np.ones(len(series)),
            series["t"],
            np.sin(2 * np.pi * series["t"] / period),
            np.cos(2 * np.pi * series["t"] / period),
        ]
    )
    model = LinearRegression().fit(X, series["value"])
    preds = []
    last_t = series["t"].iloc[-1]
    for i in range(1, 17):
        t = last_t + i
        xt = np.array(
            [[1, t, np.sin(2 * np.pi * t / period), np.cos(2 * np.pi * t / period)]]
        )
        preds.append(model.predict(xt)[0])
    return preds

def generate_EA_station_regression_forecast():

    for region in ["north", "south", "east", "west"]:
        series = get_region_timeseries(region)
        if len(series.dropna()) < 32:
            continue

        last_date = series.index[-1]
        reg_preds = predict_regression(series)

        for i in range(16):
            pred_date = last_date + timedelta(weeks=i + 1)
            EAwaterPrediction.objects.update_or_create(
                region=region,
                model_type="REGRESSION",
                date=pred_date,
                defaults={"predicted_value": float(reg_preds[i])},
            )
    return "predictions updated"

if __name__ == "__main__":
    generate_EA_station_regression_forecast()
# If running as a script, generate the regression forecast