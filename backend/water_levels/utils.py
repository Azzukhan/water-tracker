import re
from datetime import datetime
import pandas as pd

from .models import EAwaterLevel, EAwaterStation

LAST_UPDATE_REGEX = re.compile(r"(\d{1,2} \w+ \d{4})")


def _parse_last_updated(text: str) -> datetime.date:
    match = LAST_UPDATE_REGEX.search(text)
    if match:
        for fmt in ["%d %B %Y", "%d %b %Y"]:
            try:
                return datetime.strptime(match.group(1), fmt).date()
            except ValueError:
                continue
    return datetime.utcnow().date()


def _parse_percentage(value: str) -> float:
    try:
        return float(value.replace("%", "").strip())
    except ValueError:
        return 0.0


def get_region(lat, lon):
    """Determine coarse UK region based on latitude and longitude."""
    if lat >= 53:
        return "north"
    elif lat <= 51:
        return "south"
    elif lon < -1:
        return "west"
    else:
        return "east"


def get_region_timeseries(region):
    station_ids = EAwaterStation.objects.filter(region=region).values_list(
        "id", flat=True
    )
    levels = EAwaterLevel.objects.filter(station_id__in=station_ids).values(
        "date", "value"
    )
    df = pd.DataFrame(list(levels))
    if df.empty:
        return pd.Series(dtype=float)
    df["date"] = pd.to_datetime(df["date"])
    df = df.groupby("date")["value"].mean().asfreq("W")
    return df.sort_index()