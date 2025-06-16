from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('water_levels', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScottishWaterAverageLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('current', models.FloatField()),
                ('change_from_last_week', models.FloatField()),
                ('difference_from_average', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['-date']},
        ),
        migrations.CreateModel(
            name='ScottishWaterRegionalLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('area', models.CharField(max_length=100)),
                ('date', models.DateField()),
                ('current', models.FloatField()),
                ('change_from_last_week', models.FloatField()),
                ('difference_from_average', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['area']},
        ),
        migrations.AlterUniqueTogether(
            name='scottishwaterregionallevel',
            unique_together={('area', 'date')},
        ),
    ]
