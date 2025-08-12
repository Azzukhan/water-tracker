from django.apps import AppConfig


class WaterLevelsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "water_levels"

    def ready(self):
        # Import signal handlers to ensure they are registered when the app
        # is ready.  The handlers connect themselves to Django's signals on
        # import, so no further action is required here.
        from . import signals  # noqa: F401
