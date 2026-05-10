from __future__ import annotations

import atexit
import logging
import os
import signal
import sys
import threading
import time

from django.conf import settings
from django.db import close_old_connections

from apps.trading.services.market import get_replay_sequences, iter_symbols, stream_next_tick

logger = logging.getLogger(__name__)

_stream_thread: threading.Thread | None = None
_stop_event = threading.Event()
_hooks_registered = False


def _install_shutdown_hooks() -> None:
    global _hooks_registered
    if _hooks_registered:
        return

    def _stop(*_args):
        stop_market_stream()

    for signame in ("SIGINT", "SIGTERM"):
        signum = getattr(signal, signame, None)
        if signum is not None:
            signal.signal(signum, _stop)

    atexit.register(stop_market_stream)
    _hooks_registered = True


def run_market_stream_loop() -> None:
    interval_seconds = settings.MARKET_STREAM_INTERVAL_MS / 1000
    sequences = {symbol: 1 for symbol in iter_symbols()}
    ticks_processed = 0

    logger.info("Starting market stream replay loop.")

    while not _stop_event.is_set():
        close_old_connections()
        max_sequences = get_replay_sequences()

        for symbol in iter_symbols():
            if _stop_event.is_set():
                break

            max_sequence = max_sequences.get(symbol, 0)
            if max_sequence == 0:
                continue

            current_sequence = sequences.setdefault(symbol, 1)
            if not stream_next_tick(symbol, current_sequence):
                sequences[symbol] = 1
                continue

            ticks_processed += 1
            if ticks_processed % settings.MARKET_STREAM_LOG_EVERY_N_TICKS == 0:
                logger.info("Market stream replayed %s ticks.", ticks_processed)

            sequences[symbol] = current_sequence + 1
            if sequences[symbol] > max_sequence:
                sequences[symbol] = 1

        _stop_event.wait(interval_seconds)

    logger.info("Market stream replay loop stopped.")


def maybe_start_market_stream() -> None:
    global _stream_thread

    if not settings.MARKET_STREAM_AUTOSTART:
        return

    management_command = sys.argv[1] if len(sys.argv) > 1 else ""
    if management_command in {"check", "collectstatic", "createsuperuser", "makemigrations", "migrate", "shell", "test"}:
        return

    if os.environ.get("RUN_MAIN") == "true":
        return

    if _stream_thread and _stream_thread.is_alive():
        return

    _stop_event.clear()
    _install_shutdown_hooks()
    _stream_thread = threading.Thread(
        target=run_market_stream_loop,
        daemon=True,
        name="market-stream",
    )
    _stream_thread.start()
    logger.info("Market stream autostart enabled.")


def stop_market_stream() -> None:
    global _stream_thread

    _stop_event.set()
    if _stream_thread and _stream_thread.is_alive():
        _stream_thread.join(timeout=5)
    _stream_thread = None
