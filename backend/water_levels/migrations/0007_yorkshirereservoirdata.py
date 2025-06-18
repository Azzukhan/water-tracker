from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("water_levels", "0006_severntrentforecast"),
    ]

    operations = [
        migrations.CreateModel(
            name="YorkshireReservoirData",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("report_date", models.DateField()),
                ("reservoir_level", models.FloatField()),
                ("weekly_difference", models.FloatField(blank=True, null=True)),
                ("direction", models.CharField(max_length=10)),
            ],
            options={
                "ordering": ["-report_date"],
            },
        ),
    ]
