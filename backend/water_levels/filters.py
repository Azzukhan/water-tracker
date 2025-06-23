from django_filters import rest_framework as filters
from .models import GroundwaterPrediction


class GroundwaterPredictionFilter(filters.FilterSet):
    region = filters.CharFilter(field_name="region", lookup_expr="iexact")
    model_type = filters.CharFilter(field_name="model_type", lookup_expr="iexact")

    class Meta:
        model = GroundwaterPrediction
        fields = ["region", "model_type", "date"]
