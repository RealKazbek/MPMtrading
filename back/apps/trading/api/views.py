from __future__ import annotations

from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.trading.models import DashboardUser, Instrument, TradeHistory
from apps.trading.services.dashboard import build_dashboard_snapshot, serialize_closed_trade
from apps.trading.services.market import list_candles, decimal_to_str
from apps.trading.services.profile import build_profile_payload
from apps.trading.services.trades import close_trade, open_trade
from .serializers import OpenTradeSerializer


class DemoUserMixin:
    def get_demo_user(self) -> DashboardUser:
        return DashboardUser.objects.get(email=settings.DEMO_USER_EMAIL)


class DashboardSnapshotView(DemoUserMixin, APIView):
    def get(self, request):
        return Response(build_dashboard_snapshot(self.get_demo_user()))


class SimpleHealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return JsonResponse({"ok": True})


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        database_connected = False

        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            database_connected = True
        except Exception as exc:  # pragma: no cover - defensive branch for runtime environments
            return Response(
                {
                    "database": "disconnected",
                    "error": str(exc),
                    "status": "degraded",
                    "websocket": "active",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "status": "ok",
                "database": "connected" if database_connected else "disconnected",
                "websocket": "active",
            }
        )


class MarketCandlesView(APIView):
    def get(self, request, symbol: str):
        timeframe = request.query_params.get("timeframe", settings.MARKET_DEFAULT_TIMEFRAME)
        instrument = get_object_or_404(Instrument, symbol=symbol, is_active=True)
        candles = list_candles(symbol=instrument.symbol, timeframe=timeframe)
        return Response(
            {
                "candles": [
                    {
                        "close": decimal_to_str(candle.close),
                        "high": decimal_to_str(candle.high),
                        "low": decimal_to_str(candle.low),
                        "open": decimal_to_str(candle.open),
                        "timestamp": candle.bucket_start.isoformat(),
                        "volume": decimal_to_str(candle.volume),
                    }
                    for candle in candles
                ],
                "symbol": instrument.symbol,
                "timeframe": timeframe,
            }
        )


class TradeHistoryView(DemoUserMixin, APIView):
    def get(self, request):
        trades = TradeHistory.objects.select_related("instrument").filter(user=self.get_demo_user()).order_by("-closed_at")
        return Response({"trades": [serialize_closed_trade(trade) for trade in trades]})


class ProfileView(DemoUserMixin, APIView):
    def get(self, request):
        return Response(build_profile_payload(self.get_demo_user()))


class OpenTradeView(DemoUserMixin, APIView):
    def post(self, request):
        serializer = OpenTradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = open_trade(
            user=self.get_demo_user(),
            direction=serializer.validated_data["direction"],
            entry_price=serializer.validated_data.get("entryPrice"),
            lot_size=serializer.validated_data["lotSize"],
            stop_loss=serializer.validated_data.get("stopLoss"),
            symbol=serializer.validated_data["symbol"],
            take_profit=serializer.validated_data.get("takeProfit"),
        )
        return Response(payload, status=status.HTTP_201_CREATED)


class CloseTradeView(DemoUserMixin, APIView):
    def post(self, request, trade_id: str):
        payload = close_trade(user=self.get_demo_user(), trade_id=trade_id)
        return Response(payload, status=status.HTTP_200_OK)
