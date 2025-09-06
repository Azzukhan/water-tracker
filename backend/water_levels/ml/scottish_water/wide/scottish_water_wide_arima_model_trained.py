import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta
from water_levels.models import ScottishWaterAverageLevel, ScottishWaterForecast

def generate_scottish_water_wide_arima_forecast():
    """Generate 4-week ARIMA forecast for Scottish Water average levels."""

    qs = ScottishWaterAverageLevel.objects.order_by("date")
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "current"))
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").asfreq("W-MON")
    df["current"] = df["current"].interpolate()

    model = ARIMA(df["current"], order=(2, 1, 2))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=4)

    last_date = qs.last().date
    for i, value in enumerate(forecast):
        target_date = last_date + timedelta(weeks=i + 1)
        ScottishWaterForecast.objects.update_or_create(
            date=target_date,
            model_type="ARIMA",
            defaults={"predicted_percentage": round(float(value), 2)},
        )
    return "ARIMA forecast complete"

if __name__ == "__main__":
    generate_scottish_water_wide_arima_forecast()
    