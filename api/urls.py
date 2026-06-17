

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CrisisViewSet, ImpactReportViewSet, NatureOfCrisisQuestionViewSet

router = DefaultRouter()

router.register(r'impact-reports', ImpactReportViewSet, basename='impactreport')
router.register(r'crises', CrisisViewSet, basename='crisis')
router.register(r'nature-of-crisis-questions', NatureOfCrisisQuestionViewSet, basename='natureofcrisisquestion')


urlpatterns = [
    path('', include(router.urls)),
]
