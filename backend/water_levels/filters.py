from django_filters import rest_framework as filters
from .models import EAwaterPrediction


class EAwaterPredictionFilter(filters.FilterSet):
    region = filters.CharFilter(field_name="region", lookup_expr="iexact")
    model_type = filters.CharFilter(field_name="model_type", lookup_expr="iexact")

    class Meta:
        model = EAwaterPrediction
        fields = ["region", "model_type", "date"]
