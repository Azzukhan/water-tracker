import requests
import csv
import json
from datetime import datetime
from collections import defaultdict

# API URLs
stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
readings_url = "https://environment.data.gov.uk/hydrology/data/readings"

# Fetch all groundwater stations
stations_params = {"observedProperty": "groundwaterLevel"}
stations_response = requests.get(stations_url, params=stations_params, headers={"Accept": "application/json"})
stations_response.raise_for_status()
stations_data = stations_response.json()
stations = {s["notation"]: s.get("label", s["notation"]) for s in stations_data.get("items", [])}

# List to hold all readings
all_readings = []

try:
    # Process each station to get its measures
    for station_id, station_name in stations.items():
        measures_params = {"_limit": 10000, "measure": f"http://environment.data.gov.uk/hydrology/id/measures/{station_id}-gw-dipped-i-mAOD-qualified"}
        readings_response = requests.get(readings_url, params=measures_params, headers={"Accept": "application/json"}, timeout=10)
        readings_response.raise_for_status()
        
        # Parse the JSON response
        readings_data = readings_response.json()
        items = readings_data.get("items", [])
        
        # Find the latest reliable measurement
        if items:
            latest_item = max(items, key=lambda x: datetime.strptime(x.get("dateTime") or x.get("date"), "%Y-%m-%dT%H:%M:%S" if "T" in (x.get("dateTime") or "") else "%Y-%m-%d") or datetime.min)
            if latest_item.get("value") is not None and latest_item.get("quality") != "Missing":
                all_readings.append({
                    "station_name": station_name,
                    "date": latest_item.get("dateTime") or latest_item.get("date"),
                    "value": latest_item["value"],
                    "quality": latest_item.get("quality", "Unknown")
                })

    # Sort by station name for consistency
    all_readings.sort(key=lambda x: x["station_name"])

    # Write to CSV
    with open("groundwater_levels.csv", "w", newline="") as csvfile:
        fieldnames = ["station_name", "date", "value", "quality"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_readings)

    print(f"Data successfully written to 'groundwater_levels.csv' with {len(all_readings)} readings")

except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
    print(f"Response text: {e.response.text if e.response else 'No response'}")
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"JSON parsing error: {e}")
    print(f"Response text: {readings_response.text if 'readings_response' in locals() else 'No response'}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)