from rest_framework import viewsets, permissions
from .models import SupportRequest, Question
from .serializers import SupportRequestSerializer, QuestionSerializer

class SupportRequestViewSet(viewsets.ModelViewSet):
    queryset = SupportRequest.objects.all()
    serializer_class = SupportRequestSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post']

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post']
