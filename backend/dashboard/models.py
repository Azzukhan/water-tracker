from django.db import models
from django.utils import timezone

class DashboardStat(models.Model):
    """Model for storing dashboard statistics"""
    name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=20, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=20, blank=True)
    category = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.name}: {self.value} {self.unit}"

    class Meta:
        ordering = ["-timestamp"]

class AnalyticsData(models.Model):
    """Model for storing time-series analytics data"""
    metric = models.CharField(max_length=100)
    value = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.metric}: {self.value} at {self.timestamp}"
