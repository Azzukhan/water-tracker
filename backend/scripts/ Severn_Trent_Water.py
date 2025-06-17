import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
from datetime import datetime

def clean_date(date_str):
    # Remove st, nd, rd, th using regex
    return re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)

URL = "https://www.stwater.co.uk/about-us/reservoir-levels/"
HEADERS = {"User-Agent": "Mozilla/5.0"}

print("🔍 Fetching Severn Trent reservoir data...")
res = requests.get(URL, headers=HEADERS)
res.raise_for_status()
soup = BeautifulSoup(res.text, "html.parser")

# Collect text lines
lines = [line.strip() for line in soup.text.split("\n") if line.strip()]

records = []
for i in range(len(lines) - 1):
    if "%" in lines[i] and "20" in lines[i + 1]:
        try:
            percentage = float(lines[i].replace("%", "").strip())
            date_raw = clean_date(lines[i + 1])
            date_parsed = datetime.strptime(date_raw, "%d %B %Y")
            records.append({
                "date": date_parsed.strftime("%Y-%m-%d"),
                "percent_full": percentage
            })
        except Exception as e:
            print(f"❌ Error parsing: {lines[i]}, {lines[i+1]} → {e}")

# Save to CSV
df = pd.DataFrame(records)
df.sort_values("date", ascending=False, inplace=True)
df.to_csv("severn_trent_reservoir_levels.csv", index=False)
print("✅ Data saved to severn_trent_reservoir_levels.csv")
