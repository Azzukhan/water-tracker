from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportRequestViewSet, QuestionViewSet, IssueReportViewSet

router = DefaultRouter()
router.register(r'request', SupportRequestViewSet)
router.register(r'question', QuestionViewSet)
router.register(r'issue', IssueReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
