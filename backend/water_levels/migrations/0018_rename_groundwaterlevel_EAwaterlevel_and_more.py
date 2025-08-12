from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("water_levels", "0017_scottishwaterregionalforecast"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="GroundwaterStation",
            new_name="EAwaterStation",
        ),
        migrations.RenameModel(
            old_name="GroundwaterLevel",
            new_name="EAwaterLevel",
        ),
        migrations.RenameModel(
            old_name="GroundwaterPrediction",
            new_name="EAwaterPrediction",
        ),
        migrations.RenameModel(
            old_name="GroundwaterPredictionAccuracy",
            new_name="EAwaterPredictionAccuracy",
        ),
        migrations.AlterField(
            model_name="eawaterlevel",
            name="station",
            field=models.ForeignKey(
                on_delete=models.CASCADE,
                related_name="levels",
                to="water_levels.eawaterstation",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="eawaterlevel",
            unique_together={("station", "date")},
        ),
    ]
