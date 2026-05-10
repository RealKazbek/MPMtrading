from __future__ import annotations

from django.core.management.base import BaseCommand

from apps.trading.realtime.market_stream import run_market_stream_loop


class Command(BaseCommand):
    help = "Replay persisted price_ticks into the live instrument state and broadcast updates over WebSocket."

    def handle(self, *args, **options):
        run_market_stream_loop()
