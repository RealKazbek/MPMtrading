from __future__ import annotations

import uuid
from decimal import Decimal

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MinValueValidator
from django.db import models

from .managers import DashboardUserManager

MONEY_MAX_DIGITS = 20
MONEY_DECIMAL_PLACES = 8


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class DashboardUser(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120)
    tier = models.CharField(max_length=32, default="Professional")
    balance = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES, default=Decimal("10000.00000000"))
    total_pnl = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES, default=Decimal("0"))
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = DashboardUserManager()

    class Meta:
        db_table = "users"
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email


class Instrument(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    symbol = models.CharField(max_length=24, unique=True)
    display_name = models.CharField(max_length=120)
    quote_currency = models.CharField(max_length=8, default="USD")
    min_lot = models.DecimalField(max_digits=12, decimal_places=4)
    lot_step = models.DecimalField(max_digits=12, decimal_places=4)
    price_precision = models.PositiveSmallIntegerField(default=2)
    quantity_precision = models.PositiveSmallIntegerField(default=2)
    current_bid = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES, default=Decimal("0"))
    current_ask = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES, default=Decimal("0"))
    current_last = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES, default=Decimal("0"))
    last_tick_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "instruments"
        ordering = ["symbol"]
        indexes = [
            models.Index(fields=["symbol"], name="instrument_symbol_idx"),
            models.Index(fields=["is_active"], name="instrument_active_idx"),
        ]

    def __str__(self) -> str:
        return self.symbol


class TradingSession(TimeStampedModel):
    class SessionStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CLOSED = "CLOSED", "Closed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(DashboardUser, on_delete=models.CASCADE, related_name="trading_sessions")
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=SessionStatus.choices, default=SessionStatus.ACTIVE)
    starting_balance = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    current_equity = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)

    class Meta:
        db_table = "sessions"
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["user", "status"], name="session_user_status_idx"),
            models.Index(fields=["started_at"], name="session_started_idx"),
        ]


class ActiveTrade(TimeStampedModel):
    class Direction(models.TextChoices):
        BUY = "BUY", "Buy"
        SELL = "SELL", "Sell"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(DashboardUser, on_delete=models.CASCADE, related_name="active_trades")
    instrument = models.ForeignKey(Instrument, on_delete=models.PROTECT, related_name="active_trades")
    direction = models.CharField(max_length=4, choices=Direction.choices)
    lot_size = models.DecimalField(max_digits=12, decimal_places=4, validators=[MinValueValidator(Decimal("0.0100"))])
    entry_price = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    current_price = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    stop_loss = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    take_profit = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    opened_at = models.DateTimeField()

    class Meta:
        db_table = "active_trades"
        ordering = ["-opened_at"]
        indexes = [
            models.Index(fields=["user", "opened_at"], name="active_trade_user_idx"),
            models.Index(fields=["instrument", "opened_at"], name="active_trade_instr_idx"),
        ]


class TradeHistory(TimeStampedModel):
    class Result(models.TextChoices):
        WIN = "WIN", "Win"
        LOSS = "LOSS", "Loss"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(DashboardUser, on_delete=models.CASCADE, related_name="trade_history")
    instrument = models.ForeignKey(Instrument, on_delete=models.PROTECT, related_name="trade_history")
    direction = models.CharField(max_length=4, choices=ActiveTrade.Direction.choices)
    lot_size = models.DecimalField(max_digits=12, decimal_places=4)
    entry_price = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    exit_price = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    stop_loss = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    take_profit = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    opened_at = models.DateTimeField()
    closed_at = models.DateTimeField()
    pnl = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    pnl_percent = models.DecimalField(max_digits=12, decimal_places=4)
    result = models.CharField(max_length=8, choices=Result.choices)

    class Meta:
        db_table = "trade_history"
        ordering = ["-closed_at"]
        indexes = [
            models.Index(fields=["user", "closed_at"], name="trade_hist_user_idx"),
            models.Index(fields=["instrument", "closed_at"], name="trade_hist_instr_idx"),
        ]


class Candle(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE, related_name="candles")
    timeframe = models.CharField(max_length=12, default="1m")
    bucket_start = models.DateTimeField()
    open = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    high = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    low = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    close = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    volume = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES, default=Decimal("0"))

    class Meta:
        db_table = "candles"
        ordering = ["bucket_start"]
        constraints = [
            models.UniqueConstraint(fields=["instrument", "timeframe", "bucket_start"], name="candles_instr_tf_bucket_uniq"),
        ]
        indexes = [
            models.Index(fields=["instrument", "timeframe", "bucket_start"], name="candles_lookup_idx"),
        ]


class PriceTick(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE, related_name="price_ticks")
    sequence = models.PositiveIntegerField()
    source_timestamp = models.DateTimeField()
    bid = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    ask = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)
    last = models.DecimalField(max_digits=MONEY_MAX_DIGITS, decimal_places=MONEY_DECIMAL_PLACES)

    class Meta:
        db_table = "price_ticks"
        ordering = ["instrument__symbol", "sequence"]
        constraints = [
            models.UniqueConstraint(fields=["instrument", "sequence"], name="tick_instr_sequence_uniq"),
        ]
        indexes = [
            models.Index(fields=["instrument", "sequence"], name="tick_instr_seq_idx"),
            models.Index(fields=["source_timestamp"], name="tick_timestamp_idx"),
        ]


class WebsocketConnection(TimeStampedModel):
    class ConnectionStatus(models.TextChoices):
        CONNECTED = "CONNECTED", "Connected"
        DISCONNECTED = "DISCONNECTED", "Disconnected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(DashboardUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="websocket_connections")
    channel_name = models.CharField(max_length=255, unique=True)
    subscribed_channels = models.JSONField(default=list)
    subscribed_symbols = models.JSONField(default=list)
    connected_at = models.DateTimeField()
    disconnected_at = models.DateTimeField(null=True, blank=True)
    last_heartbeat_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=ConnectionStatus.choices, default=ConnectionStatus.CONNECTED)

    class Meta:
        db_table = "websocket_connections"
        ordering = ["-connected_at"]
        indexes = [
            models.Index(fields=["status", "connected_at"], name="ws_status_connected_idx"),
        ]


class DashboardSnapshot(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(DashboardUser, on_delete=models.CASCADE, related_name="dashboard_snapshots")
    summary = models.JSONField()
    session_stats = models.JSONField()
    quotes = models.JSONField()
    captured_at = models.DateTimeField()

    class Meta:
        db_table = "dashboard_snapshots"
        ordering = ["-captured_at"]
        indexes = [
            models.Index(fields=["user", "captured_at"], name="dash_snapshot_user_idx"),
        ]
