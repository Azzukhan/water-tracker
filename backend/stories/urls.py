from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommunityStoryViewSet

router = DefaultRouter()
router.register(r'stories', CommunityStoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
