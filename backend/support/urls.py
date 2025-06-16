from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportRequestViewSet, QuestionViewSet, IssueReportViewSet

router = DefaultRouter()
router.register(r'requests', SupportRequestViewSet, basename='support-request')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'issues', IssueReportViewSet, basename='issue-report')

urlpatterns = [
    path('', include(router.urls)),
]
