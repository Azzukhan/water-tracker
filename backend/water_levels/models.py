from django.db import models
from django.utils import timezone

class WaterStation(models.Model):
    """Model representing a water monitoring station"""
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    station_type = models.CharField(max_length=50, choices=[
        ('river', 'River'),
        ('lake', 'Lake'),
        ('reservoir', 'Reservoir'),
        ('coastal', 'Coastal'),
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.location})"

class WaterLevel(models.Model):
    """Model representing water level readings"""
    station = models.ForeignKey(WaterStation, on_delete=models.CASCADE, related_name='water_levels')
    level = models.FloatField(help_text="Water level in meters")
    normal_level = models.FloatField(help_text="Normal water level in meters")
    status = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ])
    trend = models.CharField(max_length=20, choices=[
        ('rising', 'Rising'),
        ('falling', 'Falling'),
        ('stable', 'Stable'),
    ])
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.station.name}: {self.level}m ({self.status})"

class Alert(models.Model):
    """Model representing water level alerts"""
    station = models.ForeignKey(WaterStation, on_delete=models.CASCADE, related_name='alerts')
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('monitoring', 'Monitoring'),
        ('resolved', 'Resolved'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.severity} ({self.status})"

class Prediction(models.Model):
    """Model representing ML predictions for water levels"""
    station = models.ForeignKey(WaterStation, on_delete=models.CASCADE, related_name='predictions')
    next_hour = models.FloatField(help_text="Predicted level in 1 hour")
    next_6_hours = models.FloatField(help_text="Predicted level in 6 hours")
    next_24_hours = models.FloatField(help_text="Predicted level in 24 hours")
    confidence = models.IntegerField(help_text="Prediction confidence percentage")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction for {self.station.name}"
