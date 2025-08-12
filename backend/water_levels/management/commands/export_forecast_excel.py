import pandas as pd
from django.core.management.base import BaseCommand
from water_levels.models import (  # replace 'water_levels' with your app name
    EAwaterPredictionAccuracy,
    SevernTrentForecastAccuracy,
    YorkshireWaterPredictionAccuracy,
    SouthernWaterForecastAccuracy,
    ScottishWaterPredictionAccuracy,
    ScottishWaterForecastAccuracy,
)


class Command(BaseCommand):
    help = "Export forecast accuracy data to Excel"

    def handle(self, *args, **kwargs):
        with pd.ExcelWriter('forecast_accuracy_data.xlsx', engine='openpyxl') as writer:

            # EAwaterPredictionAccuracy
            qs = EAwaterPredictionAccuracy.objects.all().values()
            df = pd.DataFrame.from_records(qs)
            if 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
            df.to_excel(writer, sheet_name='EAwater', index=False)

            # SevernTrentForecastAccuracy
            qs = SevernTrentForecastAccuracy.objects.all().values()
            df = pd.DataFrame.from_records(qs)
            if 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
            df.to_excel(writer, sheet_name='SevernTrent', index=False)

            # YorkshireWaterPredictionAccuracy
            qs = YorkshireWaterPredictionAccuracy.objects.all().values()
            df = pd.DataFrame.from_records(qs)
            if 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
            df.to_excel(writer, sheet_name='YorkshireWater', index=False)

            # SouthernWaterForecastAccuracy
            qs = SouthernWaterForecastAccuracy.objects.all().values()
            df = pd.DataFrame.from_records(qs)
            if 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
            df.to_excel(writer, sheet_name='SouthernWater', index=False)

            # ScottishWaterPredictionAccuracy
            qs = ScottishWaterPredictionAccuracy.objects.all().values()
            df = pd.DataFrame.from_records(qs)
            if 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
            df.to_excel(writer, sheet_name='ScottishWaterPrediction', index=False)

            # ScottishWaterForecastAccuracy
            qs = ScottishWaterForecastAccuracy.objects.all().values()
            df = pd.DataFrame.from_records(qs)
            if 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
            df.to_excel(writer, sheet_name='ScottishWaterForecast', index=False)

        self.stdout.write(self.style.SUCCESS('Data exported successfully to forecast_accuracy_data.xlsx'))
