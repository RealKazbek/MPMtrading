from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Iterable

from django.conf import settings
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from apps.trading.models import ActiveTrade, Candle, Instrument, PriceTick


@dataclass(frozen=True)
class QuotePayload:
    ask: str
    bid: str
    last: str
    symbol: str
    timestamp: str


def decimal_to_str(value: Decimal) -> str:
    return format(value, "f")


def get_quote_payload(instrument: Instrument) -> QuotePayload:
    timestamp = instrument.last_tick_at or timezone.now()
    return QuotePayload(
        ask=decimal_to_str(instrument.current_ask),
        bid=decimal_to_str(instrument.current_bid),
        last=decimal_to_str(instrument.current_last),
        symbol=instrument.symbol,
        timestamp=timestamp.isoformat(),
    )


def list_live_quotes() -> list[dict[str, str]]:
    instruments = Instrument.objects.filter(is_active=True).order_by("symbol")
    return [get_quote_payload(instrument).__dict__ for instrument in instruments]


def list_candles(symbol: str, timeframe: str | None = None, limit: int = 200) -> list[Candle]:
    selected_timeframe = timeframe or settings.MARKET_DEFAULT_TIMEFRAME
    return list(
        Candle.objects.select_related("instrument")
        .filter(instrument__symbol=symbol, timeframe=selected_timeframe)
        .order_by("-bucket_start")[:limit]
    )[::-1]


def get_latest_candle(symbol: str, timeframe: str | None = None) -> Candle | None:
    selected_timeframe = timeframe or settings.MARKET_DEFAULT_TIMEFRAME
    return (
        Candle.objects.select_related("instrument")
        .filter(instrument__symbol=symbol, timeframe=selected_timeframe)
        .order_by("-bucket_start")
        .first()
    )


def get_replay_sequences() -> dict[str, int]:
    return {
        row["instrument__symbol"]: row["latest_sequence"] or 0
        for row in PriceTick.objects.values("instrument__symbol").annotate(latest_sequence=Max("sequence"))
    }


def calculate_trade_pnl(trade: ActiveTrade, current_price: Decimal) -> tuple[Decimal, Decimal]:
    if trade.direction == ActiveTrade.Direction.BUY:
        pnl = (current_price - trade.entry_price) * trade.lot_size
    else:
        pnl = (trade.entry_price - current_price) * trade.lot_size

    pnl_percent = Decimal("0")
    if trade.entry_price:
        base = trade.entry_price * trade.lot_size
        if base:
            pnl_percent = (pnl / base) * Decimal("100")

    return pnl.quantize(Decimal("0.00000001")), pnl_percent.quantize(Decimal("0.0001"))


@transaction.atomic
def apply_tick(symbol: str, sequence: int) -> dict[str, object] | None:
    tick = (
        PriceTick.objects.select_related("instrument")
        .select_for_update()
        .filter(instrument__symbol=symbol, sequence=sequence)
        .first()
    )
    if tick is None:
        return None

    instrument = tick.instrument
    instrument.current_bid = tick.bid
    instrument.current_ask = tick.ask
    instrument.current_last = tick.last
    instrument.last_tick_at = tick.source_timestamp
    instrument.save(update_fields=["current_bid", "current_ask", "current_last", "last_tick_at", "updated_at"])

    ActiveTrade.objects.filter(instrument=instrument).update(current_price=tick.last, updated_at=timezone.now())

    candle = Candle.objects.filter(
        instrument=instrument,
        timeframe=settings.MARKET_DEFAULT_TIMEFRAME,
        bucket_start=tick.source_timestamp.replace(second=0, microsecond=0),
    ).first()

    live_quote = get_quote_payload(instrument).__dict__
    payload: dict[str, object] = {"quote": live_quote}

    if candle is not None:
        payload["candle"] = candle

    return payload


def stream_next_tick(symbol: str, sequence: int) -> bool:
    payload = apply_tick(symbol, sequence)
    if payload is None:
        return False

    from apps.trading.realtime.broadcast import TradingBroadcaster

    TradingBroadcaster.broadcast_price_tick(payload["quote"])

    candle = payload.get("candle")
    if candle is not None:
        TradingBroadcaster.broadcast_candle_update(candle)

    TradingBroadcaster.broadcast_position_dependent_updates(symbol=symbol)
    return True


def iter_symbols() -> Iterable[str]:
    return Instrument.objects.filter(is_active=True).order_by("symbol").values_list("symbol", flat=True)
