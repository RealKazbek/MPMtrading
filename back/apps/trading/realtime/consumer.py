from __future__ import annotations

import asyncio
import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.utils import timezone

from apps.trading.models import DashboardUser, WebsocketConnection
from apps.trading.realtime.protocol import SUPPORTED_CHANNELS, symbol_group

logger = logging.getLogger(__name__)


class TradingConsumer(AsyncWebsocketConsumer):
    heartbeat_task: asyncio.Task | None = None

    async def connect(self):
        await self.accept()
        self.group_names: set[str] = set()
        self.user = await self._get_demo_user()
        await self._register_connection()
        self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        logger.info("WebSocket connected: channel=%s user=%s", self.channel_name, self.user.email)

    async def disconnect(self, close_code):
        if self.heartbeat_task:
            self.heartbeat_task.cancel()

        await self._unregister_groups()
        await self._mark_disconnected()
        logger.info("WebSocket disconnected: channel=%s code=%s", self.channel_name, close_code)

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
            await self._touch_heartbeat()
            return

        if message_type == "SUBSCRIBE":
            await self._handle_subscribe(payload)
            return

        if message_type == "UNSUBSCRIBE":
            await self._handle_unsubscribe(payload)
            return

        await self._send_error("UNSUPPORTED_EVENT", f"Unsupported event type: {message_type}")

    async def push_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

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

    async def _handle_subscribe(self, payload: dict[str, object]):
        channels = payload.get("channels", [])
        symbols = payload.get("symbols", [])

        if not isinstance(channels, list) or not isinstance(symbols, list):
            await self._send_error("INVALID_SUBSCRIPTION", "channels and symbols must be arrays.")
            return

        for channel in channels:
            group = SUPPORTED_CHANNELS.get(channel)
            if channel == "candles":
                continue
            if channel == "prices" and symbols:
                continue
            if group:
                await self.channel_layer.group_add(group, self.channel_name)
                self.group_names.add(group)

        for symbol in symbols:
            await self.channel_layer.group_add(symbol_group(str(symbol)), self.channel_name)
            self.group_names.add(symbol_group(str(symbol)))

        await self._persist_subscription(channels=[str(channel) for channel in channels], symbols=[str(symbol) for symbol in symbols])
        logger.info(
            "WebSocket subscription updated: channel=%s groups=%s symbols=%s",
            self.channel_name,
            channels,
            symbols,
        )

    async def _handle_unsubscribe(self, payload: dict[str, object]):
        channels = payload.get("channels", [])
        symbols = payload.get("symbols", [])

        for channel in channels if isinstance(channels, list) else []:
            group = SUPPORTED_CHANNELS.get(channel)
            if group and group in self.group_names:
                await self.channel_layer.group_discard(group, self.channel_name)
                self.group_names.discard(group)

        for symbol in symbols if isinstance(symbols, list) else []:
            group_name = symbol_group(str(symbol))
            if group_name in self.group_names:
                await self.channel_layer.group_discard(group_name, self.channel_name)
                self.group_names.discard(group_name)

        await self._persist_subscription(
            channels=[channel for channel in getattr(self, "subscribed_channels", []) if channel not in channels],
            symbols=[symbol for symbol in getattr(self, "subscribed_symbols", []) if symbol not in symbols],
        )
        logger.info(
            "WebSocket unsubscribe handled: channel=%s groups=%s symbols=%s",
            self.channel_name,
            channels if isinstance(channels, list) else [],
            symbols if isinstance(symbols, list) else [],
        )

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

    async def _unregister_groups(self):
        for group_name in list(self.group_names):
            await self.channel_layer.group_discard(group_name, self.channel_name)
        self.group_names.clear()

    @database_sync_to_async
    def _get_demo_user(self):
        return DashboardUser.objects.get(email=settings.DEMO_USER_EMAIL)

    @database_sync_to_async
    def _register_connection(self):
        WebsocketConnection.objects.update_or_create(
            channel_name=self.channel_name,
            defaults={
                "connected_at": timezone.now(),
                "last_heartbeat_at": timezone.now(),
                "status": WebsocketConnection.ConnectionStatus.CONNECTED,
                "subscribed_channels": [],
                "subscribed_symbols": [],
                "user": self.user,
                "disconnected_at": None,
            },
        )
        self.subscribed_channels = []
        self.subscribed_symbols = []

    @database_sync_to_async
    def _persist_subscription(self, channels: list[str], symbols: list[str]):
        WebsocketConnection.objects.filter(channel_name=self.channel_name).update(
            subscribed_channels=channels,
            subscribed_symbols=symbols,
            last_heartbeat_at=timezone.now(),
        )
        self.subscribed_channels = channels
        self.subscribed_symbols = symbols

    @database_sync_to_async
    def _touch_heartbeat(self):
        WebsocketConnection.objects.filter(channel_name=self.channel_name).update(last_heartbeat_at=timezone.now())

    @database_sync_to_async
    def _mark_disconnected(self):
        WebsocketConnection.objects.filter(channel_name=self.channel_name).update(
            disconnected_at=timezone.now(),
            status=WebsocketConnection.ConnectionStatus.DISCONNECTED,
        )
