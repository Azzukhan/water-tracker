from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NewsArticleViewSet,
    WaterNewsAPIView,
    AlertScraperAPIView,
    FloodMonitoringAPIView,
    GDELTNewsAPIView,
)

router = DefaultRouter()
router.register(r'articles', NewsArticleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('water/', WaterNewsAPIView.as_view(), name='water-news'),
    path('alerts/', AlertScraperAPIView.as_view(), name='alert-news'),
    path('floods/', FloodMonitoringAPIView.as_view(), name='flood-news'),
    path('gdelt/', GDELTNewsAPIView.as_view(), name='gdelt-news'),
]
