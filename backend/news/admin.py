from .models import NewsArticle
from django.contrib import admin

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "published_date", "status")
    list_filter = ("status", "author")

    
