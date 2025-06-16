from rest_framework import serializers
from .models import SupportRequest, Question, IssueReport

class SupportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'subject',
            'category',
            'message',
            'urgent',
            'newsletter',
            'created_at',
        ]

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'email', 'question', 'created_at']


class IssueReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueReport
        fields = [
            'id',
            'issue_type',
            'severity',
            'location',
            'postcode',
            'description',
            'contact_name',
            'contact_phone',
            'created_at',
        ]
