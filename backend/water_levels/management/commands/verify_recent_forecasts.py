from __future__ import annotations
from django.core.management.base import BaseCommand
from django.db.models import F
from datetime import date, timedelta
import pandas as pd, os

from water_levels.models import (
    ScottishWaterAverageLevel, SevernTrentReservoirLevel, SouthernWaterReservoirLevel, YorkshireReservoirData,
    ScottishWaterForecast, SevernTrentReservoirForecast, SouthernWaterReservoirForecast, YorkshireWaterPrediction,
    ScottishWaterForecastAccuracy, SevernTrentForecastAccuracy, SouthernWaterForecastAccuracy, YorkshireWaterPredictionAccuracy,
    ScottishWaterRegionalLevel, ScottishWaterRegionalForecast, ScottishWaterPredictionAccuracy
)

def _pct_err(y_true: float, y_pred: float) -> float | None:
    if y_true is None or y_pred is None:
        return None
    d = abs((y_true - y_pred) / (abs(y_true) if abs(y_true) > 1e-9 else 1e-9)) * 100.0
    return round(float(d), 2)

def _r2(y, p):
    y = y.values.astype(float)
    p = p.values.astype(float)
    ybar = y.mean()
    ss_res = ((y - p)**2).sum()
    ss_tot = ((y - ybar)**2).sum()
    return round(float(1 - ss_res / (ss_tot + 1e-12)), 3)

def _ensure_dir(p):
    if p:
        os.makedirs(p, exist_ok=True)

def verify_scotland(window_days: int) -> pd.DataFrame:
    cutoff = date.today() - timedelta(days=window_days)
    a = pd.DataFrame(list(ScottishWaterAverageLevel.objects.filter(date__gte=cutoff).values("date","current")))
    p = pd.DataFrame(list(ScottishWaterForecast.objects.filter(date__gte=cutoff).values("date","model_type","predicted_percentage")))
    if a.empty or p.empty:
        return pd.DataFrame()
    df = p.merge(a, on="date", how="inner")
    out = []
    for _, r in df.iterrows():
        yt = round(float(r["current"]), 2)
        yp = round(float(r["predicted_percentage"]), 2)
        pe = _pct_err(yt, yp)
        ScottishWaterForecastAccuracy.objects.update_or_create(date=r["date"], model_type=r["model_type"], defaults=dict(predicted_percentage=yp, actual_percentage=yt, percentage_error=pe))
        out.append(dict(source="Scotland", model=r["model_type"], date=r["date"], y_true=yt, y_pred=yp, pe=pe))
    return pd.DataFrame(out)

def verify_scotland_regions(window_days: int) -> pd.DataFrame:
    cutoff = date.today() - timedelta(days=window_days)
    a = pd.DataFrame(list(ScottishWaterRegionalLevel.objects.filter(date__gte=cutoff).values("area","date","current")))
    p = pd.DataFrame(list(ScottishWaterRegionalForecast.objects.filter(date__gte=cutoff).values("area","date","model_type","predicted_level")))
    if a.empty or p.empty:
        return pd.DataFrame()
    df = p.merge(a, on=["area","date"], how="inner")
    out = []
    for _, r in df.iterrows():
        yt = round(float(r["current"]), 2)
        yp = round(float(r["predicted_level"]), 2)
        pe = _pct_err(yt, yp)
        ScottishWaterPredictionAccuracy.objects.update_or_create(area=r["area"], date=r["date"], model_type=r["model_type"], defaults=dict(predicted_value=yp, actual_value=yt, percentage_error=pe))
        out.append(dict(source=f"Scotland:{r['area']}", model=r["model_type"], date=r["date"], y_true=yt, y_pred=yp, pe=pe))
    return pd.DataFrame(out)

def verify_severn(window_days: int) -> pd.DataFrame:
    cutoff = date.today() - timedelta(days=window_days)
    a = pd.DataFrame(list(SevernTrentReservoirLevel.objects.filter(date__gte=cutoff).values("date","percentage")))
    p = pd.DataFrame(list(SevernTrentReservoirForecast.objects.filter(date__gte=cutoff).values("date","model_type","predicted_percentage")))
    if a.empty or p.empty:
        return pd.DataFrame()
    df = p.merge(a, on="date", how="inner")
    out = []
    for _, r in df.iterrows():
        yt = round(float(r["percentage"]), 2)
        yp = round(float(r["predicted_percentage"]), 2)
        pe = _pct_err(yt, yp)
        SevernTrentForecastAccuracy.objects.update_or_create(date=r["date"], model_type=r["model_type"], defaults=dict(predicted_percentage=yp, actual_percentage=yt, percentage_error=pe))
        out.append(dict(source="SevernTrent", model=r["model_type"], date=r["date"], y_true=yt, y_pred=yp, pe=pe))
    return pd.DataFrame(out)

