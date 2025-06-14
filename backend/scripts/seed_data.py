#!/usr/bin/env python
"""
Script to seed the database with initial data for development
"""
import os
import sys
import django
import random
from datetime import datetime, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uk_water_tracker.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from water_levels.models import WaterStation, WaterLevel, Alert, Prediction
from weather.models import WeatherStation, CurrentWeather, HourlyForecast, DailyForecast
from news.models import NewsArticle
from blog.models import BlogCategory, BlogPost
from dashboard.models import DashboardStat, AnalyticsData

User = get_user_model()

def create_users():
    """Create admin and test users"""
    print("Creating users...")
    
    # Create superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
        print("Superuser created")
    
    # Create test users
    test_users = [
        {
            'username': 'sarah_mitchell',
            'email': 'sarah@example.com',
            'password': 'password123',
            'first_name': 'Sarah',
            'last_name': 'Mitchell',
            'bio': 'Hydrologist and Flood Risk Specialist',
        },
        {
            'username': 'james_thompson',
            'email': 'james@example.com',
            'password': 'password123',
            'first_name': 'James',
            'last_name': 'Thompson',
            'bio': 'Environmental Technology Consultant',
        },
        {
            'username': 'emma_roberts',
            'email': 'emma@example.com',
            'password': 'password123',
            'first_name': 'Emma',
            'last_name': 'Roberts',
            'bio': 'Climate Science Researcher',
        },
    ]
    
    for user_data in test_users:
        if not User.objects.filter(username=user_data['username']).exists():
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                bio=user_data['bio']
            )
            print(f"Created user: {user.username}")

def create_water_stations():
    """Create water monitoring stations"""
    print("Creating water stations...")
    
    stations = [
        {
            'name': 'River Thames at London Bridge',
            'location': 'London',
            'latitude': 51.5074,
            'longitude': -0.1278,
            'station_type': 'river',
        },
        {
            'name': 'River Severn at Worcester',
            'location': 'Worcester',
            'latitude': 52.1936,
            'longitude': -2.2208,
            'station_type': 'river',
        },
        {
            'name': 'Lake Windermere',
            'location': 'Lake District',
            'latitude': 54.3719,
            'longitude': -2.9621,
            'station_type': 'lake',
        },
        {
            'name': 'River Tyne at Newcastle',
            'location': 'Newcastle',
            'latitude': 54.9783,
            'longitude': -1.6178,
            'station_type': 'river',
        },
        {
            'name': 'River Mersey at Liverpool',
            'location': 'Liverpool',
            'latitude': 53.4084,
            'longitude': -2.9916,
            'station_type': 'river',
        },
        {
            'name': 'Loch Ness',
            'location': 'Scotland',
            'latitude': 57.3229,
            'longitude': -4.4244,
            'station_type': 'lake',
        },
    ]
    
    for station_data in stations:
        station, created = WaterStation.objects.get_or_create(
            name=station_data['name'],
            defaults=station_data
        )
        if created:
            print(f"Created water station: {station.name}")

def create_water_levels():
    """Create water level readings for stations"""
    print("Creating water level readings...")
    
    stations = WaterStation.objects.all()
    
    # Clear existing data
    WaterLevel.objects.all().delete()
    
    for station in stations:
        # Base level depends on station type
        if station.station_type == 'river':
            base_level = random.uniform(1.0, 3.0)
            normal_level = base_level - 0.5
        elif station.station_type == 'lake':
            base_level = random.uniform(10.0, 40.0)
            normal_level = base_level
        else:
            base_level = random.uniform(2.0, 5.0)
            normal_level = base_level
        
        # Create readings for the past 24 hours
        for hours_ago in range(24, -1, -1):
            timestamp = timezone.now() - timedelta(hours=hours_ago)
            
            # Add some variation
            variation = random.uniform(-0.3, 0.3)
            level = base_level + variation
            
            # Determine status and trend
            if level < normal_level - 0.5:
                status = 'low'
            elif level > normal_level + 0.5:
                status = 'high'
            else:
                status = 'normal'
            
            if hours_ago > 0:
                prev_level = base_level + random.uniform(-0.3, 0.3)
                if level > prev_level + 0.1:
                    trend = 'rising'
                elif level < prev_level - 0.1:
                    trend = 'falling'
                else:
                    trend = 'stable'
            else:
                trend = random.choice(['rising', 'falling', 'stable'])
            
            WaterLevel.objects.create(
                station=station,
                level=round(level, 2),
                normal_level=round(normal_level, 2),
                status=status,
                trend=trend,
                timestamp=timestamp
            )
        
        print(f"Created water levels for: {station.name}")

def create_alerts():
    """Create water level alerts"""
    print("Creating alerts...")
    
    # Clear existing alerts
    Alert.objects.all().delete()
    
    stations = WaterStation.objects.all()
    
    alerts = [
        {
            'station': stations[1],  # River Severn
            'title': 'Flood Warning Issued for River Severn',
            'description': 'Heavy rainfall expected to cause river levels to rise significantly. Residents advised to take precautions.',
            'severity': 'high',
            'status': 'active',
        },
        {
            'station': stations[0],  # Thames
            'title': 'Water Level Alert for River Thames',
            'description': 'Water levels are higher than normal due to recent rainfall. Monitoring ongoing.',
            'severity': 'medium',
            'status': 'monitoring',
        },
        {
            'station': stations[3],  # Tyne
            'title': 'Low Water Level Notice',
            'description': 'Water levels below normal range. May affect navigation and wildlife.',
            'severity': 'low',
            'status': 'active',
        },
    ]
    
    for alert_data in alerts:
        alert = Alert.objects.create(**alert_data)
        print(f"Created alert: {alert.title}")

def create_predictions():
    """Create ML predictions for water levels"""
    print("Creating predictions...")
    
    # Clear existing predictions
    Prediction.objects.all().delete()
    
    stations = WaterStation.objects.all()
    
    for station in stations:
        # Get current level
        current_level = WaterLevel.objects.filter(station=station).order_by('-timestamp').first()
        
        if current_level:
            base_level = current_level.level
            
            # Generate predictions with increasing uncertainty
            next_hour = round(base_level + random.uniform(-0.1, 0.2), 2)
            next_6
