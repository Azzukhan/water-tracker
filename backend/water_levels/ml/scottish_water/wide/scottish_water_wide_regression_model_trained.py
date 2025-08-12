from water_levels.models import ScottishWaterAverageLevel, ScottishWaterForecast
import pandas as pd
import numpy as np
import statsmodels.api as sm
from datetime import timedelta


def generate_scottish_water_wide_regression_forecast():
    qs = ScottishWaterAverageLevel.objects.order_by("date")
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "current"))
    df["date"] = pd.to_datetime(df["date"])
    # Align to weekly Mondays for consistent time series
    df = df.set_index("date").asfreq("W-MON")
    df["current"] = df["current"].interpolate()

    df["t"] = np.arange(len(df))
    period = 52
    df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
    df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
    X = sm.add_constant(df[["t", "sin_t", "cos_t"]])
    model = sm.OLS(df["current"], X).fit()

    last_t = df["t"].iloc[-1]
    last_date = qs.last().date
    for i in range(1, 5):
        t = last_t + i
        sin_t = np.sin(2 * np.pi * t / period)
        cos_t = np.cos(2 * np.pi * t / period)
        X_new = sm.add_constant(
            pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
            has_constant="add",
        )
        pred = model.predict(X_new)[0]
        target = last_date + timedelta(weeks=i)
        ScottishWaterForecast.objects.update_or_create(
            date=target,
            model_type="REGRESSION",
            defaults={"predicted_percentage": round(float(pred), 2)},
        )
    return "REGRESSION forecast complete"

if __name__ == "__main__":
    generate_scottish_water_wide_regression_forecast()