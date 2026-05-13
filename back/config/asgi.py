import os
import logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

logger = logging.getLogger(__name__)


class WebSocketLoggingMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            headers = {key.decode("latin1"): value.decode("latin1") for key, value in scope.get("headers", [])}
            logger.info(
                "WebSocket HANDSHAKING path=%s origin=%s client=%s",
                scope.get("path"),
                headers.get("origin", ""),
                scope.get("client"),
            )

        await self.app(scope, receive, send)


django_asgi_app = get_asgi_application()

from config.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": WebSocketLoggingMiddleware(
            AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        ),
    }
)
