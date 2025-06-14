from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DashboardStat, AnalyticsData
from .serializers import DashboardStatSerializer, AnalyticsDataSerializer
from water_levels.models import WaterStation, WaterLevel, Alert, Prediction
from water_levels.serializers import WaterStationSerializer, WaterLevelSerializer, AlertSerializer, PredictionSerializer

class DashboardStatViewSet(viewsets.ModelViewSet):
    queryset = DashboardStat.objects.all()
    serializer_class = DashboardStatSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'name']

class AnalyticsDataViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsData.objects.all()
    serializer_class = AnalyticsDataSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['metric', 'category', 'location']
    search_fields = ['metric', 'location']

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for aggregating dashboard data from multiple sources
    """
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get overview statistics for the dashboard"""
        # Count active stations
        total_stations = WaterStation.objects.filter(is_active=True).count()
        
        # Count active alerts
        active_alerts = Alert.objects.filter(status='active').count()
        
        # Calculate average water level
        water_levels = WaterLevel.objects.all()
        avg_water_level = 0
        if water_levels.exists():
            avg_water_level = sum(wl.level for wl in water_levels) / water_levels.count()
            avg_water_level = round(avg_water_level, 2)
        
        # Get recent alerts
        recent_alerts = Alert.objects.filter(status__in=['active', 'monitoring']).order_by('-created_at')[:5]
        recent_alerts_data = AlertSerializer(recent_alerts, many=True).data
        
        # Get water level status for key stations
        key_stations = WaterStation.objects.filter(is_active=True)[:5]
        water_levels_data = []
        
        for station in key_stations:
            latest_level = WaterLevel.objects.filter(station=station).order_by('-timestamp').first()
            if latest_level:
                water_levels_data.append(WaterLevelSerializer(latest_level).data)
        
        # Get predictions
        predictions = Prediction.objects.order_by('-created_at')[:5]
        predictions_data = PredictionSerializer(predictions, many=True).data
        
        return Response({
            'overview': {
                'totalStations': total_stations,
                'activeAlerts': active_alerts,
                'avgWaterLevel': avg_water_level,
                'weatherStatus': 'Partly Cloudy',  # This would come from weather service
            },
            'recentAlerts': recent_alerts_data,
            'waterLevels': water_levels_data,
            'predictions': predictions_data,
        })
    
    @action(detail=False, methods=['get'])
    def water_levels(self, request):
        """Get detailed water level data for charts"""
        # This would typically include time-series data for charts
        return Response({
            'message': 'Water level chart data would be returned here'
        })
    
    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get detailed alert data"""
        alerts = Alert.objects.all().order_by('-created_at')
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def predictions(self, request):
        """Get ML prediction data"""
        predictions = Prediction.objects.all().order_by('-created_at')
        serializer = PredictionSerializer(predictions, many=True)
        return Response(serializer.data)
