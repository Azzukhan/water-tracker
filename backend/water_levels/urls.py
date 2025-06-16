from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScottishWaterAverageLevelViewSet,
    ScottishWaterRegionalLevelViewSet,
)

router = DefaultRouter()
router.register(r'scottish-averages', ScottishWaterAverageLevelViewSet)
router.register(r'scottish-regions', ScottishWaterRegionalLevelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
