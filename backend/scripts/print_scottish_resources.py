import requests
from bs4 import BeautifulSoup
import re

URL = (
    "https://www.scottishwater.co.uk/Your-Home/Your-Water/"
    "Managing-Water-Resources/Scotlands-Water-Resource-Levels"
)
HEADERS = {"User-Agent": "Mozilla/5.0"}

def parse_table(table):
    rows = []
    for row in table.find_all("tr"):
        cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
        if cells:
            rows.append(cells)
    return rows

def print_section(title, table):
    print(f"\n📊 {title}")
    rows = parse_table(table)
    for row in rows:
        print(" | ".join(row))

def main():
    print(f"📡 Fetching {URL} ...")
    res = requests.get(URL, headers=HEADERS, timeout=20)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    # === Average levels Scotland-wide ===
    heading_avg = soup.find(string=re.compile("Average levels Scotland-wide", re.I))
    if heading_avg:
        table = heading_avg.find_next("table")
        if table:
            print_section("Scotland-wide average levels", table)
        else:
            print("⚠️ Table found but malformed under 'Average levels Scotland-wide'")
    else:
        print("❌ No heading found for Scotland-wide average levels")

    # === Regional averages ===
    heading_reg = soup.find(string=re.compile("Average levels across regional areas", re.I))
    if heading_reg:
        table = heading_reg.find_next("table")
        if table:
            print_section("Regional average levels", table)
        else:
            print("⚠️ Table found but malformed under 'Regional average levels'")
    else:
        print("❌ No heading found for Regional average levels")

    # === Final fallback: Reservoir Resource Table ===
    tables = soup.find_all("table")
    if tables:
        print_section("Final table (likely resource/reservoir)", tables[-1])
    else:
        print("❌ No tables found on the page")

if __name__ == "__main__":
    main()
