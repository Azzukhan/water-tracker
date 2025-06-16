from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WaterStationViewSet,
    WaterLevelViewSet,
    AlertViewSet,
    PredictionViewSet,
    ScottishWaterResourceLevelViewSet,
    ScottishWaterAverageLevelViewSet,
    ScottishWaterRegionalLevelViewSet,
    ScottishWaterLevelViewSet,
)

router = DefaultRouter()
router.register(r'stations', WaterStationViewSet)
router.register(r'levels', WaterLevelViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'predictions', PredictionViewSet)
router.register(r'scottish-resources', ScottishWaterResourceLevelViewSet)
router.register(r'scottish-averages', ScottishWaterAverageLevelViewSet)
router.register(r'scottish-regions', ScottishWaterRegionalLevelViewSet)
router.register(r'scottish-levels', ScottishWaterLevelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
