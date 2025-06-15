from rest_framework import viewsets, permissions
from .models import CommunityStory
from .serializers import CommunityStorySerializer

class CommunityStoryViewSet(viewsets.ModelViewSet):
    queryset = CommunityStory.objects.all()
    serializer_class = CommunityStorySerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post']
