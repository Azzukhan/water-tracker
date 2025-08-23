from __future__ import annotations
from django.core.management.base import BaseCommand
import os, pandas as pd, time

from water_levels.ml.backtesting.backtesting import (
    DATASETS,
    load_series,
    BacktestConfig,
    expanding_backtest,
    diebold_mariano,
)

class Command(BaseCommand):
    help = "Expanding-window backtests for ARIMA/LSTM/REGRESSION across all reservoirs."

    def add_arguments(self, parser):
        parser.add_argument("--initial", type=int, default=104,
                            help="Initial training points (e.g., 104 = 2 years weekly).")
        parser.add_argument("--horizons", default="1,2,3,4",
                            help="Comma list of forecast horizons (steps ahead).")
        parser.add_argument("--outdir", default="backtests",
                            help="Directory for CSV outputs.")
        parser.add_argument("--models", default="ARIMA,LSTM,REGRESSION",
                            help="Comma list: ARIMA,LSTM,REGRESSION.")
        parser.add_argument("--resample", choices=["none", "auto"], default="auto",
                            help="Resample irregular series to weekly/monthly if needed.")
        parser.add_argument("--step", type=int, default=1,
                            help="Advance origins by this step (speed ↑ if >1).")
        parser.add_argument("--fast", action="store_true",
                            help="Fast mode: tiny ARIMA grid, lower maxiter, fewer origins.")
        parser.add_argument("--only", default=None,
                            help="Substring filter on dataset label, e.g. 'Severn' or 'Scotland'.")
        parser.add_argument("--no_dm", action="store_true",
                            help="Skip Diebold–Mariano tests.")
        parser.add_argument("--maxiter", type=int, default=None,
                            help="Override ARIMA optimizer maxiter (fast mode uses 30).")

    def handle(self, *args, **opts):
        horizons = tuple(int(x) for x in str(opts["horizons"]).split(",") if x.strip())
        models = [m.strip().upper() for m in str(opts["models"]).split(",") if m.strip()]
        outdir = opts["outdir"]
        os.makedirs(outdir, exist_ok=True)

        cfg = BacktestConfig(
            initial_points=opts["initial"],
            horizons=horizons,
            step=max(1, int(opts["step"])),
            seasonal_period=52,      # weekly seasonality
            lstm_window=12,
            fast=bool(opts["fast"]),
            resample_mode=opts["resample"],
            arima_maxiter=(30 if opts["fast"] else (opts["maxiter"] or 60)),
        )

        self.stdout.write(self.style.NOTICE(
            f"Backtest start: models={models} horizons={horizons} initial={cfg.initial_points} "
            f"step={cfg.step} resample={cfg.resample_mode} fast={cfg.fast} arima_maxiter={cfg.arima_maxiter}"
        ))

        for ds in DATASETS:
            label = ds.label
            if opts["only"] and opts["only"].lower() not in label.lower():
                continue

            t0 = time.perf_counter()
            s = load_series(ds, resample_mode=cfg.resample_mode)
            if s is None or len(s) < cfg.initial_points + max(cfg.horizons):
                msg = ("no data" if (s is None or len(s) == 0)
                       else f"not enough data (len={len(s)} < {cfg.initial_points + max(cfg.horizons)})")
                self.stdout.write(self.style.WARNING(f"[skip] {label}: {msg}"))
                continue

            results = {}
            details = {}
            for m in models:
                det, agg = expanding_backtest(s, cfg, m)
                if det.empty:
                    self.stdout.write(self.style.WARNING(f"[warn] {label}:{m} produced no rows"))
                    continue
                results[m] = agg.set_index("h")
                details[m] = det
                det.to_csv(os.path.join(outdir, f"{label}_{m}_origins.csv"), index=False)

            if results:
                summary = pd.concat(results, axis=1)
                summary.columns = [f"{m}_{col}" for m, df in results.items() for col in df.columns]
                summary.reset_index().to_csv(os.path.join(outdir, f"{label}_summary.csv"), index=False)

            if not opts["no_dm"] and "ARIMA" in details and "LSTM" in details:
                dm_rows = []
                for h in cfg.horizons:
                    d1 = details["LSTM"].query("h==@h")[["origin","abs_err"]]
                    d2 = details["ARIMA"].query("h==@h")[["origin","abs_err"]]
                    merged = d1.merge(d2, on="origin", suffixes=("_lstm", "_arima"))
                    if len(merged) >= 6:
                        DM, p = diebold_mariano(
                            merged["abs_err_lstm"].values, merged["abs_err_arima"].values, h=h
                        )
                        dm_rows.append({"h": h, "DM_LSTM_minus_ARIMA": DM, "p_value": p})
                if dm_rows:
                    pd.DataFrame(dm_rows).to_csv(os.path.join(outdir, f"{label}_DM.csv"), index=False)

            self.stdout.write(self.style.SUCCESS(
                f"[ok] {label} in {time.perf_counter()-t0:.1f}s → {outdir}"
            ))
