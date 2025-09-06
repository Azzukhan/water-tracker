from django.apps import AppConfig


class WaterLevelsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "water_levels"

    def ready(self):
        from . import signals
