from __future__ import annotations

from decimal import Decimal

from rest_framework import serializers

from apps.trading.models import ActiveTrade


class OpenTradeSerializer(serializers.Serializer):
    direction = serializers.ChoiceField(choices=ActiveTrade.Direction.values)
    entryPrice = serializers.DecimalField(decimal_places=8, max_digits=20, required=False)
    lotSize = serializers.DecimalField(decimal_places=4, max_digits=12)
    stopLoss = serializers.DecimalField(decimal_places=8, max_digits=20, required=False)
    symbol = serializers.CharField(max_length=24)
    takeProfit = serializers.DecimalField(decimal_places=8, max_digits=20, required=False)

    def validate_lotSize(self, value: Decimal):
        if value <= Decimal("0"):
            raise serializers.ValidationError("lotSize must be positive.")
        return value
