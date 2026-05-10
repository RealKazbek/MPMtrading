import re

PRICE_GROUP = "prices"
BALANCE_GROUP = "balance"
TRADES_GROUP = "trades"
SESSION_STATS_GROUP = "session-stats"


def symbol_group(symbol: str) -> str:
    normalized_symbol = re.sub(r"[^0-9A-Za-z_.-]", "_", symbol)
    return f"symbol.{normalized_symbol}"


SUPPORTED_CHANNELS = {
    "balance": BALANCE_GROUP,
    "candles": None,
    "prices": PRICE_GROUP,
    "sessionStats": SESSION_STATS_GROUP,
    "trades": TRADES_GROUP,
}
