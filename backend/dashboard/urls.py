from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardStatViewSet, AnalyticsDataViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'stats', DashboardStatViewSet)
router.register(r'analytics', AnalyticsDataViewSet)
router.register(r'', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
