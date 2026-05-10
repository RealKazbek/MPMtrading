from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from django.db import migrations


def seed_demo_data(apps, schema_editor):
    DashboardUser = apps.get_model("trading", "DashboardUser")
    Instrument = apps.get_model("trading", "Instrument")
    TradingSession = apps.get_model("trading", "TradingSession")
    TradeHistory = apps.get_model("trading", "TradeHistory")
    ActiveTrade = apps.get_model("trading", "ActiveTrade")
    Candle = apps.get_model("trading", "Candle")
    PriceTick = apps.get_model("trading", "PriceTick")

    user, created = DashboardUser.objects.get_or_create(
        email="trader@realtimedesk.dev",
        defaults={
            "id": uuid.uuid4(),
            "name": "Realtime Demo Trader",
            "tier": "Professional",
            "balance": Decimal("12684.42000000"),
            "total_pnl": Decimal("2684.42000000"),
            "is_active": True,
        },
    )
    if created:
        user.password = "!"
        user.save(update_fields=["password"])

    instrument_specs = [
        {
            "symbol": "BTCUSD",
            "display_name": "Bitcoin / US Dollar",
            "price_precision": 2,
            "quantity_precision": 4,
            "min_lot": Decimal("0.0100"),
            "lot_step": Decimal("0.0100"),
            "quote_currency": "USD",
            "closes": [
                Decimal("64250.20"),
                Decimal("64282.40"),
                Decimal("64310.80"),
                Decimal("64295.50"),
                Decimal("64340.10"),
                Decimal("64370.45"),
                Decimal("64405.25"),
                Decimal("64388.10"),
                Decimal("64442.85"),
                Decimal("64496.60"),
                Decimal("64518.30"),
                Decimal("64542.90"),
            ],
        },
        {
            "symbol": "ETHUSD",
            "display_name": "Ethereum / US Dollar",
            "price_precision": 2,
            "quantity_precision": 4,
            "min_lot": Decimal("0.0100"),
            "lot_step": Decimal("0.0100"),
            "quote_currency": "USD",
            "closes": [
                Decimal("3122.45"),
                Decimal("3124.85"),
                Decimal("3127.10"),
                Decimal("3125.90"),
                Decimal("3129.25"),
                Decimal("3131.60"),
                Decimal("3134.15"),
                Decimal("3133.40"),
                Decimal("3136.75"),
                Decimal("3139.20"),
                Decimal("3141.85"),
                Decimal("3144.50"),
            ],
        },
        {
            "symbol": "XAUUSD",
            "display_name": "Gold Spot / US Dollar",
            "price_precision": 2,
            "quantity_precision": 2,
            "min_lot": Decimal("0.0100"),
            "lot_step": Decimal("0.0100"),
            "quote_currency": "USD",
            "closes": [
                Decimal("2341.10"),
                Decimal("2341.95"),
                Decimal("2342.40"),
                Decimal("2342.05"),
                Decimal("2342.85"),
                Decimal("2343.20"),
                Decimal("2343.90"),
                Decimal("2344.15"),
                Decimal("2344.75"),
                Decimal("2345.05"),
                Decimal("2345.40"),
                Decimal("2345.95"),
            ],
        },
    ]

    base_time = datetime(2026, 5, 10, 10, 0, tzinfo=timezone.utc)
    instruments_by_symbol = {}

    for spec in instrument_specs:
        closes = spec.pop("closes")
        final_last = closes[-1]
        instrument, _ = Instrument.objects.get_or_create(
            symbol=spec["symbol"],
            defaults={
                **spec,
                "current_bid": final_last - Decimal("0.20"),
                "current_ask": final_last + Decimal("0.20"),
                "current_last": final_last,
                "last_tick_at": base_time + timedelta(minutes=len(closes) - 1),
                "is_active": True,
            },
        )
        instruments_by_symbol[instrument.symbol] = instrument

        if Candle.objects.filter(instrument=instrument).exists():
            continue

        previous_close = closes[0] - Decimal("1.20")
        for sequence, close in enumerate(closes, start=1):
            bucket_start = base_time + timedelta(minutes=sequence - 1)
            open_price = previous_close
            high = max(open_price, close) + Decimal("0.85")
            low = min(open_price, close) - Decimal("0.80")

            Candle.objects.create(
                instrument=instrument,
                timeframe="1m",
                bucket_start=bucket_start,
                open=open_price,
                high=high,
                low=low,
                close=close,
                volume=Decimal("125.50") + Decimal(sequence),
            )
            PriceTick.objects.create(
                instrument=instrument,
                sequence=sequence,
                source_timestamp=bucket_start,
                bid=close - Decimal("0.20"),
                ask=close + Decimal("0.20"),
                last=close,
            )
            previous_close = close

    TradingSession.objects.get_or_create(
        user=user,
        status="ACTIVE",
        defaults={
            "started_at": base_time + timedelta(hours=1),
            "starting_balance": Decimal("10000.00000000"),
            "current_equity": Decimal("12684.42000000"),
        },
    )

    if not TradeHistory.objects.filter(user=user).exists():
        closed_trade_specs = [
            {
                "symbol": "BTCUSD",
                "direction": "BUY",
                "lot_size": Decimal("0.1500"),
                "entry_price": Decimal("63850.00"),
                "exit_price": Decimal("64110.50"),
                "stop_loss": Decimal("63690.00"),
                "take_profit": Decimal("64150.00"),
                "opened_at": base_time - timedelta(hours=6),
                "closed_at": base_time - timedelta(hours=5, minutes=40),
                "pnl": Decimal("39.07500000"),
                "pnl_percent": Decimal("2.7210"),
                "result": "WIN",
            },
            {
                "symbol": "ETHUSD",
                "direction": "SELL",
                "lot_size": Decimal("1.2000"),
                "entry_price": Decimal("3148.20"),
                "exit_price": Decimal("3128.10"),
                "stop_loss": Decimal("3160.00"),
                "take_profit": Decimal("3125.00"),
                "opened_at": base_time - timedelta(hours=5),
                "closed_at": base_time - timedelta(hours=4, minutes=25),
                "pnl": Decimal("24.12000000"),
                "pnl_percent": Decimal("0.6383"),
                "result": "WIN",
            },
            {
                "symbol": "XAUUSD",
                "direction": "BUY",
                "lot_size": Decimal("0.8000"),
                "entry_price": Decimal("2346.50"),
                "exit_price": Decimal("2342.80"),
                "stop_loss": Decimal("2341.00"),
                "take_profit": Decimal("2350.00"),
                "opened_at": base_time - timedelta(hours=3),
                "closed_at": base_time - timedelta(hours=2, minutes=38),
                "pnl": Decimal("-2.96000000"),
                "pnl_percent": Decimal("-0.1972"),
                "result": "LOSS",
            },
            {
                "symbol": "BTCUSD",
                "direction": "BUY",
                "lot_size": Decimal("0.1000"),
                "entry_price": Decimal("64310.80"),
                "exit_price": Decimal("64518.30"),
                "stop_loss": Decimal("64190.00"),
                "take_profit": Decimal("64520.00"),
                "opened_at": base_time - timedelta(hours=2),
                "closed_at": base_time - timedelta(hours=1, minutes=22),
                "pnl": Decimal("20.75000000"),
                "pnl_percent": Decimal("3.2265"),
                "result": "WIN",
            },
        ]

        for trade_spec in closed_trade_specs:
            symbol = trade_spec.pop("symbol")
            TradeHistory.objects.create(
                user=user,
                instrument=instruments_by_symbol[symbol],
                **trade_spec,
            )

    ActiveTrade.objects.get_or_create(
        id=uuid.UUID("e8f10fe2-4728-4f51-b7f6-f6a2114a65d1"),
        defaults={
            "user": user,
            "instrument": instruments_by_symbol["ETHUSD"],
            "direction": "BUY",
            "lot_size": Decimal("1.5000"),
            "entry_price": Decimal("3131.60"),
            "current_price": Decimal("3144.50"),
            "stop_loss": Decimal("3118.00"),
            "take_profit": Decimal("3158.00"),
            "opened_at": base_time - timedelta(minutes=22),
        },
    )


def unseed_demo_data(apps, schema_editor):
    DashboardUser = apps.get_model("trading", "DashboardUser")
    DashboardUser.objects.filter(email="trader@realtimedesk.dev").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("trading", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_demo_data, unseed_demo_data),
    ]
