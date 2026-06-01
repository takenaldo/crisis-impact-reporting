

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ImpactReportViewSet

router = DefaultRouter()

router.register(r'impact-reports', ImpactReportViewSet, basename='impactreport')

urlpatterns = [
    path('', include(router.urls)),
]
