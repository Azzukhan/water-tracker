import requests
import csv
import json
from datetime import datetime, timedelta
import sys

# API URLs
stations_url = "https://environment.data.gov.uk/hydrology/id/stations"
readings_url = "https://environment.data.gov.uk/hydrology/data/readings"

# Date range for 2 years
current_date = datetime(2025, 6, 23, 13, 14)  # Current time: 01:14 PM BST, June 23, 2025
start_date = (current_date - timedelta(days=2*365)).strftime("%Y-%m-%d")
end_date = current_date.strftime("%Y-%m-%d")

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
        # Fetch measures for the station
        measures_url = f"https://environment.data.gov.uk/hydrology/id/measures?station={station_id}"
        measures_response = requests.get(measures_url, headers={"Accept": "application/json"}, timeout=10)
        measures_response.raise_for_status()
        measures_data = measures_response.json()
        measures = measures_data.get("items", [])

        for measure in measures:
            measure_id = measure["@id"]
            readings_params = {
                "measure": measure_id,
                "_limit": 10000  # Fetch all available data
            }
            readings_response = requests.get(readings_url, params=readings_params, headers={"Accept": "application/json"}, timeout=10)
            readings_response.raise_for_status()

            # Parse the JSON response
            try:
                readings_data = readings_response.json()
                items = readings_data.get("items", [])
                if items:
                    for item in items:
                        item_date = datetime.strptime(item.get("dateTime") or item.get("date"), "%Y-%m-%dT%H:%M:%S" if "T" in (item.get("dateTime") or "") else "%Y-%m-%d")
                        if start_date <= item_date.strftime("%Y-%m-%d") <= end_date and item.get("value") is not None and item.get("quality") != "Missing":
                            all_readings.append({
                                "station_name": station_name,
                                "date": item.get("dateTime") or item.get("date"),
                                "value": item["value"],
                                "quality": item.get("quality", "Unknown")
                            })
                else:
                    print(f"No data for measure {measure_id}")
            except json.JSONDecodeError:
                print(f"JSON parsing error for measure {measure_id}: {readings_response.text[:200]}...")

    # Sort by date for consistency
    all_readings.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%dT%H:%M:%S" if "T" in x["date"] else "%Y-%m-%d"))

    # Write to CSV
    with open("groundwater_levels_two_years.csv", "w", newline="") as csvfile:
        fieldnames = ["station_name", "date", "value", "quality"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_readings)

    print(f"Data successfully written to 'groundwater_levels_two_years.csv' with {len(all_readings)} readings")

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