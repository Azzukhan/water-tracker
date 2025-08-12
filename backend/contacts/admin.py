from django.contrib import admin
from .models import (
    SupportRequest,
    Question,
    IssueReport,
)


@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "subject",
        "category",
        "message",
        "urgent",
        "newsletter",
        "created_at",
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "question",
        "created_at",
    )
    list_filter = ("email",)


@admin.register(IssueReport)
class IssueReportAdmin(admin.ModelAdmin):
    list_display = (
        "issue_type",
        "severity",
        "location",
        "postcode",
    ) 
    list_filter = ("issue_type", "severity")
