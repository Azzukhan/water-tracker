from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScottishWaterAverageLevelViewSet,
    ScottishWaterRegionalLevelViewSet,
    SevernTrentReservoirLevelListView,
    SevernTrentForecastAPIView,
    ScottishWaterForecastAPIView,
    ScottishRegionalForecastAPIView,
    YorkshireWaterPredictionViewSet,
    YorkshireReservoirDataViewSet,
    SouthernWaterReservoirLevelViewSet,
    SouthernWaterForecastAPIView,
    EAwaterStationViewSet,
    EAwaterLevelViewSet,
    EAwaterPredictionViewSet,
    EAwaterPredictionAccuracyViewSet,
    SevernTrentForecastAccuracyViewSet,
    YorkshireWaterPredictionAccuracyViewSet,
    SouthernWaterForecastAccuracyViewSet,
    ScottishWaterPredictionAccuracyViewSet,
    ScottishWaterForecastAccuracyViewSet,
    EAwaterRegionSummaryAPIView,
)

router = DefaultRouter()
router.register(r"scottish-averages", ScottishWaterAverageLevelViewSet)
router.register(r"scottish-regions", ScottishWaterRegionalLevelViewSet)
router.register(r"yorkshire-predictions", YorkshireWaterPredictionViewSet)
router.register(r"yorkshire/reservoir-data", YorkshireReservoirDataViewSet)
router.register(r"southernwater-reservoirs", SouthernWaterReservoirLevelViewSet)
router.register(r"groundwater-stations", EAwaterStationViewSet)
router.register(r"groundwater-levels", EAwaterLevelViewSet)
router.register(r"groundwater-predictions", EAwaterPredictionViewSet)
router.register(
    r"groundwater-prediction-accuracy", EAwaterPredictionAccuracyViewSet
)
router.register(r"severn-trent-prediction-accuracy", SevernTrentForecastAccuracyViewSet)
router.register(
    r"yorkshire-prediction-accuracy", YorkshireWaterPredictionAccuracyViewSet
)
router.register(
    r"southernwater-prediction-accuracy", SouthernWaterForecastAccuracyViewSet
)
router.register(
    r"scottishwater-prediction-accuracy", ScottishWaterPredictionAccuracyViewSet
)
router.register(
    r"scottishwater-forecast-accuracy", ScottishWaterForecastAccuracyViewSet
)

urlpatterns = [
    path("", include(router.urls)),

    path(
        "southernwater/",
        SouthernWaterReservoirLevelViewSet.as_view({"get": "list"}),
        name="southernwater-data",
    ),
    path(
        "severn-trent-reservoirs/",
        SevernTrentReservoirLevelListView.as_view(),
        name="severn-trent-data",
    ),
    path(
        "severn-trent/",
        SevernTrentReservoirLevelListView.as_view(),
        name="severn-trent-data-legacy",
    ),
    path(
        "severn-trent/forecast/",
        SevernTrentForecastAPIView.as_view(),
        name="severn-trent-forecast",
    ),
    path(
        "severn-trent/<str:model>/",
        SevernTrentForecastAPIView.as_view(),
        name="severn-trent-forecast-model",
    ),
    path(
        "scottishwater/<str:model>/",
        ScottishWaterForecastAPIView.as_view(),
        name="scottish-forecast-model",
    ),
    path(
        "scottishwater/regional/<str:area>/<str:model>/",
        ScottishRegionalForecastAPIView.as_view(),
        name="scottish-regional-forecast",
    ),
    path(
        "southernwater/<str:reservoir>/<str:model>/",
        SouthernWaterForecastAPIView.as_view(),
        name="southernwater-forecast-model",
    ),
    path(
        "groundwater/summary/",
        EAwaterRegionSummaryAPIView.as_view(),
        name="groundwater-summary",
    ),
]
