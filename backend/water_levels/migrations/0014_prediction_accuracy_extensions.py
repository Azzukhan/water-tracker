from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("water_levels", "0013_groundwaterpredictionaccuracy"),
    ]

    operations = [
        migrations.CreateModel(
            name="SevernTrentForecastAccuracy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField()),
                ("model_type", models.CharField(max_length=10)),
                ("predicted_percentage", models.FloatField()),
                ("actual_percentage", models.FloatField(blank=True, null=True)),
                ("percentage_error", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "unique_together": {("date", "model_type")},
            },
        ),
        migrations.CreateModel(
            name="YorkshireWaterPredictionAccuracy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField()),
                ("model_type", models.CharField(max_length=10)),
                ("predicted_reservoir_percent", models.FloatField()),
                ("actual_reservoir_percent", models.FloatField(blank=True, null=True)),
                ("reservoir_error", models.FloatField(blank=True, null=True)),
                ("predicted_demand_mld", models.FloatField()),
                ("actual_demand_mld", models.FloatField(blank=True, null=True)),
                ("demand_error", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "unique_together": {("date", "model_type")},
            },
        ),
        migrations.CreateModel(
            name="SouthernWaterForecastAccuracy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reservoir", models.CharField(max_length=50)),
                ("date", models.DateField()),
                ("model_type", models.CharField(max_length=10)),
                ("predicted_level", models.FloatField()),
                ("actual_level", models.FloatField(blank=True, null=True)),
                ("percentage_error", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "unique_together": {("reservoir", "date", "model_type")},
            },
        ),
        migrations.CreateModel(
            name="ScottishWaterPredictionAccuracy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("area", models.CharField(max_length=100)),
                ("date", models.DateField()),
                ("model_type", models.CharField(max_length=10)),
                ("predicted_value", models.FloatField()),
                ("actual_value", models.FloatField(blank=True, null=True)),
                ("percentage_error", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "unique_together": {("area", "date", "model_type")},
            },
        ),
    ]
