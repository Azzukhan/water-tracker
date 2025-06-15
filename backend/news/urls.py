from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsArticleViewSet, WaterNewsAPIView

router = DefaultRouter()
router.register(r'articles', NewsArticleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('water/', WaterNewsAPIView.as_view(), name='water-news'),
]
