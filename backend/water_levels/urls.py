from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScottishWaterAverageLevelViewSet,
    ScottishWaterRegionalLevelViewSet,
    SevernTrentReservoirLevelListView,
    SevernTrentForecastAPIView,
    YorkshireWaterReportViewSet,
    YorkshireWaterPredictionViewSet,
    YorkshireReservoirDataViewSet,
    SouthernWaterReservoirLevelViewSet,
    SouthernWaterForecastAPIView,
    GroundwaterStationViewSet,
    GroundwaterRegionSummaryAPIView,
)

router = DefaultRouter()
router.register(r'scottish-averages', ScottishWaterAverageLevelViewSet)
router.register(r'scottish-regions', ScottishWaterRegionalLevelViewSet)
router.register(r'yorkshire-water-reports', YorkshireWaterReportViewSet)
router.register(r'yorkshire-predictions', YorkshireWaterPredictionViewSet)
router.register(r'yorkshire/reservoir-data', YorkshireReservoirDataViewSet)
router.register(r'southernwater-reservoirs', SouthernWaterReservoirLevelViewSet)
router.register(r'groundwater-stations', GroundwaterStationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Legacy endpoint without the `-reservoirs` suffix
    path(
        'southernwater/',
        SouthernWaterReservoirLevelViewSet.as_view({'get': 'list'}),
        name='southernwater-data',
    ),
    path('severn-trent-reservoirs/', SevernTrentReservoirLevelListView.as_view(), name='severn-trent-data'),
    # Legacy endpoint without the `-reservoirs` suffix
    path('severn-trent/', SevernTrentReservoirLevelListView.as_view(), name='severn-trent-data-legacy'),
    path('severn-trent/forecast/', SevernTrentForecastAPIView.as_view(), name='severn-trent-forecast'),
    path('severn-trent/<str:model>/', SevernTrentForecastAPIView.as_view(), name='severn-trent-forecast-model'),
    path('southernwater/<str:reservoir>/<str:model>/', SouthernWaterForecastAPIView.as_view(), name='southernwater-forecast-model'),
    path('groundwater/summary/', GroundwaterRegionSummaryAPIView.as_view(), name='groundwater-summary'),
]
