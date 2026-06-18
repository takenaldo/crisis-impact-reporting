

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.views.decorators.csrf import csrf_exempt

from .views import ImpactReportViewSet,  UserViewSet, QuestionsViewSet, AnswerViewSet
from .map_views import map_bbox

router = DefaultRouter()
router.register(r'impact-reports', ImpactReportViewSet,
                basename='impactreport')
router.register(r'user', UserViewSet, 'userviewset')

router.register(r'questions', QuestionsViewSet, 'questionsviewsets')
router.register(r'answers', AnswerViewSet, 'answers')


urlpatterns = [
    path('', include(router.urls)),
    path('login/', csrf_exempt(TokenObtainPairView.as_view()),
         name='token_obtain_pair'),

    # Endpoint to get a new access token using a refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('map/bbox/', map_bbox, name='map-bbox'),
]
