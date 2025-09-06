import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime

from water_levels.models import SevernTrentReservoirLevel


def extract_severn_trent_water_levels():
    
    def clean_date(date_str):
        return re.sub(r"(\d+)(st|nd|rd|th)", r"\1", date_str)

    url = url = "https://www.stwater.co.uk/about-us/reservoir-levels/"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        lines = [line.strip() for line in soup.text.split("\n") if line.strip()]
        count = 0

        for i in range(len(lines) - 1):
            if "%" in lines[i] and "20" in lines[i + 1]:
                try:
                    percentage = float(lines[i].replace("%", "").strip())
                    raw_date = clean_date(lines[i + 1])
                    date_parsed = datetime.strptime(raw_date, "%d %B %Y").date()

                    SevernTrentReservoirLevel.objects.update_or_create(
                        date=date_parsed,
                        defaults={"percentage": percentage},
                    )
                    count += 1
                except Exception as e:
                    print(f"Skipped {lines[i]}, {lines[i+1]} → {e}")

        return f"{count} records updated."

    except Exception as e:
        print(f"Failed to fetch Severn Trent data: {e}")
        return "Error"

if __name__ == "__main__":
    extract_severn_trent_water_levels()
