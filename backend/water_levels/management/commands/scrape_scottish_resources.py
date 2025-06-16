from django.core.management.base import BaseCommand
from water_levels.utils import fetch_scottish_water_resource_levels

class Command(BaseCommand):
    help = "Scrape Scottish Water resource levels and store them in the database"

    def handle(self, *args, **options):
        count, date = fetch_scottish_water_resource_levels()
        self.stdout.write(self.style.SUCCESS(
            f"Imported {count} resource levels (last update {date})"
        ))