def verify_yorkshire(window_days: int) -> pd.DataFrame:
    cutoff = date.today() - timedelta(days=window_days)
    a = pd.DataFrame(list(YorkshireReservoirData.objects.filter(report_date__gte=cutoff).values(date=F("report_date"), level=F("reservoir_level"))))
    p = pd.DataFrame(list(YorkshireWaterPrediction.objects.filter(date__gte=cutoff).values("date","model_type","predicted_reservoir_percent")))
    if a.empty or p.empty:
        return pd.DataFrame()
    df = p.merge(a, on="date", how="inner")
    out = []
    for _, r in df.iterrows():
        yt = round(float(r["level"]), 2)
        yp = round(float(r["predicted_reservoir_percent"]), 2)
        pe = _pct_err(yt, yp)
        YorkshireWaterPredictionAccuracy.objects.update_or_create(date=r["date"], model_type=r["model_type"], defaults=dict(predicted_reservoir_percent=yp, actual_reservoir_percent=yt, reservoir_error=pe, predicted_demand_mld=0.0))
        out.append(dict(source="Yorkshire", model=r["model_type"], date=r["date"], y_true=yt, y_pred=yp, pe=pe))
    return pd.DataFrame(out)

def verify_southern(window_days: int) -> pd.DataFrame:
    cutoff = date.today() - timedelta(days=window_days)
    a = pd.DataFrame(list(SouthernWaterReservoirLevel.objects.filter(date__gte=cutoff).values("reservoir","date","current_level")))
    p = pd.DataFrame(list(SouthernWaterReservoirForecast.objects.filter(date__gte=cutoff).values("reservoir","date","model_type","predicted_level")))
    if a.empty or p.empty:
        return pd.DataFrame()
    df = p.merge(a, on=["reservoir","date"], how="inner")
    out = []
    for _, r in df.iterrows():
        yt = round(float(r["current_level"]), 2)
        yp = round(float(r["predicted_level"]), 2)
        pe = _pct_err(yt, yp)
        SouthernWaterForecastAccuracy.objects.update_or_create(reservoir=r["reservoir"], date=r["date"], model_type=r["model_type"], defaults=dict(predicted_level=yp, actual_level=yt, percentage_error=pe))
        out.append(dict(source=f"Southern:{r['reservoir']}", model=r["model_type"], date=r["date"], y_true=yt, y_pred=yp, pe=pe))
    return pd.DataFrame(out)

class Command(BaseCommand):
    help = "Verify issued forecasts vs actuals over a recent window and write accuracy metrics."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=90)
        parser.add_argument("--out", default="backtests/live_verification_summary.csv")

    def handle(self, *args, **opts):
        window = int(opts["days"])
        out = opts["out"]
        _ensure_dir(os.path.dirname(out))
        parts = []
        parts.append(verify_scotland(window))
        parts.append(verify_scotland_regions(window))
        parts.append(verify_severn(window))
        parts.append(verify_yorkshire(window))
        parts.append(verify_southern(window))
        df = pd.concat([p for p in parts if p is not None and not p.empty], ignore_index=True) if any([p is not None for p in parts]) else pd.DataFrame()
        if df is None or df.empty:
            self.stdout.write(self.style.WARNING("No overlaps between issued forecasts and actuals in window."))
            return
        def rmse(g):
            e = (g["y_true"] - g["y_pred"])**2
            return round(float((e.mean())**0.5), 2)
        def mape(g):
            y, p = g["y_true"].values, g["y_pred"].values
            denom = (abs(y) + 1e-9)
            return round(float((abs(y - p) / denom).mean() * 100.0), 2)
        def r2(g):
            try:
                return _r2(g["y_true"], g["y_pred"])
            except Exception:
                return None
        agg = (df.groupby(["source","model"]).apply(lambda g: pd.Series({"MAPE_%": mape(g), "RMSE_%pts": rmse(g), "R2": r2(g)})).reset_index())
        agg.to_csv(out, index=False)
        self.stdout.write(self.style.SUCCESS(f"Verification complete → {out}"))
