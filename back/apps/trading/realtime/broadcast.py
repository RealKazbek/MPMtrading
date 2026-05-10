from __future__ import annotations

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from apps.trading.models import Candle, DashboardUser, Instrument, TradeHistory
from apps.trading.services.dashboard import (
    build_dashboard_summary,
    build_session_stats,
    serialize_active_trade,
    serialize_closed_trade,
)
from apps.trading.services.market import decimal_to_str
from .protocol import BALANCE_GROUP, PRICE_GROUP, SESSION_STATS_GROUP, TRADES_GROUP, symbol_group


class TradingBroadcaster:
    @staticmethod
    def _send(group: str, message: dict[str, object]) -> None:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return

        async_to_sync(channel_layer.group_send)(
            group,
            {"type": "push.message", "message": message},
        )

    @classmethod
    def broadcast_price_tick(cls, quote: dict[str, object]) -> None:
        message = {"type": "PRICE_TICK", **quote}
        cls._send(PRICE_GROUP, message)
        cls._send(symbol_group(str(quote["symbol"])), message)

    @classmethod
    def broadcast_candle_update(cls, candle: Candle) -> None:
        message = {
            "candle": {
                "close": decimal_to_str(candle.close),
                "high": decimal_to_str(candle.high),
                "low": decimal_to_str(candle.low),
                "open": decimal_to_str(candle.open),
                "timestamp": candle.bucket_start.isoformat(),
                "volume": decimal_to_str(candle.volume),
            },
            "symbol": candle.instrument.symbol,
            "timeframe": candle.timeframe,
            "type": "CANDLE_UPDATE",
        }
        cls._send(symbol_group(candle.instrument.symbol), message)

    @classmethod
    def broadcast_balance_update(cls, user: DashboardUser) -> None:
        summary = build_dashboard_summary(user)
        cls._send(
            BALANCE_GROUP,
            {
                "balance": summary["balance"],
                "equity": summary["equity"],
                "floatingPnl": summary["floatingPnl"],
                "totalPnl": summary["totalPnl"],
                "type": "BALANCE_UPDATE",
                "winRate": summary["winRate"],
            },
        )

    @classmethod
    def broadcast_session_stats(cls, user: DashboardUser) -> None:
        cls._send(
            SESSION_STATS_GROUP,
            {
                "sessionStats": build_session_stats(user),
                "type": "SESSION_STATS_UPDATE",
            },
        )

    @classmethod
    def broadcast_trade_opened(cls, trade) -> None:
        cls._send(
            TRADES_GROUP,
            {
                "trade": serialize_active_trade(trade),
                "tradeStatus": "OPENED",
                "type": "TRADE_STATUS_UPDATE",
            },
        )

    @classmethod
    def broadcast_trade_closed(cls, trade: TradeHistory) -> None:
        cls._send(
            TRADES_GROUP,
            {
                "trade": serialize_closed_trade(trade),
                "tradeStatus": "CLOSED",
                "type": "TRADE_STATUS_UPDATE",
            },
        )

    @classmethod
    def broadcast_position_dependent_updates(cls, symbol: str | None = None) -> None:
        for user in DashboardUser.objects.filter(is_active=True).order_by("email"):
            cls.broadcast_balance_update(user)
            cls.broadcast_session_stats(user)
