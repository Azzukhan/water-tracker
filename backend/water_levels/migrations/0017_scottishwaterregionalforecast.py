from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ("water_levels", "0016_scottishwaterforecast"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScottishWaterRegionalForecast",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("area", models.CharField(max_length=100)),
                ("date", models.DateField()),
                ("predicted_level", models.FloatField()),
                (
                    "model_type",
                    models.CharField(
                        max_length=10,
                        choices=[("ARIMA", "ARIMA"), ("LSTM", "LSTM"), ("REGRESSION", "REGRESSION")],
                    ),
                ),
            ],
            options={
                "ordering": ["area", "date"],
                "unique_together": {("area", "date", "model_type")},
            },
        ),
    ]
