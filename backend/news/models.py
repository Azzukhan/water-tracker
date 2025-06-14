from django.db import models
from django.utils import timezone

class NewsArticle(models.Model):
    """Model representing a news article or alert"""
    title = models.CharField(max_length=255)
    summary = models.TextField()
    content = models.TextField()
    category = models.CharField(max_length=50, choices=[
        ('Alert', 'Alert'),
        ('Update', 'Update'),
        ('Technology', 'Technology'),
        ('Research', 'Research'),
        ('Infrastructure', 'Infrastructure'),
    ])
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ])
    author = models.CharField(max_length=255)
    published_at = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=255)
    tags = models.JSONField(default=list)
    urgent = models.BooleanField(default=False)
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title
