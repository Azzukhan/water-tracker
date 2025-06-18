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
)
from .serializers import (
    ScottishWaterAverageLevelSerializer,
    ScottishWaterRegionalLevelSerializer,
    SevernTrentReservoirLevelSerializer,
    SevernTrentForecastSerializer,
    YorkshireWaterReportSerializer,
    YorkshireWaterPredictionSerializer,
    YorkshireReservoirSerializer,
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
