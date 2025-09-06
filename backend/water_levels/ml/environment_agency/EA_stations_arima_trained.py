from datetime import timedelta
import warnings
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from water_levels.utils import get_region_timeseries
from water_levels.models import EAwaterPrediction



def predict_arima(df):
    """Return 16-week ARIMA forecast, suppressing convergence warnings."""
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=UserWarning)
        model = ARIMA(df, order=(2, 1, 2))
        fitted = model.fit()
    return fitted.forecast(steps=16)

def generate_EA_station_arima_forecast():

    for region in ["north", "south", "east", "west"]:
        series = get_region_timeseries(region)
        if len(series.dropna()) < 32:
            continue

        last_date = series.index[-1]

        arima_preds = predict_arima(series)

        for i in range(16):
            pred_date = last_date + timedelta(weeks=i + 1)
            EAwaterPrediction.objects.update_or_create(
                region=region,
                model_type="ARIMA",
                date=pred_date,
                defaults={"predicted_value": float(arima_preds.iloc[i])},
            )
    return "predictions updated"

if __name__ == "__main__":
    generate_EA_station_arima_forecast()