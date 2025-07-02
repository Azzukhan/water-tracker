from rest_framework import viewsets, generics
from django_filters.rest_framework import DjangoFilterBackend

from .filters import EnglandwaterPredictionFilter
from rest_framework.response import Response

from .utils import fetch_scottish_water_resource_levels
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    ScottishWaterForecast,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterReport,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
    SouthernWaterReservoirLevel,
    SouthernWaterReservoirForecast,
    ScottishWaterRegionalForecast,
    EnglandwaterStation,
    EnglandwaterLevel,
    EnglandwaterPrediction,
    EnglandwaterPredictionAccuracy,
    SevernTrentForecastAccuracy,
    YorkshireWaterPredictionAccuracy,
    SouthernWaterForecastAccuracy,
    ScottishWaterPredictionAccuracy,
)
from .serializers import (
    ScottishWaterAverageLevelSerializer,
    ScottishWaterRegionalLevelSerializer,
    ScottishWaterForecastSerializer,
    SevernTrentReservoirLevelSerializer,
    SevernTrentForecastSerializer,
    YorkshireWaterReportSerializer,
    YorkshireWaterPredictionSerializer,
    YorkshireReservoirSerializer,
    SouthernWaterReservoirLevelSerializer,
    SouthernWaterForecastSerializer,
    ScottishWaterRegionalForecastSerializer,
    EnglandwaterStationSerializer,
    EnglandwaterLevelSerializer,
    EnglandwaterPredictionSerializer,
    EnglandwaterPredictionAccuracySerializer,
    SevernTrentForecastAccuracySerializer,
    YorkshireWaterPredictionAccuracySerializer,
    SouthernWaterForecastAccuracySerializer,
    ScottishWaterPredictionAccuracySerializer,
)


class ScottishWaterAverageLevelViewSet(viewsets.ModelViewSet):
    queryset = ScottishWaterAverageLevel.objects.all().order_by("-date")
    serializer_class = ScottishWaterAverageLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["date"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            fetch_scottish_water_resource_levels()
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ScottishWaterRegionalLevelViewSet(viewsets.ModelViewSet):
    queryset = ScottishWaterRegionalLevel.objects.all().order_by("area")
    serializer_class = ScottishWaterRegionalLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["area", "date"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            fetch_scottish_water_resource_levels()
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ScottishWaterForecastAPIView(generics.ListAPIView):
    serializer_class = ScottishWaterForecastSerializer
    pagination_class = None

    def get_queryset(self):
        model_type = self.kwargs.get("model", "ARIMA").upper()
        return ScottishWaterForecast.objects.filter(model_type=model_type).order_by(
            "date"
        )


class ScottishRegionalForecastAPIView(generics.ListAPIView):
    serializer_class = ScottishWaterRegionalForecastSerializer
    pagination_class = None

    def get_queryset(self):
        area = self.kwargs.get("area")
        model_type = self.kwargs.get("model", "ARIMA").upper()
        return ScottishWaterRegionalForecast.objects.filter(
            area=area, model_type=model_type
        ).order_by("date")


class SevernTrentReservoirLevelListView(generics.ListAPIView):
    queryset = SevernTrentReservoirLevel.objects.all()
    serializer_class = SevernTrentReservoirLevelSerializer
    pagination_class = None


class SevernTrentForecastAPIView(generics.ListAPIView):
    serializer_class = SevernTrentForecastSerializer
    pagination_class = None

    def get_queryset(self):
        model_type = self.kwargs.get("model", "ARIMA").upper()
        return SevernTrentReservoirForecast.objects.filter(
            model_type=model_type
        ).order_by("date")


class YorkshireWaterReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireWaterReport.objects.order_by("-report_month")
    serializer_class = YorkshireWaterReportSerializer
    pagination_class = None


class YorkshireWaterPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireWaterPrediction.objects.order_by("date")
    serializer_class = YorkshireWaterPredictionSerializer
    pagination_class = None


class YorkshireReservoirDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireReservoirData.objects.order_by("-report_date")
    serializer_class = YorkshireReservoirSerializer
    pagination_class = None


class SouthernWaterReservoirLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SouthernWaterReservoirLevel.objects.all()
    serializer_class = SouthernWaterReservoirLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["reservoir", "date"]
    pagination_class = None


class SouthernWaterForecastAPIView(generics.ListAPIView):
    serializer_class = SouthernWaterForecastSerializer
    pagination_class = None

    def get_queryset(self):
        reservoir = self.kwargs.get("reservoir")
        model_type = self.kwargs.get("model", "ARIMA").upper()
        return SouthernWaterReservoirForecast.objects.filter(
            reservoir=reservoir, model_type=model_type
        ).order_by("date")


class EnglandwaterStationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EnglandwaterStation.objects.all()
    serializer_class = EnglandwaterStationSerializer
    pagination_class = None


class EnglandwaterLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EnglandwaterLevel.objects.all().order_by("-date")
    serializer_class = EnglandwaterLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["station", "station__station_id", "date"]
    pagination_class = None


class EnglandwaterPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EnglandwaterPrediction.objects.all().order_by("date")
    serializer_class = EnglandwaterPredictionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EnglandwaterPredictionFilter
    pagination_class = None


class EnglandwaterPredictionAccuracyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EnglandwaterPredictionAccuracy.objects.all().order_by("-date")
    serializer_class = EnglandwaterPredictionAccuracySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["region", "model_type", "date"]
    pagination_class = None


class SevernTrentForecastAccuracyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SevernTrentForecastAccuracy.objects.all().order_by("-date")
    serializer_class = SevernTrentForecastAccuracySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["model_type", "date"]
    pagination_class = None


class YorkshireWaterPredictionAccuracyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireWaterPredictionAccuracy.objects.all().order_by("-date")
    serializer_class = YorkshireWaterPredictionAccuracySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["model_type", "date"]
    pagination_class = None


class SouthernWaterForecastAccuracyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SouthernWaterForecastAccuracy.objects.all().order_by("-date")
    serializer_class = SouthernWaterForecastAccuracySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["reservoir", "model_type", "date"]
    pagination_class = None


class ScottishWaterPredictionAccuracyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScottishWaterPredictionAccuracy.objects.all().order_by("-date")
    serializer_class = ScottishWaterPredictionAccuracySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["area", "model_type", "date"]
    pagination_class = None


class EnglandwaterRegionSummaryAPIView(generics.GenericAPIView):
    """Return average latest groundwater level by region and overall."""

    serializer_class = EnglandwaterLevelSerializer

    def get(self, request, *args, **kwargs):
        data = {}
        overall_values = []
        for region in ["north", "south", "east", "west"]:
            values = []
            stations = EnglandwaterStation.objects.filter(region=region)
            for s in stations:
                level = s.levels.order_by("-date").first()
                if level:
                    values.append(level.value)
                    overall_values.append(level.value)
            if values:
                data[region] = sum(values) / len(values)
        overall = sum(overall_values) / len(overall_values) if overall_values else None
        return Response({"overall": overall, "regions": data})
