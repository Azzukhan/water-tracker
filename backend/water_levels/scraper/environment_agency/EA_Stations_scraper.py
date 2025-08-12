
import requests
from datetime import datetime
from water_levels.models import EAwaterStation, EAwaterLevel
from water_levels.utils import get_region


def extract_EA_stations_water_levels():
    stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
    params = {"observedProperty": "groundwaterLevel"}
    response = requests.get(
        stations_url, params=params, headers={"Accept": "application/json"}
    )
    response.raise_for_status()
    data = response.json()

    for item in data.get("items", []):
        station_id = item["notation"]
        name = item.get("label", station_id)
        lat = float(item.get("lat", 0))
        lon = float(item.get("long", 0))
        region = get_region(lat, lon)

        station, _ = EAwaterStation.objects.get_or_create(
            station_id=station_id,
            defaults={
                "name": name,
                "region": region,
                "latitude": lat,
                "longitude": lon,
            },
        )

        measure_id = f"http://environment.data.gov.uk/hydrology/id/measures/{station_id}-gw-dipped-i-mAOD-qualified"
        readings_url = "https://environment.data.gov.uk/hydrology/data/readings"
        params = {"measure": measure_id, "_limit": 10000}
        readings_response = requests.get(
            readings_url,
            params=params,
            headers={"Accept": "application/json"},
            timeout=10,
        )
        readings = readings_response.json().get("items", [])

        if readings:
            latest = max(
                readings,
                key=lambda r: datetime.strptime(
                    r.get("dateTime") or r.get("date"),
                    (
                        "%Y-%m-%dT%H:%M:%S"
                        if "T" in (r.get("dateTime") or "")
                        else "%Y-%m-%d"
                    ),
                ),
            )
            value = latest.get("value")
            if value is not None and latest.get("quality") != "Missing":
                dt_str = latest.get("dateTime") or latest.get("date")
                dt = datetime.strptime(
                    dt_str, "%Y-%m-%dT%H:%M:%S" if "T" in dt_str else "%Y-%m-%d"
                ).date()
                EAwaterLevel.objects.update_or_create(
                    station=station,
                    date=dt,
                    defaults={
                        "value": value,
                        "quality": latest.get("quality", "Unknown"),
                    },
                )


def import_historical_EAwater_levels():
    stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
    params = {"observedProperty": "groundwaterLevel"}
    response = requests.get(
        stations_url, params=params, headers={"Accept": "application/json"}
    )
    response.raise_for_status()
    data = response.json()

    for item in data.get("items", []):
        station_id = item["notation"]
        name = item.get("label", station_id)
        lat = float(item.get("lat", 0))
        lon = float(item.get("long", 0))
        region = get_region(lat, lon)

        station, _ = EAwaterStation.objects.get_or_create(
            station_id=station_id,
            defaults={
                "name": name,
                "region": region,
                "latitude": lat,
                "longitude": lon,
            },
        )

        measures_url = f"https://environment.data.gov.uk/hydrology/id/measures?station={station_id}"
        measures_response = requests.get(
            measures_url, headers={"Accept": "application/json"}, timeout=10
        )
        measures = measures_response.json().get("items", [])

        for measure in measures:
            measure_id = measure["@id"]
            readings_url = "https://environment.data.gov.uk/hydrology/data/readings"
            readings_params = {"measure": measure_id, "_limit": 10000}
            readings_response = requests.get(
                readings_url,
                params=readings_params,
                headers={"Accept": "application/json"},
                timeout=10,
            )
            readings = readings_response.json().get("items", [])

            for r in readings:
                value = r.get("value")
                if value is None or r.get("quality") == "Missing":
                    continue
                dt_str = r.get("dateTime") or r.get("date")
                dt = datetime.strptime(
                    dt_str, "%Y-%m-%dT%H:%M:%S" if "T" in dt_str else "%Y-%m-%d"
                ).date()
                EAwaterLevel.objects.update_or_create(
                    station=station,
                    date=dt,
                    defaults={"value": value, "quality": r.get("quality", "Unknown")},
                )
                
if __name__ == "__main__":
    extract_EA_stations_water_levels()
# This script fetches water level data from the Environment Agency's API for groundwater stations.