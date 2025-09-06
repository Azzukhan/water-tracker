from django.db.models.signals import post_save
from django.dispatch import receiver

from water_levels.models import SevernTrentReservoirLevel
from .tasks import weekly_severn_trent_predictions


@receiver(post_save, sender=SevernTrentReservoirLevel)
def trigger_prediction_on_new_level(sender, instance, created, **kwargs):
    """Generate new Severn Trent forecasts when a new level is recorded."""
    if created:
        try:
            weekly_severn_trent_predictions.delay()
        except Exception:
            pass
