from __future__ import annotations

from decimal import Decimal

from django.utils import timezone

from apps.trading.models import ActiveTrade, DashboardSnapshot, DashboardUser, Instrument, TradeHistory, TradingSession
from apps.trading.services.market import calculate_trade_pnl, decimal_to_str, list_live_quotes


def serialize_instrument(instrument: Instrument) -> dict[str, object]:
    return {
        "displayName": instrument.display_name,
        "lotStep": decimal_to_str(instrument.lot_step),
        "minLot": decimal_to_str(instrument.min_lot),
        "pricePrecision": instrument.price_precision,
        "quantityPrecision": instrument.quantity_precision,
        "quoteCurrency": instrument.quote_currency,
        "symbol": instrument.symbol,
    }


def serialize_active_trade(trade: ActiveTrade) -> dict[str, object]:
    pnl, pnl_percent = calculate_trade_pnl(trade, trade.current_price)
    return {
        "currentPrice": decimal_to_str(trade.current_price),
        "direction": trade.direction,
        "entryPrice": decimal_to_str(trade.entry_price),
        "id": str(trade.id),
        "lotSize": decimal_to_str(trade.lot_size),
        "openTime": trade.opened_at.isoformat(),
        "pnl": decimal_to_str(pnl),
        "pnlPercent": decimal_to_str(pnl_percent),
        "stopLoss": decimal_to_str(trade.stop_loss),
        "symbol": trade.instrument.symbol,
        "takeProfit": decimal_to_str(trade.take_profit),
    }


def serialize_closed_trade(trade: TradeHistory) -> dict[str, object]:
    return {
        "closeTime": trade.closed_at.isoformat(),
        "direction": trade.direction,
        "entryPrice": decimal_to_str(trade.entry_price),
        "exitPrice": decimal_to_str(trade.exit_price),
        "id": str(trade.id),
        "lotSize": decimal_to_str(trade.lot_size),
        "openTime": trade.opened_at.isoformat(),
        "pnl": decimal_to_str(trade.pnl),
        "pnlPercent": decimal_to_str(trade.pnl_percent),
        "result": trade.result,
        "stopLoss": decimal_to_str(trade.stop_loss),
        "symbol": trade.instrument.symbol,
        "takeProfit": decimal_to_str(trade.take_profit),
    }


def build_session_stats(user: DashboardUser) -> dict[str, object]:
    active_trades = list(ActiveTrade.objects.select_related("instrument").filter(user=user))
    closed_trades = TradeHistory.objects.filter(user=user)
    floating_pnl = sum((calculate_trade_pnl(trade, trade.current_price)[0] for trade in active_trades), Decimal("0"))
    wins = closed_trades.filter(result=TradeHistory.Result.WIN).count()

    return {
        "activeTrades": len(active_trades),
        "closedTrades": closed_trades.count(),
        "floatingPnl": decimal_to_str(floating_pnl.quantize(Decimal("0.00000001"))),
        "wins": wins,
    }


def build_dashboard_summary(user: DashboardUser) -> dict[str, object]:
    active_trades = list(ActiveTrade.objects.select_related("instrument").filter(user=user))
    history = TradeHistory.objects.filter(user=user)
    floating_pnl = sum((calculate_trade_pnl(trade, trade.current_price)[0] for trade in active_trades), Decimal("0"))
    closed_pnl = sum((trade.pnl for trade in history), Decimal("0"))
    total_pnl = closed_pnl + floating_pnl
    equity = user.balance + floating_pnl
    wins = history.filter(result=TradeHistory.Result.WIN).count()
    total_closed = history.count()
    win_rate = round((wins / total_closed) * 100, 2) if total_closed else 0

    return {
        "activeTrades": len(active_trades),
        "balance": decimal_to_str(user.balance),
        "equity": decimal_to_str(equity.quantize(Decimal("0.00000001"))),
        "floatingPnl": decimal_to_str(floating_pnl.quantize(Decimal("0.00000001"))),
        "totalPnl": decimal_to_str(total_pnl.quantize(Decimal("0.00000001"))),
        "winRate": win_rate,
    }


def get_active_session(user: DashboardUser) -> TradingSession | None:
    return TradingSession.objects.filter(user=user, status=TradingSession.SessionStatus.ACTIVE).order_by("-started_at").first()


def build_dashboard_snapshot(user: DashboardUser) -> dict[str, object]:
    instruments = list(Instrument.objects.filter(is_active=True).order_by("symbol"))
    active_trades = list(ActiveTrade.objects.select_related("instrument").filter(user=user))
    summary = build_dashboard_summary(user)
    session_stats = build_session_stats(user)
    quotes = list_live_quotes()

    DashboardSnapshot.objects.create(
        user=user,
        captured_at=timezone.now(),
        quotes=quotes,
        session_stats=session_stats,
        summary=summary,
    )

    return {
        "activeTrades": [serialize_active_trade(trade) for trade in active_trades],
        "instruments": [serialize_instrument(instrument) for instrument in instruments],
        "quotes": quotes,
        "sessionStats": session_stats,
        "summary": summary,
    }
