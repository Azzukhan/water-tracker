from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportRequestViewSet, QuestionViewSet, IssueReportViewSet

router = DefaultRouter()
router.register(r'request', SupportRequestViewSet, basename='support-request')
router.register(r'question', QuestionViewSet, basename='question')
router.register(r'issue', IssueReportViewSet, basename='issue-report')

urlpatterns = [
    path('', include(router.urls)),
]
