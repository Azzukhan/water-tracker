import os
import sys
import django
import pandas as pd

if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()

from water_levels.models import YorkshireReservoirData, YorkshireWaterPrediction


def generate_yorkshire_predictions() -> None:
    """Generate simple rolling predictions for Yorkshire Water."""
    qs = YorkshireReservoirData.objects.order_by("report_date")
    if qs.count() == 0:
        return

    df = pd.DataFrame(qs.values("report_date", "reservoir_level"))
    df["report_date"] = pd.to_datetime(df["report_date"])
    df = df.set_index("report_date").asfreq("D")
    df = df.fillna(method="ffill")

    reservoir_roll = df["reservoir_level"].rolling(window=3, min_periods=1).mean()

    last_value = float(reservoir_roll.iloc[-1])
    last_date = df.index[-1]

    for i in range(1, 31):
        target_date = last_date + pd.Timedelta(days=i)
        YorkshireWaterPrediction.objects.update_or_create(
            date=target_date,
            model_type="LSTM",
            defaults={
                "predicted_reservoir_percent": round(last_value, 2),
                "predicted_demand_mld": 0.0,
            },
        )


if __name__ == "__main__":
    generate_yorkshire_predictions()
