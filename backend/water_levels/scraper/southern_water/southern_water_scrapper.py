import requests, re
import pandas as pd
from datetime import datetime, date
from water_levels.models import SouthernWaterReservoirLevel

def extract_southern_water_levels():
    # Helper for robust date parsing
    def parse_southern_date(date_str):
        date_str = date_str.replace(",", "").strip()
        # Fix compact (e.g. 3Jul => 3 Jul)
        match = re.match(r"^(\d{1,2})([A-Za-z]{3})$", date_str)
        if match:
            day, month = match.groups()
            date_str = f"{day} {month}"
        parts = date_str.split()
        # If no year, infer by month per water year rule
        if len(parts) == 2:
            day, month = parts
            month = month[:3].title()
            if month in ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]:
                year = 2024
            else:
                year = 2025
            date_str = f"{day} {month} {year}"
        try:
            dt = datetime.strptime(date_str, "%d %b %Y").date()
            return dt
        except Exception as e:
            print(f"Failed to parse: '{date_str}' ({e})")
            return None

    url = "https://www.southernwater.co.uk/about-us/environmental-performance/water-levels/reservoir-levels/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        response = requests.get(url, headers=headers, timeout=20)
        html = response.text
    except Exception as e:
        print(f"Failed to fetch southern water page: {e}")
        return "error"

    blocks = re.findall(r"addRows\(\[\s*(.*?)\s*\]\);", html, re.DOTALL)[:4]
    reservoir_names = ["Bewl", "Darwell", "Powdermill", "Weir Wood"]

    WATER_YEAR_START = date(2024, 7, 18)
    WATER_YEAR_END = date(2025, 7, 10)

    for i, block in enumerate(blocks):
        rows = re.findall(r"\['(.*?)',\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\]", block)
        if not rows:
            print(f"No data found for {reservoir_names[i]}")
            continue

        df = pd.DataFrame(rows, columns=["date", "actual", "average", "minimum"])
        df["actual"] = df["actual"].astype(float)
        df["average"] = df["average"].astype(float)
        df = df.reset_index(drop=True)

        for j, row in df.iterrows():
            orig_date_str = row["date"]
            dt = parse_southern_date(orig_date_str)
            if not dt:
                continue
            # Only include dates in your custom water year
            if not (WATER_YEAR_START <= dt <= WATER_YEAR_END):
                continue

            current = row["actual"]
            avg = row["average"]
            diff = round(current - avg, 2)
            change_week = (
                round(current - df.loc[j - 1, "actual"], 2) if j > 0 else 0.0
            )
            change_month = (
                round(current - df.loc[j - 4, "actual"], 2) if j >= 4 else 0.0
            )

            SouthernWaterReservoirLevel.objects.update_or_create(
                reservoir=reservoir_names[i],
                date=dt,
                defaults={
                    "current_level": current,
                    "average_level": avg,
                    "change_week": change_week,
                    "change_month": change_month,
                    "difference_from_average": diff,
                },
            )
            print(f"Saved: {reservoir_names[i]}, {dt}, value: {current}")

    print("Done updating Southern Water levels (custom water year).")
    return "done"

if __name__ == "__main__":
    extract_southern_water_levels()