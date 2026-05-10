from django.urls import path

from .views import (
    CloseTradeView,
    DashboardSnapshotView,
    HealthCheckView,
    MarketCandlesView,
    OpenTradeView,
    ProfileView,
    TradeHistoryView,
)

urlpatterns = [
    path("health", HealthCheckView.as_view(), name="health"),
    path("dashboard/snapshot", DashboardSnapshotView.as_view(), name="dashboard-snapshot"),
    path("markets/<str:symbol>/candles", MarketCandlesView.as_view(), name="market-candles"),
    path("trades/history", TradeHistoryView.as_view(), name="trade-history"),
    path("profile", ProfileView.as_view(), name="profile"),
    path("trades", OpenTradeView.as_view(), name="open-trade"),
    path("trades/<uuid:trade_id>/close", CloseTradeView.as_view(), name="close-trade"),
]
