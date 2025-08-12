import pandas as pd
import numpy as np
import scipy
from dateutil.relativedelta import relativedelta


# ``statsmodels`` depends on ``scipy._lib._util._lazywhere`` which was removed in
# SciPy 1.13.  The environment used by the project ships with SciPy 1.16 which
# no longer provides this helper, causing an ImportError when importing
# ``statsmodels``.  To maintain compatibility without pinning an older SciPy
# version, we provide a minimal implementation of ``_lazywhere`` before
# importing ``statsmodels``.  If SciPy reintroduces the function or a suitable
# version is installed, this patch simply does nothing.

if not hasattr(scipy._lib._util, "_lazywhere"):
    def _lazywhere(cond, arrays, f, fillvalue=np.nan):
        arrays = [np.asarray(a) for a in arrays]
        cond = np.asarray(cond)
        out = np.full(cond.shape, fillvalue, dtype=np.result_type(*arrays))
        if np.any(cond):
            out[cond] = f(*[a[cond] for a in arrays])
        return out

    scipy._lib._util._lazywhere = _lazywhere

import statsmodels.api as sm

from water_levels.models import YorkshireReservoirData, YorkshireWaterPrediction


def generate_yorkshire_regression_forecast() -> None:
    qs = YorkshireReservoirData.objects.order_by("report_date")
    if qs.count() < 12:
        return

    df = pd.DataFrame(qs.values("report_date", "reservoir_level"))
    df["report_date"] = pd.to_datetime(df["report_date"])
    df = df.set_index("report_date").asfreq("MS")
    df["reservoir_level"] = df["reservoir_level"].interpolate()

    df["t"] = np.arange(len(df))
    period = 12
    df["sin_t"] = np.sin(2 * np.pi * df["t"] / period)
    df["cos_t"] = np.cos(2 * np.pi * df["t"] / period)

    X = sm.add_constant(df[["t", "sin_t", "cos_t"]])
    model = sm.OLS(df["reservoir_level"], X).fit()

    last_t = df["t"].iloc[-1]
    last_date = qs.last().report_date
    for i in range(1, 5):
        t = last_t + i
        sin_t = np.sin(2 * np.pi * t / period)
        cos_t = np.cos(2 * np.pi * t / period)
        X_new = sm.add_constant(
            pd.DataFrame({"t": [t], "sin_t": [sin_t], "cos_t": [cos_t]}),
            has_constant="add",
        )
        pred = model.predict(X_new)[0]
        target_date = last_date + relativedelta(months=i)
        YorkshireWaterPrediction.objects.update_or_create(
            date=target_date,
            model_type="REGRESSION",
            defaults={
                "predicted_reservoir_percent": round(float(pred), 2),
                "predicted_demand_mld": 0.0,
            },
        )


if __name__ == "__main__":
    generate_yorkshire_regression_forecast()
