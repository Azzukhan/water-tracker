from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScottishWaterAverageLevelViewSet,
    ScottishWaterRegionalLevelViewSet,
    SevernTrentReservoirLevelListView,
    SevernTrentForecastAPIView,
)

router = DefaultRouter()
router.register(r'scottish-averages', ScottishWaterAverageLevelViewSet)
router.register(r'scottish-regions', ScottishWaterRegionalLevelViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('severn-trent-reservoirs/', SevernTrentReservoirLevelListView.as_view(), name='severn-trent-data'),
    path('severn-trent/forecast/', SevernTrentForecastAPIView.as_view(), name='severn-trent-forecast'),
    path('severn-trent/<str:model>/', SevernTrentForecastAPIView.as_view(), name='severn-trent-forecast-model'),
]
