from django.core.management.base import BaseCommand
import pandas as pd
import os
from water_levels.models import ScottishWaterAverageLevel, ScottishWaterRegionalLevel

class Command(BaseCommand):
    help = 'Import historical Scottish Water reservoir data from Excel file'

    def handle(self, *args, **options):
        file_path = os.path.join("data", "scottish_water_datas.xlsx")

        # Try to load the correct header row (header is row 1, so skiprows=1)
        try:
            df = pd.read_excel(file_path, skiprows=1)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to read Excel file: {e}"))
            return

        # Clean up columns: strip whitespace
        df.columns = df.columns.str.strip()

        # Ensure columns exist
        req = ['DATE (Wk Begin)', '% TOTAL', 'South %', 'West %', 'East %', 'North %']
        if not all(col in df.columns for col in req):
            self.stdout.write(self.style.ERROR(f"Missing one or more required columns: {req}"))
            return

        # Drop any rows with missing date or data
        df = df.dropna(subset=['DATE (Wk Begin)', '% TOTAL'])

        # Convert date column
        df['date'] = pd.to_datetime(df['DATE (Wk Begin)'])

        # Calculate averages for each column (used for difference_from_average)
        avg_total = df['% TOTAL'].mean()
        avg_south = df['South %'].mean()
        avg_west  = df['West %'].mean()
        avg_east  = df['East %'].mean()
        avg_north = df['North %'].mean()

        # Sort by date
        df = df.sort_values('date')

        # Calculate week-on-week change for each
        df['change_total'] = df['% TOTAL'].diff().fillna(0)
        df['change_south'] = df['South %'].diff().fillna(0)
        df['change_west']  = df['West %'].diff().fillna(0)
        df['change_east']  = df['East %'].diff().fillna(0)
        df['change_north'] = df['North %'].diff().fillna(0)

        # Save Scotland-wide averages
        ScottishWaterAverageLevel.objects.bulk_create([
            ScottishWaterAverageLevel(
                date=row['date'].date(),
                current=row['% TOTAL'],
                change_from_last_week=row['change_total'],
                difference_from_average=row['% TOTAL'] - avg_total
            )
            for _, row in df.iterrows()
        ])

        # Save regional values
        for region, avg, change_col in [
            ('South', avg_south, 'change_south'),
            ('West', avg_west, 'change_west'),
            ('East', avg_east, 'change_east'),
            ('North', avg_north, 'change_north')
        ]:
            ScottishWaterRegionalLevel.objects.bulk_create([
                ScottishWaterRegionalLevel(
                    area=region,
                    date=row['date'].date(),
                    current=row[f'{region} %'],
                    change_from_last_week=row[change_col],
                    difference_from_average=row[f'{region} %'] - avg
                )
                for _, row in df.iterrows()
            ])

        self.stdout.write(self.style.SUCCESS("Data imported successfully!"))