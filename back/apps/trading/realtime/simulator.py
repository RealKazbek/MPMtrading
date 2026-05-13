from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from random import Random
from threading import Lock
from typing import Any

from django.utils import timezone


@dataclass(frozen=True)
class SymbolConfig:
    base_price: float
    display_name: str
    precision: int
    volatility: float


SYMBOLS: dict[str, SymbolConfig] = {
    "BTCUSD": SymbolConfig(base_price=64250.0, display_name="Bitcoin / USD", precision=2, volatility=0.0018),
    "ETHUSD": SymbolConfig(base_price=3120.0, display_name="Ethereum / USD", precision=2, volatility=0.0021),
    "XAUUSD": SymbolConfig(base_price=2348.0, display_name="Gold / USD", precision=2, volatility=0.0009),
    "EURUSD": SymbolConfig(base_price=1.0842, display_name="Euro / USD", precision=5, volatility=0.00045),
}


class MarketSimulator:
    def __init__(self) -> None:
        self._lock = Lock()
        self._random = Random(42)
        self._state: dict[str, dict[str, Any]] = {}
        self._bootstrap()

    def _bootstrap(self) -> None:
        now = timezone.now()
        for symbol, config in SYMBOLS.items():
            candles = deque(maxlen=120)
            last_price = round(config.base_price, config.precision)

            for offset in range(60, 0, -1):
                candle_time = (now - timezone.timedelta(minutes=offset)).replace(second=0, microsecond=0)
                drift = self._random.uniform(-config.volatility, config.volatility)
                close_price = max(last_price * (1 + drift), 0.00001)
                high = max(last_price, close_price) * (1 + abs(drift) * 0.35)
                low = min(last_price, close_price) * (1 - abs(drift) * 0.35)
                candles.append(
                    {
                        "close": round(close_price, config.precision),
                        "high": round(high, config.precision),
                        "low": round(low, config.precision),
                        "open": round(last_price, config.precision),
                        "timestamp": candle_time.isoformat(),
                    }
                )
                last_price = close_price

            self._state[symbol] = {
                "candles": candles,
                "change": 0.0,
                "change_percent": 0.0,
                "display_name": config.display_name,
                "last_price": round(last_price, config.precision),
                "precision": config.precision,
                "symbol": symbol,
                "timestamp": now.isoformat(),
                "volatility": config.volatility,
            }

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return {
                "interval_seconds": 1.5,
                "instruments": [
                    {
                        "displayName": state["display_name"],
                        "lotStep": 0.01,
                        "minLot": 0.01,
                        "pricePrecision": state["precision"],
                        "quantityPrecision": 2,
                        "quoteCurrency": "USD",
                        "symbol": symbol,
                    }
                    for symbol, state in self._state.items()
                ],
                "market": [self._serialize_market(symbol, state) for symbol, state in self._state.items()],
                "type": "MARKET_SNAPSHOT",
                "history": {
                    symbol: list(state["candles"])
                    for symbol, state in self._state.items()
                },
            }

    def tick(self) -> list[dict[str, Any]]:
        with self._lock:
            updates: list[dict[str, Any]] = []
            for symbol, state in self._state.items():
                updates.append(self._update_symbol(symbol, state))
            return updates

    def _update_symbol(self, symbol: str, state: dict[str, Any]) -> dict[str, Any]:
        previous_price = float(state["last_price"])
        raw_step = self._random.uniform(-state["volatility"], state["volatility"])
        moderated_step = raw_step * (0.65 if abs(raw_step) > state["volatility"] * 0.75 else 1.0)
        next_price = max(previous_price * (1 + moderated_step), 0.00001)
        precision = int(state["precision"])
        rounded_price = round(next_price, precision)
        change = rounded_price - previous_price
        change_percent = (change / previous_price * 100) if previous_price else 0.0
        now = timezone.now()

        current_bucket = now.replace(second=0, microsecond=0).isoformat()
        candles: deque[dict[str, Any]] = state["candles"]

        if candles and candles[-1]["timestamp"] == current_bucket:
            candle = candles[-1]
            candle["close"] = round(rounded_price, precision)
            candle["high"] = round(max(float(candle["high"]), rounded_price), precision)
            candle["low"] = round(min(float(candle["low"]), rounded_price), precision)
        else:
            candles.append(
                {
                    "close": round(rounded_price, precision),
                    "high": round(max(previous_price, rounded_price), precision),
                    "low": round(min(previous_price, rounded_price), precision),
                    "open": round(previous_price, precision),
                    "timestamp": current_bucket,
                }
            )

        state["change"] = round(change, precision)
        state["change_percent"] = round(change_percent, 4)
        state["last_price"] = round(rounded_price, precision)
        state["timestamp"] = now.isoformat()

        return {
            **self._serialize_market(symbol, state),
            "candle": dict(candles[-1]),
        }

    def _serialize_market(self, symbol: str, state: dict[str, Any]) -> dict[str, Any]:
        return {
            "change": state["change"],
            "change_percent": state["change_percent"],
            "displayName": state["display_name"],
            "price": state["last_price"],
            "pricePrecision": state["precision"],
            "symbol": symbol,
            "timestamp": state["timestamp"],
        }


market_simulator = MarketSimulator()
