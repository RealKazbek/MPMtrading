from __future__ import annotations

import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

from apps.trading.realtime.simulator import MARKET_STREAM_GROUP, market_simulator

logger = logging.getLogger(__name__)


class MarketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add(MARKET_STREAM_GROUP, self.channel_name)
        await market_simulator.ensure_started()
        await self.send(
            text_data=json.dumps(market_simulator.snapshot())
        )
        logger.info(
            "WebSocket CONNECT path=%s channel=%s group=%s",
            self.scope.get("path"),
            self.channel_name,
            MARKET_STREAM_GROUP,
        )

    async def disconnect(self, close_code):
        if getattr(self, "channel_layer", None) is not None:
            await self.channel_layer.group_discard(MARKET_STREAM_GROUP, self.channel_name)

        logger.info(
            "WebSocket DISCONNECT path=%s channel=%s group=%s code=%s",
            self.scope.get("path"),
            self.channel_name,
            MARKET_STREAM_GROUP,
            close_code,
        )

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            await self._send_error("INVALID_MESSAGE", "WebSocket payload must be JSON text.")
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            await self._send_error("INVALID_JSON", "Unable to deserialize WebSocket payload.")
            return

        message_type = payload.get("type")
        if message_type == "PONG":
            return

        await self._send_error("UNSUPPORTED_EVENT", f"Unsupported event type: {message_type}")

    async def market_batch(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def _send_error(self, code: str, message: str):
        logger.warning("WebSocket error sent: channel=%s code=%s message=%s", self.channel_name, code, message)
        await self.send(
            text_data=json.dumps(
                {
                    "error": {
                        "code": code,
                        "message": message,
                    },
                    "type": "ERROR",
                }
            )
        )


TradingConsumer = MarketConsumer
