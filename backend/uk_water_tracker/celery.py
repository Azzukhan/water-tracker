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
    # Fetch Scottish Water resource levels once a week on Wednesday
    'weekly-scottish-resources': {
        'task': 'water_levels.tasks.update_scottish_resources',
        'schedule': crontab(day_of_week='wed', hour=6, minute=0),
    },
    # Scrape Severn Trent reservoir data every Wednesday morning
    'weekly-severn-trent-scrape': {
        'task': 'water_levels.tasks.fetch_severn_trent_reservoir_data',
        'schedule': crontab(day_of_week='wed', hour=8, minute=0),
    },
    # Generate new forecasts after scraping the latest data
    'weekly-severn-trent-predictions': {
        'task': 'water_levels.tasks.weekly_severn_trent_predictions',
        'schedule': crontab(day_of_week='wed', hour=9, minute=0),
    },
    'monthly-yorkshire-scrape-and-predict': {
        'task': 'water_levels.tasks.fetch_yorkshire_water_reports',
        'schedule': crontab(day_of_month=1, hour=6, minute=0),
    },
    'monthly-southernwater-update': {
        'task': 'water_levels.tasks.monthly_southernwater_predictions',
        'schedule': crontab(day_of_month=1, hour=10, minute=0),
    },
    'fetch-groundwater-levels-every-15-mins': {
        'task': 'water_levels.tasks.fetch_current_groundwater_levels',
        'schedule': crontab(minute='*/15'),
    },
    'weekly-groundwater-predictions': {
        'task': 'water_levels.tasks.train_groundwater_prediction_models',
        'schedule': crontab(day_of_week=0, hour=3, minute=0),
    },
    'weekly-groundwater-prediction-accuracy': {
        'task': 'water_levels.tasks.calculate_prediction_accuracy',
        'schedule': crontab(day_of_week=0, hour=6, minute=0),
    },
}

# Configure Celery to use Redis
broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')

app.conf.update(
    broker_url=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    result_backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),

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
