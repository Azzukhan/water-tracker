import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from dateutil.relativedelta import relativedelta

from water_levels.models import YorkshireReservoirData, YorkshireWaterPrediction


def generate_yorkshire_arima_forecast() -> None:
    qs = YorkshireReservoirData.objects.order_by("report_date")
    if qs.count() < 12:
        return

    df = pd.DataFrame(qs.values("report_date", "reservoir_level"))
    df["report_date"] = pd.to_datetime(df["report_date"])
    df = df.set_index("report_date").asfreq("MS")
    df["reservoir_level"] = df["reservoir_level"].interpolate()

    model = ARIMA(df["reservoir_level"], order=(2, 1, 2))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=4)

    last_date = qs.last().report_date
    for i, value in enumerate(forecast):
        target_date = last_date + relativedelta(months=i + 1)
        YorkshireWaterPrediction.objects.update_or_create(
            date=target_date,
            model_type="ARIMA",
            defaults={
                "predicted_reservoir_percent": round(float(value), 2),
                "predicted_demand_mld": 0.0,
            },
        )

