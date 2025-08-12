
from datetime import datetime
from water_levels.models import (
        YorkshireWaterPrediction,
        YorkshireReservoirData,
        YorkshireWaterPredictionAccuracy,
    )

def calculate_yorkshire_accuracy():
    """Calculate accuracy of Yorkshire Water predictions."""

    today = datetime.today().date()
    preds = YorkshireWaterPrediction.objects.filter(date__lte=today)
    for p in preds:
        # Fixed field name
        report = YorkshireReservoirData.objects.filter(report_date=p.date).first()
        if report:
            res_error = (
                abs(
                    (report.reservoir_level - p.predicted_reservoir_percent)
                    / report.reservoir_level
                )
                * 100
                if report.reservoir_level
                else None
            )
            dem_error = None
            if hasattr(report, "demand_megalitres_per_day") and report.demand_megalitres_per_day:
                dem_error = (
                    abs(
                        (report.demand_megalitres_per_day - p.predicted_demand_mld)
                        / report.demand_megalitres_per_day
                    )
                    * 100
                )
            YorkshireWaterPredictionAccuracy.objects.update_or_create(
                date=p.date,
                model_type=p.model_type,
                defaults={
                    "predicted_reservoir_percent": p.predicted_reservoir_percent,
                    "actual_reservoir_percent": report.reservoir_level,
                    "reservoir_error": (
                        round(res_error, 2) if res_error is not None else None
                    ),
                    "predicted_demand_mld": p.predicted_demand_mld,
                    "actual_demand_mld": getattr(report, "demand_megalitres_per_day", None),
                    "demand_error": (
                        round(dem_error, 2) if dem_error is not None else None
                    ),
                },
            )
        else:
            print(f"No report for {p.date}")
    return "yorkshire accuracy updated"

if __name__ == "__main__":
    calculate_yorkshire_accuracy()