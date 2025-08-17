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
        'task': 'water_levels.tasks.fetch_scottish_water_forecasts',
        'schedule': crontab(day_of_week='wed', hour=6, minute=0),
    },
    # Scrape Severn Trent reservoir data every Wednesday morning
    'weekly-severn-trent-scrape': {
        'task': 'water_levels.tasks.fetch_and_generate_severn_trent_forecasts',
        'schedule': crontab(day_of_week='wed', hour=8, minute=0),
    },
    # Generate new forecasts after scraping the latest data
    'weekly-severn-trent-predictions': {
        'task': 'water_levels.tasks.weekly_severn_trent_predictions',
        'schedule': crontab(day_of_week='wed', hour=9, minute=0),
    },

    'monthly-yorkshire-scrape': {
        'task': 'water_levels.tasks.fetch_and_generate_yorkshire_water_forecasts',
        'schedule': crontab(day_of_month=1, hour=6, minute=0),
    },
    'monthly-yorkshire-predict': {
        'task': 'water_levels.tasks.monthly_yorkshire_predictions',
        'schedule': crontab(day_of_month=1, hour=8, minute=0),
    },
    
    'weekly-southernwater-scrape': {
        'task': 'water_levels.tasks.fetch_and_generate_southernwater_forecasts',
        'schedule': crontab(day_of_week='wed', hour=9, minute=0),
    },
    'weekly-southernwater-predict': {
        'task': 'water_levels.tasks.weekly_southernwater_predictions',
        'schedule': crontab(day_of_week='wed', hour=10, minute=0),
    },
    
    'fetch-groundwater-levels-every-15-mins': {
        'task': 'water_levels.tasks.fetch_and_generate_EA_stations_water_forecasts',
        'schedule': crontab(day_of_week='wed', hour=3, minute=0),
    },
    'weekly-groundwater-predictions': {
        'task': 'water_levels.tasks.weekly_EA_stations_water_predictions()',
        'schedule': crontab(day_of_week='wed', hour=5, minute=0),
    },
    'weekly-scottish-water-regional-predictions': {
        'task': 'water_levels.tasks.weekly_scottish_water_regional_predictions',
        'schedule': crontab(day_of_week='wed', hour=11, minute=0),
    },
    'weekly-scottish-water-wide-predictions': {
        'task': 'water_levels.tasks.weekly_scottish_water_wide_predictions',
        'schedule': crontab(day_of_week='wed', hour=12, minute=0),
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
