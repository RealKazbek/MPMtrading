from django.urls import re_path

from .consumer import TradingConsumer

websocket_urlpatterns = [
    re_path(r"^ws/trading/?$", TradingConsumer.as_asgi()),
]
