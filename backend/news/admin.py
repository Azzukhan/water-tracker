from django.contrib import admin
from django.db.models import Q
from .models import NewsArticle

class StatusFilter(admin.SimpleListFilter):
    title = "status"
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (("urgent", "Urgent"), ("normal", "Normal"))

    def queryset(self, request, queryset):
        if self.value() == "urgent":
            return queryset.filter(Q(urgent=True) | Q(severity="high"))
        if self.value() == "normal":
            return queryset.filter(urgent=False).exclude(severity="high")
        return queryset

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "published_date", "status", "category", "severity", "urgent")
    list_filter = (StatusFilter, "category", "severity", "urgent", "author", "published_at")
    search_fields = ("title", "summary", "content", "author", "location", "tags")
    date_hierarchy = "published_at"
    ordering = ("-published_at",)

    @admin.display(description="Published date", ordering="published_at")
    def published_date(self, obj):
        return obj.published_at

    @admin.display(description="Status")
    def status(self, obj):
        return "Urgent" if obj.urgent or obj.severity == "high" else "Normal"
