import warnings
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta
from water_levels.models import SouthernWaterReservoirLevel, SouthernWaterReservoirForecast

def generate_southern_arima_forecast():
    warnings.filterwarnings("ignore")  # Optionally suppress warnings
    qs = SouthernWaterReservoirLevel.objects.order_by("reservoir", "date")
    if not qs.exists():
        print("No data in SouthernWaterReservoirLevel")
        return "no data"

    for reservoir in qs.values_list("reservoir", flat=True).distinct():
        res_qs = qs.filter(reservoir=reservoir)
        if res_qs.count() < 12:
            print(f"Skipping {reservoir}: not enough data ({res_qs.count()})")
            continue

        df = pd.DataFrame(res_qs.values("date", "current_level"))
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index()
        df = df.resample("W").ffill()

        # Debug: Print recent values
        print(f"Reservoir: {reservoir}")
        print("Last values before interpolate:")
        print(df["current_level"].tail(10))

        # Only interpolate if there are a few missing values (not all)
        if df["current_level"].isnull().all():
            print(f"All NaN for {reservoir}, skipping.")
            continue

        df["current_level"] = df["current_level"].interpolate()
        print("Last values after interpolate:")
        print(df["current_level"].tail(10))

        if df["current_level"].nunique() == 1:
            print(f"{reservoir} is constant value, skipping.")
            continue

        try:
            model = ARIMA(df["current_level"], order=(2, 1, 2))
            fit = model.fit()
            # Predict the next 6 months (approx. 24 weeks)
            forecast = fit.forecast(steps=24)
        except Exception as e:
            print(f"ARIMA fit error for {reservoir}: {e}")
            continue

        last_date = df.index[-1].date()
        for i, val in enumerate(forecast):
            target = last_date + timedelta(weeks=i + 1)
            SouthernWaterReservoirForecast.objects.update_or_create(
                reservoir=reservoir,
                date=target,
                model_type="ARIMA",
                defaults={"predicted_level": round(float(val), 2)},
            )
        print(
            f"ARIMA forecast for {reservoir}: {[round(float(x),2) for x in forecast]}"
        )
    return "arima"

if __name__ == "__main__":
    generate_southern_arima_forecast()