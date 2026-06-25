from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/(?P<group_name>[^/]+)/$', consumers.GroupConsumer.as_asgi()),
]
