from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScottishWaterAverageLevelViewSet,
    ScottishWaterRegionalLevelViewSet,
    SevernTrentReservoirLevelListView,
    SevernTrentForecastAPIView,
    YorkshireWaterReportViewSet,
    YorkshireWaterPredictionViewSet,
)

router = DefaultRouter()
router.register(r'scottish-averages', ScottishWaterAverageLevelViewSet)
router.register(r'scottish-regions', ScottishWaterRegionalLevelViewSet)
router.register(r'yorkshire-water-reports', YorkshireWaterReportViewSet)
router.register(r'yorkshire-predictions', YorkshireWaterPredictionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('severn-trent-reservoirs/', SevernTrentReservoirLevelListView.as_view(), name='severn-trent-data'),
    path('severn-trent/forecast/', SevernTrentForecastAPIView.as_view(), name='severn-trent-forecast'),
    path('severn-trent/<str:model>/', SevernTrentForecastAPIView.as_view(), name='severn-trent-forecast-model'),
]
