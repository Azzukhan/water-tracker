from water_levels.models import SevernTrentReservoirLevel, SevernTrentReservoirForecast
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta  

def generate_severn_trent_arima_forecast():


    qs = SevernTrentReservoirLevel.objects.order_by("date") 
    if qs.count() < 12:
        return "Insufficient data"

    df = pd.DataFrame(qs.values("date", "percentage"))
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").asfreq("W-MON")
    df["percentage"] = df["percentage"].interpolate()

    model = ARIMA(df["percentage"], order=(2, 1, 2))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=4)

    latest_date = qs.last().date
    for i, value in enumerate(forecast):
        target_date = latest_date + timedelta(weeks=i + 1)
        SevernTrentReservoirForecast.objects.update_or_create(
            date=target_date,
            model_type="ARIMA",
            defaults={"predicted_percentage": round(value, 2)},
        )
    return "ARIMA forecast complete"

if __name__ == "__main__":
    generate_severn_trent_arima_forecast()  