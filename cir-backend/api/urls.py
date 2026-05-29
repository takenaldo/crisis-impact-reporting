

from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# router.register(r'pictures', PictureViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
