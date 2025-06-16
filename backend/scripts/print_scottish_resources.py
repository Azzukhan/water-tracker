import requests
from bs4 import BeautifulSoup
import re

URL = (
    "https://www.scottishwater.co.uk/Your-Home/Your-Water/Managing-Water-Resources/"
    "Scotlands-Water-Resource-Levels"
)

HEADERS = {"User-Agent": "Mozilla/5.0"}


def parse_table(table):
    rows = []
    for row in table.find_all("tr"):
        cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
        if cells:
            rows.append(cells)
    return rows


def main():
    print("Fetching", URL)
    res = requests.get(URL, headers=HEADERS, timeout=20)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    heading_avg = soup.find(string=re.compile("Average levels Scotland-wide", re.I))
    if heading_avg:
        table = heading_avg.find_next("table")
        if table:
            print("\nScotland-wide average levels:")
            for row in parse_table(table):
                print("\t".join(row))
    else:
        print("No Scotland-wide average table found")

    heading_reg = soup.find(string=re.compile("Average levels across regional areas", re.I))
    if heading_reg:
        table = heading_reg.find_next("table")
        if table:
            print("\nRegional average levels:")
            for row in parse_table(table):
                print("\t".join(row))
    else:
        print("No regional average table found")

    tables = soup.find_all("table")
    resource_table = tables[-1] if tables else None
    if resource_table:
        print("\nReservoir resource levels:")
        for row in parse_table(resource_table):
            print("\t".join(row))
    else:
        print("No resource level table found")


if __name__ == "__main__":
    main()
