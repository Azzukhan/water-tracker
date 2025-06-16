import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uk_water_tracker.settings')

app = Celery('uk_water_tracker')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure the beat schedule
app.conf.beat_schedule = {
    'update-weather-every-5-minutes': {
        'task': 'weather.tasks.update_all_weather',
        'schedule': 300.0,  # 5 minutes in seconds
    },
    'update-scottish-resources-daily': {
        'task': 'water_levels.tasks.update_scottish_resources',
        'schedule': crontab(hour=6, minute=0),
    },
}

# Configure Celery to use Redis
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    broker_transport='redis',
    broker_connection_retry_on_startup=True,
    broker_transport_options={
        'visibility_timeout': 3600,
        'fanout_prefix': True,
        'fanout_patterns': True
    }
)

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 