from rest_framework import viewsets, generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from .utils import fetch_scottish_water_resource_levels
from .models import (
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    SevernTrentReservoirLevel,
    SevernTrentReservoirForecast,
    YorkshireWaterReport,
    YorkshireWaterPrediction,
    YorkshireReservoirData,
    SouthernWaterReservoirLevel,
    SouthernWaterReservoirForecast,
    GroundwaterStation,
    GroundwaterLevel,
)
from .serializers import (
    ScottishWaterAverageLevelSerializer,
    ScottishWaterRegionalLevelSerializer,
    SevernTrentReservoirLevelSerializer,
    SevernTrentForecastSerializer,
    YorkshireWaterReportSerializer,
    YorkshireWaterPredictionSerializer,
    YorkshireReservoirSerializer,
    SouthernWaterReservoirLevelSerializer,
    SouthernWaterForecastSerializer,
    GroundwaterStationSerializer,
    GroundwaterLevelSerializer,
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


class SevernTrentReservoirLevelListView(generics.ListAPIView):
    queryset = SevernTrentReservoirLevel.objects.all()
    serializer_class = SevernTrentReservoirLevelSerializer
    pagination_class = None


class SevernTrentForecastAPIView(generics.ListAPIView):
    serializer_class = SevernTrentForecastSerializer
    pagination_class = None

    def get_queryset(self):
        model_type = self.kwargs.get("model", "ARIMA").upper()
        return (
            SevernTrentReservoirForecast.objects.filter(model_type=model_type)
            .order_by("date")
        )


class YorkshireWaterReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireWaterReport.objects.order_by('-report_month')
    serializer_class = YorkshireWaterReportSerializer
    pagination_class = None


class YorkshireWaterPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireWaterPrediction.objects.order_by('date')
    serializer_class = YorkshireWaterPredictionSerializer
    pagination_class = None


class YorkshireReservoirDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YorkshireReservoirData.objects.order_by('-report_date')
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
        return (
            SouthernWaterReservoirForecast.objects.filter(
                reservoir=reservoir, model_type=model_type
            ).order_by("date")
        )


class GroundwaterStationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GroundwaterStation.objects.all()
    serializer_class = GroundwaterStationSerializer
    pagination_class = None


class GroundwaterRegionSummaryAPIView(generics.GenericAPIView):
    """Return average latest groundwater level by region and overall."""
    serializer_class = GroundwaterLevelSerializer

    def get(self, request, *args, **kwargs):
        data = {}
        overall_values = []
        for region in ["north", "south", "east", "west"]:
            values = []
            stations = GroundwaterStation.objects.filter(region=region)
            for s in stations:
                level = s.levels.order_by("-date").first()
                if level:
                    values.append(level.value)
                    overall_values.append(level.value)
            if values:
                data[region] = sum(values) / len(values)
        overall = sum(overall_values) / len(overall_values) if overall_values else None
        return Response({"overall": overall, "regions": data})
