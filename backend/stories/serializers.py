from rest_framework import serializers
from .models import CommunityStory

class CommunityStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityStory
        fields = ['id', 'name', 'email', 'text', 'created_at']
