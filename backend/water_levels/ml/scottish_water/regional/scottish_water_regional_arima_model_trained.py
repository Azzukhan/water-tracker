from water_levels.models import (
    ScottishWaterRegionalLevel,
    ScottishWaterRegionalForecast,
)
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta


def generate_scottish_water_regional_arima_forecast():
    """Generate ARIMA forecasts for each Scottish Water region."""
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

        model = ARIMA(df["current"], order=(2, 1, 2)).fit()
        preds = model.forecast(steps=4)

        last_date = qs.last().date
        for i, pred in enumerate(preds):
            target = last_date + timedelta(weeks=i + 1)
            ScottishWaterRegionalForecast.objects.update_or_create(
                area=area,
                date=target,
                model_type="ARIMA",
                defaults={"predicted_level": round(float(pred), 2)},
            )

    return "Scottish Water regional ARIMA forecasts complete"

if __name__ == "__main__":
    generate_scottish_water_regional_arima_forecast()