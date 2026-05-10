from __future__ import annotations

from decimal import Decimal

from apps.trading.models import ActiveTrade, DashboardUser, TradeHistory
from apps.trading.services.dashboard import build_dashboard_summary
from apps.trading.services.market import decimal_to_str


def build_profile_payload(user: DashboardUser) -> dict[str, object]:
    trade_history = list(TradeHistory.objects.select_related("instrument").filter(user=user))
    wins = [trade for trade in trade_history if trade.result == TradeHistory.Result.WIN]
    losses = [trade for trade in trade_history if trade.result == TradeHistory.Result.LOSS]
    total_trades = len(trade_history)
    win_rate = round((len(wins) / total_trades) * 100, 2) if total_trades else 0

    average_win = sum((trade.pnl for trade in wins), Decimal("0")) / Decimal(len(wins) or 1)
    average_loss = sum((trade.pnl for trade in losses), Decimal("0")) / Decimal(len(losses) or 1)
    gross_profit = sum((trade.pnl for trade in wins), Decimal("0"))
    gross_loss = abs(sum((trade.pnl for trade in losses), Decimal("0")))
    profit_factor = "0.00" if gross_loss == 0 else decimal_to_str((gross_profit / gross_loss).quantize(Decimal("0.01")))

    dashboard_summary = build_dashboard_summary(user)

    return {
        "achievements": [
            {"description": "Closed at least one profitable trade.", "earned": len(wins) > 0, "id": "first-win", "label": "First Winning Trade"},
            {"description": "Maintained positive total PnL.", "earned": Decimal(dashboard_summary["totalPnl"]) > 0, "id": "positive-pnl", "label": "Positive PnL"},
            {"description": "Tracked three or more instruments in realtime.", "earned": True, "id": "watchlist", "label": "Realtime Watchlist"},
        ],
        "profile": {
            "email": user.email,
            "memberSince": user.created_at.date().isoformat(),
            "name": user.name,
            "tier": user.tier,
        },
        "settings": [
            {"label": "Execution mode", "value": "Paper Trading"},
            {"label": "Data mode", "value": "REST + WebSocket Hybrid"},
            {"label": "Default account currency", "value": "USD"},
        ],
        "stats": {
            "activeTrades": ActiveTrade.objects.filter(user=user).count(),
            "averageLoss": decimal_to_str(average_loss.quantize(Decimal("0.00000001"))),
            "averageWin": decimal_to_str(average_win.quantize(Decimal("0.00000001"))),
            "balance": decimal_to_str(user.balance),
            "profitFactor": profit_factor,
            "totalPnl": dashboard_summary["totalPnl"],
            "totalTrades": total_trades,
            "winRate": win_rate,
        },
    }
