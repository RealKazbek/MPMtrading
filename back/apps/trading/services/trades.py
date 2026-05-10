from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.trading.models import ActiveTrade, DashboardUser, Instrument, TradeHistory, TradingSession
from apps.trading.services.dashboard import (
    build_dashboard_summary,
    build_session_stats,
    serialize_active_trade,
    serialize_closed_trade,
)
from apps.trading.services.market import calculate_trade_pnl, decimal_to_str, list_live_quotes


def _default_price_for_direction(instrument: Instrument, direction: str) -> Decimal:
    return instrument.current_ask if direction == ActiveTrade.Direction.BUY else instrument.current_bid


@transaction.atomic
def open_trade(
    *,
    user: DashboardUser,
    symbol: str,
    direction: str,
    lot_size: Decimal,
    entry_price: Decimal | None = None,
    stop_loss: Decimal | None = None,
    take_profit: Decimal | None = None,
) -> dict[str, object]:
    instrument = Instrument.objects.select_for_update().get(symbol=symbol, is_active=True)
    execution_price = entry_price or _default_price_for_direction(instrument, direction)
    trade = ActiveTrade.objects.create(
        current_price=instrument.current_last,
        direction=direction,
        entry_price=execution_price,
        instrument=instrument,
        lot_size=lot_size,
        opened_at=timezone.now(),
        stop_loss=stop_loss or execution_price * Decimal("0.99"),
        take_profit=take_profit or execution_price * Decimal("1.01"),
        user=user,
    )

    TradingSession.objects.filter(user=user, status=TradingSession.SessionStatus.ACTIVE).update(current_equity=user.balance)

    payload = {
        "activeTrade": serialize_active_trade(trade),
        "message": "Trade opened successfully.",
        "quotes": list_live_quotes(),
        "sessionStats": build_session_stats(user),
        "summary": build_dashboard_summary(user),
    }

    from apps.trading.realtime.broadcast import TradingBroadcaster

    TradingBroadcaster.broadcast_trade_opened(trade)
    TradingBroadcaster.broadcast_position_dependent_updates(symbol=symbol)
    return payload


@transaction.atomic
def close_trade(*, user: DashboardUser, trade_id: str) -> dict[str, object]:
    trade = ActiveTrade.objects.select_related("instrument").select_for_update().get(id=trade_id, user=user)
    current_price = trade.instrument.current_bid if trade.direction == ActiveTrade.Direction.BUY else trade.instrument.current_ask
    pnl, pnl_percent = calculate_trade_pnl(trade, current_price)
    result = TradeHistory.Result.WIN if pnl >= 0 else TradeHistory.Result.LOSS

    closed_trade = TradeHistory.objects.create(
        closed_at=timezone.now(),
        direction=trade.direction,
        entry_price=trade.entry_price,
        exit_price=current_price,
        id=trade.id,
        instrument=trade.instrument,
        lot_size=trade.lot_size,
        opened_at=trade.opened_at,
        pnl=pnl,
        pnl_percent=pnl_percent,
        result=result,
        stop_loss=trade.stop_loss,
        take_profit=trade.take_profit,
        user=user,
    )

    user.balance = (user.balance + pnl).quantize(Decimal("0.00000001"))
    user.total_pnl = (user.total_pnl + pnl).quantize(Decimal("0.00000001"))
    user.save(update_fields=["balance", "total_pnl", "updated_at"])

    trade.delete()

    TradingSession.objects.filter(user=user, status=TradingSession.SessionStatus.ACTIVE).update(current_equity=user.balance)

    payload = {
        "closedTrade": serialize_closed_trade(closed_trade),
        "message": "Trade closed successfully.",
        "quotes": list_live_quotes(),
        "sessionStats": build_session_stats(user),
        "summary": build_dashboard_summary(user),
    }

    from apps.trading.realtime.broadcast import TradingBroadcaster

    TradingBroadcaster.broadcast_trade_closed(closed_trade)
    TradingBroadcaster.broadcast_position_dependent_updates(symbol=closed_trade.instrument.symbol)
    return payload
