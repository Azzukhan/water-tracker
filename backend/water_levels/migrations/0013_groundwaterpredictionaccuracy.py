from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("water_levels", "0012_groundwaterprediction"),
    ]

    operations = [
        migrations.CreateModel(
            name="GroundwaterPredictionAccuracy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("region", models.CharField(max_length=10)),
                ("date", models.DateField()),
                ("model_type", models.CharField(max_length=20)),
                ("predicted_value", models.FloatField()),
                ("actual_value", models.FloatField(blank=True, null=True)),
                ("percentage_error", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "unique_together": {("region", "model_type", "date")},
            },
        ),
    ]
