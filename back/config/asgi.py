import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from channels.security.websocket import OriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter
from django.conf import settings
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from apps.trading.realtime.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": OriginValidator(
            URLRouter(websocket_urlpatterns),
            settings.WS_ALLOWED_ORIGINS,
        ),
    }
)
