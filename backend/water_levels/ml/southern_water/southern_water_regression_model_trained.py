import pandas as pd
import numpy as np
import statsmodels.api as sm
from datetime import timedelta
from water_levels.models import SouthernWaterReservoirLevel, SouthernWaterReservoirForecast


def generate_southern_regression_forecast():
    """Generate regression-based forecasts for Southern Water reservoirs."""

    qs = SouthernWaterReservoirLevel.objects.order_by("reservoir", "date")
    if not qs.exists():
        return "no data"

    for reservoir in qs.values_list("reservoir", flat=True).distinct():
        res_qs = qs.filter(reservoir=reservoir)
        if res_qs.count() < 12:
            continue

        df = pd.DataFrame(res_qs.values("date", "current_level"))
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index().resample("W").ffill()
        if df["current_level"].isnull().all():
            continue

        df["current_level"] = df["current_level"].interpolate()
        df["t"] = np.arange(len(df))
        period = 52
        df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
        df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
        X = sm.add_constant(df[["t", "sin_t", "cos_t"]], has_constant="add")
        model = sm.OLS(df["current_level"], X).fit()

        last_t = df["t"].iloc[-1]
        last_date = df.index[-1].date()
        for i in range(1, 25):
            t = last_t + i
            sin_t = np.sin(2 * np.pi * t / period)
            cos_t = np.cos(2 * np.pi * t / period)
            X_new = sm.add_constant(
                pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
                has_constant="add",
            )
            pred = model.predict(X_new)[0]
            target = last_date + timedelta(weeks=i)
            SouthernWaterReservoirForecast.objects.update_or_create(
                reservoir=reservoir,
                date=target,
                model_type="REGRESSION",
                defaults={"predicted_level": round(float(pred), 2)},
            )
    return "regression"

if __name__ == "__main__":
    generate_southern_regression_forecast()