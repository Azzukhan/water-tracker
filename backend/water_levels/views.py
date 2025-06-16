from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .utils import (
    fetch_scottish_water_resource_levels,
    fetch_scottish_water_levels,
)
from .models import (
    WaterStation,
    WaterLevel,
    Alert,
    Prediction,
    ScottishWaterResourceLevel,
    ScottishWaterAverageLevel,
    ScottishWaterRegionalLevel,
    ScottishWaterLevel,
)
from .serializers import (
    WaterStationSerializer,
    WaterLevelSerializer,
    AlertSerializer,
    PredictionSerializer,
    ScottishWaterResourceLevelSerializer,
    ScottishWaterAverageLevelSerializer,
    ScottishWaterRegionalLevelSerializer,
    ScottishWaterLevelSerializer,
)

class WaterStationViewSet(viewsets.ModelViewSet):
    queryset = WaterStation.objects.all()
    serializer_class = WaterStationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['station_type', 'is_active', 'location']
    search_fields = ['name', 'location']
    
    @action(detail=True, methods=['get'])
    def water_levels(self, request, pk=None):
        station = self.get_object()
        water_levels = WaterLevel.objects.filter(station=station).order_by('-timestamp')[:24]
        serializer = WaterLevelSerializer(water_levels, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def alerts(self, request, pk=None):
        station = self.get_object()
        alerts = Alert.objects.filter(station=station).order_by('-created_at')
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def predictions(self, request, pk=None):
        station = self.get_object()
        prediction = Prediction.objects.filter(station=station).order_by('-created_at').first()
        if prediction:
            serializer = PredictionSerializer(prediction)
            return Response(serializer.data)
        return Response({"detail": "No predictions available for this station."}, status=404)

class WaterLevelViewSet(viewsets.ModelViewSet):
    queryset = WaterLevel.objects.all().order_by('-timestamp')
    serializer_class = WaterLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['station', 'status', 'trend']

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['station', 'severity', 'status']
    search_fields = ['title', 'description']

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all().order_by('-created_at')
    serializer_class = PredictionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['station']


class ScottishWaterResourceLevelViewSet(viewsets.ModelViewSet):
    queryset = ScottishWaterResourceLevel.objects.all().order_by('name')
    serializer_class = ScottishWaterResourceLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            fetch_scottish_water_resource_levels()
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ScottishWaterAverageLevelViewSet(viewsets.ModelViewSet):
    queryset = ScottishWaterAverageLevel.objects.all().order_by('-date')
    serializer_class = ScottishWaterAverageLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            fetch_scottish_water_resource_levels()
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ScottishWaterRegionalLevelViewSet(viewsets.ModelViewSet):
    queryset = ScottishWaterRegionalLevel.objects.all().order_by('area')
    serializer_class = ScottishWaterRegionalLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['area', 'date']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            fetch_scottish_water_resource_levels()
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ScottishWaterLevelViewSet(viewsets.ModelViewSet):
    queryset = ScottishWaterLevel.objects.all().order_by('-date')
    serializer_class = ScottishWaterLevelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['region', 'date']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            fetch_scottish_water_levels()
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
