

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CrisisViewSet, ImpactReportViewSet

router = DefaultRouter()

router.register(r'impact-reports', ImpactReportViewSet, basename='impactreport')
router.register(r'crises', CrisisViewSet, basename='crisis')

urlpatterns = [
    path('', include(router.urls)),
]
