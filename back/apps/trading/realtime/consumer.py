from __future__ import annotations

import asyncio
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

from apps.trading.realtime.simulator import market_simulator

logger = logging.getLogger(__name__)


class MarketConsumer(AsyncWebsocketConsumer):
    heartbeat_task: asyncio.Task | None = None
    market_task: asyncio.Task | None = None

    async def connect(self):
        logger.info("WebSocket CONNECT path=%s channel=%s", self.scope.get("path"), self.channel_name)
        await self.accept()
        await self.send(
            text_data=json.dumps(market_simulator.snapshot())
        )
        self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        self.market_task = asyncio.create_task(self._market_loop())
        logger.info("Market WebSocket connected: channel=%s", self.channel_name)

    async def disconnect(self, close_code):
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
        if self.market_task:
            self.market_task.cancel()

        logger.info(
            "WebSocket DISCONNECT path=%s channel=%s code=%s",
            self.scope.get("path"),
            self.channel_name,
            close_code,
        )
        logger.info("Market WebSocket disconnected: channel=%s code=%s", self.channel_name, close_code)

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

    async def _heartbeat_loop(self):
        try:
            while True:
                await asyncio.sleep(20)
                await self.send(
                    text_data=json.dumps(
                        {
                            "timestamp": timezone.now().isoformat(),
                            "type": "HEARTBEAT",
                        }
                    )
                )
        except asyncio.CancelledError:
            return

    async def _market_loop(self):
        try:
            while True:
                await asyncio.sleep(1.5)
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "MARKET_BATCH",
                            "updates": market_simulator.tick(),
                        }
                    )
                )
        except asyncio.CancelledError:
            return

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
