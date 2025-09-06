from water_levels.models import (
    ScottishWaterRegionalLevel,
    ScottishWaterRegionalForecast,
)
import pandas as pd
import numpy as np
import statsmodels.api as sm
from datetime import timedelta


def generate_scottish_water_regional_regression_forecast():
    """Generate regression forecasts for each Scottish Water region."""
    areas = (
        ScottishWaterRegionalLevel.objects.values_list("area", flat=True).distinct()
    )

    for area in areas:
        qs = ScottishWaterRegionalLevel.objects.filter(area=area).order_by("date")
        if qs.count() < 12:
            continue

        df = pd.DataFrame(qs.values("date", "current"))
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").asfreq("W-MON")
        df["current"] = df["current"].interpolate()

        df["t"] = np.arange(len(df))
        period = 52
        df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
        df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)
        X = sm.add_constant(df[["t", "sin_t", "cos_t"]])
        model = sm.OLS(df["current"], X).fit()

        last_t = df["t"].iloc[-1]
        preds = []
        for i in range(1, 5):
            t = last_t + i
            sin_t = np.sin(2 * np.pi * t / period)
            cos_t = np.cos(2 * np.pi * t / period)
            X_new = sm.add_constant(
                pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
                has_constant="add",
            )
            preds.append(model.predict(X_new)[0])

        last_date = qs.last().date
        for i, pred in enumerate(preds):
            target = last_date + timedelta(weeks=i + 1)
            ScottishWaterRegionalForecast.objects.update_or_create(
                area=area,
                date=target,
                model_type="REGRESSION",
                defaults={"predicted_level": round(float(pred), 2)},
            )

    return "Scottish Water regional regression forecasts complete"

if __name__ == "__main__":
    generate_scottish_water_regional_regression_forecast()
