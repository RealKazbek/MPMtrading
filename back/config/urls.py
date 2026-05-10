from django.urls import include, path
from apps.trading.api.views import HealthCheckView

urlpatterns = [
    path("api/health", HealthCheckView.as_view(), name="health-check"),
    path("api/", include("apps.trading.api.urls")),
]
