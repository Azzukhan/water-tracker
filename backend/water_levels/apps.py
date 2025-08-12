from django.apps import AppConfig


class WaterLevelsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "water_levels"

    def ready(self):
        # Import signals to ensure they are registered
        from water_levels.signals import trigger_prediction_on_new_level
        trigger_prediction_on_new_level()  # noqa: F401
