from django.core.management.base import BaseCommand
from weather.models import WeatherStation

class Command(BaseCommand):
    help = 'Creates initial weather stations for major UK cities'

    def handle(self, *args, **kwargs):
        stations = [
            {
                'name': 'London',
                'latitude': 51.5074,
                'longitude': -0.1278,
                'is_active': True
            },
            {
                'name': 'Manchester',
                'latitude': 53.4808,
                'longitude': -2.2426,
                'is_active': True
            },
            {
                'name': 'Birmingham',
                'latitude': 52.4862,
                'longitude': -1.8904,
                'is_active': True
            },
            {
                'name': 'Edinburgh',
                'latitude': 55.9533,
                'longitude': -3.1883,
                'is_active': True
            },
            {
                'name': 'Cardiff',
                'latitude': 51.4816,
                'longitude': -3.1791,
                'is_active': True
            },
            {
                'name': 'Belfast',
                'latitude': 54.5973,
                'longitude': -5.9301,
                'is_active': True
            },
            {
                'name': 'Glasgow',
                'latitude': 55.8642,
                'longitude': -4.2518,
                'is_active': True
            },
            {
                'name': 'Liverpool',
                'latitude': 53.4084,
                'longitude': -2.9916,
                'is_active': True
            },
            {
                'name': 'Newcastle',
                'latitude': 54.9783,
                'longitude': -1.6178,
                'is_active': True
            },
            {
                'name': 'Leeds',
                'latitude': 53.8008,
                'longitude': -1.5491,
                'is_active': True
            }
        ]

        for station_data in stations:
            station, created = WeatherStation.objects.get_or_create(
                name=station_data['name'],
                defaults={
                    'latitude': station_data['latitude'],
                    'longitude': station_data['longitude'],
                    'is_active': station_data['is_active']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created weather station "{station.name}"')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Weather station "{station.name}" already exists')
                ) 