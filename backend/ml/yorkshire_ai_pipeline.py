import os
import sys
import django
import pandas as pd
from dateutil.relativedelta import relativedelta

if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()

from water_levels.models import YorkshireWaterReport, YorkshireWaterPrediction


def generate_yorkshire_predictions() -> None:
    """Generate simple rolling predictions for Yorkshire Water."""
    qs = YorkshireWaterReport.objects.order_by("report_month")
    if qs.count() == 0:
        return

    df = pd.DataFrame(qs.values("report_month", "reservoir_percent", "demand_megalitres_per_day"))
    df["report_month"] = pd.to_datetime(df["report_month"])
    df = df.set_index("report_month").asfreq("MS")
    df = df.fillna(method="ffill")

    reservoir_roll = df["reservoir_percent"].rolling(window=3, min_periods=1).mean()
    demand_roll = df["demand_megalitres_per_day"].rolling(window=3, min_periods=1).mean()

    last_date = df.index[-1]
    preds = []
    for i in range(1, 4):
        date = last_date + relativedelta(months=i)
        preds.append(
            {
                "date": date,
                "reservoir": float(reservoir_roll.iloc[-3: ].mean()),
                "demand": float(demand_roll.iloc[-3: ].mean()),
            }
        )

    for item in preds:
        YorkshireWaterPrediction.objects.update_or_create(
            date=item["date"],
            model_type="LSTM",
            defaults={
                "predicted_reservoir_percent": round(item["reservoir"], 2),
                "predicted_demand_mld": round(item["demand"], 2),
            },
        )


if __name__ == "__main__":
    generate_yorkshire_predictions()
