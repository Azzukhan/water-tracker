from django.core.management.base import BaseCommand
from water_levels.utils import fetch_scottish_water_history

class Command(BaseCommand):
    help = 'Import historical Scottish Water resource levels from the Wayback Machine'

    def handle(self, *args, **options):
        count = fetch_scottish_water_history()
        self.stdout.write(self.style.SUCCESS(f'Imported {count} historical entries'))
