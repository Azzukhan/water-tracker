from __future__ import annotations
import math, warnings, numpy as np, pandas as pd
from dataclasses import dataclass
from typing import Optional, Iterable, Tuple, List
from django.apps import apps
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.statespace.sarimax import SARIMAX

warnings.filterwarnings("ignore", category=UserWarning)

# ---------- Metrics & utils ----------

def mape(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    eps = 1e-9
    return float(np.mean(np.abs((y_true - y_pred) / (np.abs(y_true) + eps))) * 100.0)

def diebold_mariano(e1: np.ndarray, e2: np.ndarray, h: int = 1) -> Tuple[float, float]:
    d = (e1**2 - e2**2)
    d_mean = d.mean()
    T = len(d)
    if T < 3:
        return 0.0, 1.0
    gamma0 = np.var(d, ddof=1)
    gamma = 0.0
    for k in range(1, max(1, h)):
        cov = np.cov(d[:-k], d[k:])[0, 1]
        gamma += 2 * (1 - k / max(1, h)) * cov
    var_d = (gamma0 + gamma) / T
    if not np.isfinite(var_d) or var_d <= 0:
        return 0.0, 1.0
    DM = d_mean / math.sqrt(var_d)
    from math import erf, sqrt
    p = 2 * (1 - 0.5 * (1 + erf(abs(DM) / sqrt(2))))
    return float(DM), float(p)

def _to_series(df: pd.DataFrame, date_col: str, value_col: str) -> pd.Series:
    s = (df[[date_col, value_col]]
          .dropna()
          .sort_values(date_col)
          .set_index(pd.to_datetime(df[date_col]))[value_col]
          .astype("float64"))
    s = s[~s.index.duplicated(keep="last")]
    return s

def _resample_series(s: pd.Series, target: str) -> pd.Series:
    if s.empty:
        return s
    inferred = pd.infer_freq(s.index)
    need = (inferred is None or
            (target == "W" and not str(inferred).upper().startswith("W")) or
            (target == "M" and not str(inferred).upper().startswith("M")))
    if need:
        s = s.sort_index()
        s = s.resample("W-SUN").last() if target == "W" else s.resample("MS").last()
    return s.dropna()

# ---------- Models ----------

def fit_forecast_arima(train: pd.Series, h: int, seasonal_period: Optional[int], maxiter: int, fast: bool) -> np.ndarray:
    non_seasonal = [(1,1,1)] if fast else [(1,1,0),(0,1,1),(1,1,1)]
    seasonal = []
    if seasonal_period and len(train) >= 2*seasonal_period and not fast:
        seasonal = [(1,0,1, seasonal_period)]
    best_aic, best_res = np.inf, None
    for (p,d,q) in non_seasonal:
        if seasonal:
            for (P,D,Q,s) in seasonal:
                try:
                    mod = SARIMAX(train,
                                  order=(p,d,q),
                                  seasonal_order=(P,D,Q,s),
                                  enforce_stationarity=False,
                                  enforce_invertibility=False)
                    res = mod.fit(disp=False, method="lbfgs", maxiter=maxiter, cov_type="none")
                    if res.aic < best_aic and np.isfinite(res.aic):
                        best_aic, best_res = res.aic, res
                except Exception:
                    continue
        else:
            try:
                mod = SARIMAX(train,
                              order=(p,d,q),
                              enforce_stationarity=False,
                              enforce_invertibility=False)
                res = mod.fit(disp=False, method="lbfgs", maxiter=maxiter, cov_type="none")
                if res.aic < best_aic and np.isfinite(res.aic):
                    best_aic, best_res = res.aic, res
            except Exception:
                continue
    if best_res is None:
        last = float(train.iloc[-1])
        return np.array([last]*h, dtype="float64")
    return best_res.get_forecast(steps=h).predicted_mean.values

def fit_forecast_regression(train: pd.Series, h: int, seasonal_period: int) -> np.ndarray:
    t = np.arange(len(train))
    X = np.column_stack([np.ones_like(t), t,
                         np.sin(2*np.pi*t/seasonal_period),
                         np.cos(2*np.pi*t/seasonal_period)])
    beta = np.linalg.lstsq(X, train.values, rcond=None)[0]
    tf = np.arange(len(train), len(train)+h)
    Xf = np.column_stack([np.ones_like(tf), tf,
                          np.sin(2*np.pi*tf/seasonal_period),
                          np.cos(2*np.pi*tf/seasonal_period)])
    return (Xf @ beta).astype("float64")

def fit_forecast_lstm(train: pd.Series, h: int, window: int = 12, fast: bool = False) -> np.ndarray:
    # --- scaling (train-only) ---
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    y = train.values.reshape(-1,1)
    y_scaled = scaler.fit_transform(y)
    if len(y_scaled) <= window + 2:
        last = float(train.iloc[-1])
        return np.array([last]*h, dtype="float64")

    # create sequences ...
    Xs, ys = [], []
    for i in range(window, len(y_scaled)):
        Xs.append(y_scaled[i-window:i, 0])
        ys.append(y_scaled[i, 0])
    Xs = np.array(Xs).reshape(-1, window, 1)
    ys = np.array(ys)

    # --- NEW: tame TF logs + retracing noise, clear previous graph ---
    import os
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")  # hide INFO/WARN from TF runtime
    import tensorflow as tf
    tf.get_logger().setLevel("ERROR")
    try:
        tf.autograph.set_verbosity(0)
    except Exception:
        pass
    tf.keras.backend.clear_session()

    try:
        from tensorflow.keras import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        from tensorflow.keras.callbacks import EarlyStopping
    except Exception:
        last = float(train.iloc[-1])
        return np.array([last]*h, dtype="float64")

    model = Sequential([
        LSTM(50, input_shape=(window,1), return_sequences=False),
        Dropout(0.2),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    es = EarlyStopping(patience=(5 if fast else 10), restore_best_weights=True, monitor="val_loss")
    model.fit(Xs, ys, epochs=(60 if fast else 200), batch_size=32, verbose=0, validation_split=0.2, callbacks=[es])

    # recursive multi-step ...
    preds_scaled = []
    last_seq = y_scaled[-window:, 0].copy()
    for _ in range(h):
        x = last_seq.reshape(1, window, 1)
        p = model.predict(x, verbose=0)[0,0]
        preds_scaled.append(p)
        last_seq = np.r_[last_seq[1:], p]

    preds = scaler.inverse_transform(np.array(preds_scaled).reshape(-1,1))[:,0]
    return preds.astype("float64")

# ---------- Config & backtest ----------

@dataclass
class BacktestConfig:
    horizons: Iterable[int] = (1,2,3,4)
    initial_points: int = 104
    step: int = 1
    seasonal_period: int = 52
    lstm_window: int = 12
    fast: bool = False
    resample_mode: str = "auto"
    arima_maxiter: int = 60

def expanding_backtest(series: pd.Series, cfg: BacktestConfig, model_name: str):
    y = series.dropna()
    if len(y) < cfg.initial_points + max(cfg.horizons):
        return pd.DataFrame(), pd.DataFrame()

    origins = range(cfg.initial_points, len(y) - max(cfg.horizons) + 1, cfg.step)
    rows = []
    for o in origins:
        y_tr = y.iloc[:o]
        origin_ts = y.index[o-1]
        for h in cfg.horizons:
            if model_name == "ARIMA":
                yhat = fit_forecast_arima(y_tr, h, cfg.seasonal_period, cfg.arima_maxiter, cfg.fast)
            elif model_name == "LSTM":
                yhat = fit_forecast_lstm(y_tr, h, window=cfg.lstm_window, fast=cfg.fast)
            elif model_name == "REGRESSION":
                yhat = fit_forecast_regression(y_tr, h, cfg.seasonal_period)
            else:
                raise ValueError("Unknown model")

            y_true = y.iloc[o+h-1]
            y_pred = yhat[h-1]
            rows.append({
                "origin": origin_ts,
                "h": h,
                "y_true": float(y_true),
                "y_pred": float(y_pred),
                "abs_err": float(abs(y_true - y_pred)),
                "squared_err": float((y_true - y_pred)**2),
                "model": model_name
            })

    out = pd.DataFrame(rows)
    if out.empty:
        return out, out
    agg = (out.groupby("h").apply(lambda g: pd.Series({
        "MAPE": mape(g["y_true"], g["y_pred"]),
        "MAE": mean_absolute_error(g["y_true"], g["y_pred"]),
        "RMSE": math.sqrt(mean_squared_error(g["y_true"], g["y_pred"])),
        "R2": r2_score(g["y_true"], g["y_pred"]),
    })).reset_index())
    return out, agg

# ---------- Dataset spec & loaders ----------

@dataclass
class DatasetSpec:
    label: str
    model_path: str
    date_field: str
    value_field: str
    target_freq: str          # "W" or "M"
    seasonal_period: int      # 52 for weekly, 12 for monthly
    fixed_filters: Optional[dict] = None

BASE_DATASETS: List[DatasetSpec] = [
    # Scotland (weekly)
    DatasetSpec("Scotland_Average", "water_levels.ScottishWaterAverageLevel",
                "date", "current", "W", 52),
    DatasetSpec("Scotland_East", "water_levels.ScottishWaterRegionalLevel",
                "date", "current", "W", 52, {"area": "East"}),
    DatasetSpec("Scotland_North", "water_levels.ScottishWaterRegionalLevel",
                "date", "current", "W", 52, {"area": "North"}),
    DatasetSpec("Scotland_South", "water_levels.ScottishWaterRegionalLevel",
                "date", "current", "W", 52, {"area": "South"}),
    DatasetSpec("Scotland_West", "water_levels.ScottishWaterRegionalLevel",
                "date", "current", "W", 52, {"area": "West"}),

    # Severn Trent (weekly)
    DatasetSpec("SevernTrent", "water_levels.SevernTrentReservoirLevel",
                "date", "percentage", "W", 52),

    # Yorkshire (monthly)
    DatasetSpec("Yorkshire", "water_levels.YorkshireReservoirData",
                "report_date", "reservoir_level", "M", 12),
]

def _dynamic_southern_sites() -> List[DatasetSpec]:
    """Build DatasetSpec list for each Southern Water reservoir present."""
    try:
        Model = apps.get_model("water_levels", "SouthernWaterReservoirLevel")
    except LookupError:
        return []
    names = (Model.objects.values_list("reservoir", flat=True).distinct())
    specs: List[DatasetSpec] = []
    for name in names:
        # Some DBs may repeat names; guard and normalize label
        if not name:
            continue
        label = f"SouthernWater_{str(name).replace(' ', '-').replace('/', '-')}"
        specs.append(DatasetSpec(
            label=label,
            model_path="water_levels.SouthernWaterReservoirLevel",
            date_field="date",
            value_field="current_level",
            target_freq="W",
            seasonal_period=52,
            fixed_filters={"reservoir": name}
        ))
    return specs

def build_datasets(dynamic_southern: bool = True) -> List[DatasetSpec]:
    ds = list(BASE_DATASETS)
    if dynamic_southern:
        ds.extend(_dynamic_southern_sites())
    return ds

def load_series_with_info(ds: DatasetSpec, resample_mode: str = "auto") -> Tuple[Optional[pd.Series], dict]:
    info = {"raw_len": 0, "resampled_len": 0, "start": None, "end": None}
    try:
        Model = apps.get_model(*ds.model_path.split("."))
    except LookupError:
        return None, info
    qs = Model.objects.all()
    if ds.fixed_filters:
        qs = qs.filter(**ds.fixed_filters)
    qs = qs.order_by(ds.date_field).values(ds.date_field, ds.value_field)
    if not qs.exists():
        return None, info
    df = pd.DataFrame(list(qs))
    info["raw_len"] = len(df)
    s = _to_series(df, ds.date_field, ds.value_field)
    if s.empty:
        return s, info
    if resample_mode == "auto":
        s = _resample_series(s, "W" if ds.target_freq.upper().startswith("W") else "M")
    s = s.dropna()
    info["resampled_len"] = len(s)
    if len(s) > 0:
        info["start"] = str(s.index.min().date())
        info["end"] = str(s.index.max().date())
    return s, info
