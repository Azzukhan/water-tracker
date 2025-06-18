import io
import os
import re
import sys
from datetime import datetime

import requests
from bs4 import BeautifulSoup
import pdfplumber

if __package__ in (None, ""):
    import django

    # Allow running this module directly
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uk_water_tracker.settings")
    django.setup()
    from water_levels.models import YorkshireWaterReport
else:
    from ..models import YorkshireWaterReport

DATASET_API = "https://datamillnorth.org/api/3/action/package_show?id=vqxw4"

PDF_PATTERN = re.compile(r"(\d{4})-(\d{2})")


def fetch_latest_pdfs():
    """Fetch PDF resource URLs from Data Mill North CKAN API."""
    try:
        res = requests.get(DATASET_API, timeout=20)
        res.raise_for_status()
        data = res.json()["result"]
        resources = data.get("resources", [])
    except Exception:
        return []
    pdfs = []
    for r in resources:
        url = r.get("url")
        if url and url.lower().endswith(".pdf"):
            match = PDF_PATTERN.search(url)
            if match:
                year, month = match.groups()
                date = datetime(int(year), int(month), 1).date()
                pdfs.append((date, url))
    pdfs.sort(key=lambda x: x[0])
    return pdfs[-3:]


def parse_pdf(url: str):
    """Download and parse a PDF report."""
    try:
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
    except Exception:
        return None
    with pdfplumber.open(io.BytesIO(resp.content)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    def find(pattern: str, default=0.0):
        m = re.search(pattern, text, re.I)
        if m:
            try:
                return float(m.group(1))
            except ValueError:
                return default
        return default
    rainfall = find(r"Rainfall[^%]*(\d+\.?\d*)%")
    reservoir = find(r"Reservoir stock[^%]*(\d+\.?\d*)%")
    delta = find(r"change[^\d-]*(-?\d+\.?\d*)%")
    demand = find(r"demand[^\d]*(\d+\.?\d*)\s*Ml", 0.0)
    condition_match = re.search(r"Rivers? condition[^:]*:\s*([A-Za-z ]+)", text, re.I)
    condition = condition_match.group(1).strip() if condition_match else ""
    return {
        "rainfall_percent_lta": rainfall,
        "reservoir_percent": reservoir,
        "reservoir_weekly_delta": delta,
        "river_condition": condition,
        "demand_megalitres_per_day": demand,
    }


def fetch_and_store_reports():
    """Fetch latest PDFs and store parsed data into the database."""
    pdfs = fetch_latest_pdfs()
    if not pdfs:
        print("No PDF reports found")
    for date, url in pdfs:
        print(f"Parsing report for {date} from {url}")
        data = parse_pdf(url)
        if not data:
            print(f"Failed to parse {url}")
            continue
        YorkshireWaterReport.objects.update_or_create(
            report_month=date,
            defaults={**data, "source_pdf": url},
        )
        print(f"Saved data for {date}: {data}")


if __name__ == "__main__":
    fetch_and_store_reports()
