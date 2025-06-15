from rest_framework import serializers
from .models import SupportRequest, Question

class SupportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'email', 'question', 'created_at']
