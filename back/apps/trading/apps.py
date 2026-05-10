from django.apps import AppConfig


class TradingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.trading"
    label = "trading"
    verbose_name = "Realtime Trading"

    def ready(self):
        from apps.trading.realtime.market_stream import maybe_start_market_stream

        maybe_start_market_stream()
