from celery import shared_task
from .utils import (
    fetch_scottish_water_resource_levels,
    fetch_scottish_water_levels,
)

@shared_task
def update_scottish_resources():
    """Fetch Scottish Water resource levels and store them."""
    count, _ = fetch_scottish_water_resource_levels()
    return count


@shared_task
def update_scottish_levels():
    """Fetch simple Scottish Water level summary and regional data."""
    return fetch_scottish_water_levels()
