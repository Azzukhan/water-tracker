# backend/water_levels/management/commands/backtest_forecasts.py
from __future__ import annotations
from django.core.management.base import BaseCommand
from dataclasses import replace
import os, pandas as pd, time

from water_levels.ml.backtesting.backtesting import (
    DatasetSpec,
    build_datasets,               
    BacktestConfig,
    load_series_with_info,          
    expanding_backtest,
    diebold_mariano,
)

class Command(BaseCommand):
    help = "Expanding-window backtests for ARIMA/LSTM/REGRESSION across all reservoirs."

    def add_arguments(self, parser):
        parser.add_argument("--initial", type=int, default=104,
                            help="Initial training points (default 104 ~2 years weekly).")
        parser.add_argument("--horizons", default="1,2,3,4",
                            help="Comma list of forecast horizons.")
        parser.add_argument("--outdir", default="backtests",
                            help="Directory for CSV outputs.")
        parser.add_argument("--models", default="ARIMA,LSTM,REGRESSION",
                            help="Comma list: ARIMA,LSTM,REGRESSION.")
        parser.add_argument("--resample", choices=["none", "auto"], default="auto",
                            help="Resample irregular series to weekly/monthly if needed.")
        parser.add_argument("--step", type=int, default=1,
                            help="Advance origins by this step (speed ↑ if >1).")
        parser.add_argument("--fast", action="store_true",
                            help="Fast mode for ARIMA/LSTM (small grids, lower maxiter).")
        parser.add_argument("--maxiter", type=int, default=None,
                            help="Override ARIMA optimizer maxiter (default 60; fast=30).")
        parser.add_argument("--only", default=None,
                            help="Substring filter on dataset label, e.g. 'Severn' or 'Scotland'.")
        parser.add_argument("--no_dm", action="store_true",
                            help="Skip Diebold–Mariano tests.")
        parser.add_argument("--no_dynamic_southern", action="store_true",
                            help="Disable dynamic discovery of Southern reservoirs.")
        parser.add_argument("--round", type=int, default=2,
                            help="Decimal places to round when writing CSVs (default 2).")

    def handle(self, *args, **opts):
        horizons = tuple(int(x) for x in str(opts["horizons"]).split(",") if x.strip())
        models = [m.strip().upper() for m in str(opts["models"]).split(",") if m.strip()]
        outdir = opts["outdir"]
        os.makedirs(outdir, exist_ok=True)

        cfg = BacktestConfig(
            initial_points=opts["initial"],
            horizons=horizons,
            step=max(1, int(opts["step"])),
            seasonal_period=52,          
            lstm_window=12,
            fast=bool(opts["fast"]),
            resample_mode=opts["resample"],
            arima_maxiter=(30 if opts["fast"] else (opts["maxiter"] or 60)),
        )

        nd = max(0, int(opts["round"]))  

        datasets = build_datasets(dynamic_southern=(not opts["no_dynamic_southern"]))

        self.stdout.write(self.style.NOTICE(
            f"Backtest start: models={models} horizons={horizons} initial={cfg.initial_points} "
            f"step={cfg.step} resample={cfg.resample_mode} fast={cfg.fast} arima_maxiter={cfg.arima_maxiter}"
        ))

        for ds in datasets:
            if opts["only"] and opts["only"].lower() not in ds.label.lower():
                continue

            t0 = time.perf_counter()
            series, info = load_series_with_info(ds, resample_mode=cfg.resample_mode)


            if info:
                self.stdout.write(
                    f"→ {ds.label} | raw_len={info['raw_len']}, resampled_len={info['resampled_len']}, "
                    f"freq={ds.target_freq}, span={info['start']}→{info['end']}"
                )

            if series is None or len(series) == 0:
                self.stdout.write(self.style.WARNING(f"[skip] {ds.label}: no data"))
                continue

            need = cfg.initial_points + max(cfg.horizons)
            if len(series) < need:

                adjusted_initial = max(24, len(series) - max(cfg.horizons) - 1)
                if adjusted_initial < 24:
                    self.stdout.write(self.style.WARNING(
                        f"[skip] {ds.label}: not enough data (len={len(series)} < {need})"
                    ))
                    continue
                self.stdout.write(self.style.WARNING(
                    f"[adj] {ds.label}: initial {cfg.initial_points}→{adjusted_initial} to fit len={len(series)}"
                ))
                run_cfg = replace(cfg, initial_points=adjusted_initial, seasonal_period=ds.seasonal_period)
            else:
                run_cfg = replace(cfg, seasonal_period=ds.seasonal_period)

            results = {}
            details = {}
            for m in models:
                det, agg = expanding_backtest(series, run_cfg, m)
                if det.empty:
                    self.stdout.write(self.style.WARNING(f"[warn] {ds.label}:{m} produced no rows"))
                    continue

                det_to_save = det.copy()
                for col in ("y_true", "y_pred", "abs_err", "squared_err"):
                    if col in det_to_save.columns:
                        det_to_save[col] = det_to_save[col].astype(float).round(nd)

                det_to_save.to_csv(os.path.join(outdir, f"{ds.label}_{m}_origins.csv"), index=False)

                results[m] = agg.set_index("h")
                details[m] = det

            if results:
                summary = pd.concat(results, axis=1)
                summary.columns = [f"{m}_{col}" for m, df in results.items() for col in df.columns]
                summary = summary.reset_index()
                for k in list(summary.columns):
                    if any(s in k for s in ["MAPE", "MAE", "RMSE", "R2"]):
                        summary[k] = summary[k].astype(float).round(nd)
                summary.to_csv(os.path.join(outdir, f"{ds.label}_summary.csv"), index=False)

            if not opts["no_dm"] and "ARIMA" in details and "LSTM" in details:
                dm_rows = []
                for h in run_cfg.horizons:
                    d1 = details["LSTM"].query("h==@h")[["origin","abs_err"]]
                    d2 = details["ARIMA"].query("h==@h")[["origin","abs_err"]]
                    merged = d1.merge(d2, on="origin", suffixes=("_lstm", "_arima"))
                    if len(merged) >= 6:
                        DM, p = diebold_mariano(
                            merged["abs_err_lstm"].values, merged["abs_err_arima"].values, h=h
                        )
                        dm_rows.append({"h": h, "DM_LSTM_minus_ARIMA": round(DM, nd), "p_value": round(p, nd)})
                if dm_rows:
                    pd.DataFrame(dm_rows).to_csv(os.path.join(outdir, f"{ds.label}_DM.csv"), index=False)

            self.stdout.write(self.style.SUCCESS(
                f"[ok] {ds.label} in {time.perf_counter()-t0:.1f}s → {outdir}"
            ))
