from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/water-levels/(?P<station_id>\w+)/$', consumers.WaterLevelConsumer.as_asgi()),
]
