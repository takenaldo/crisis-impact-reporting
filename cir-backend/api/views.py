from django.shortcuts import render

from rest_framework import viewsets

from .models import ImpactReport
from .serializers import ImpactReportSerializer

# Create your views here.
class ImpactReportViewSet(viewsets.ModelViewSet):
    queryset = ImpactReport.objects.all()
    serializer_class = ImpactReportSerializer