from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WaterStationViewSet, WaterLevelViewSet, AlertViewSet, PredictionViewSet

router = DefaultRouter()
router.register(r'stations', WaterStationViewSet)
router.register(r'levels', WaterLevelViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'predictions', PredictionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
