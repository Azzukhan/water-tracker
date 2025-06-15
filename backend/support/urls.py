from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportRequestViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r'requests', SupportRequestViewSet, basename='support-request')
router.register(r'questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('', include(router.urls)),
]
