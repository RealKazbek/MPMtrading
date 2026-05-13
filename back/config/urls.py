from django.urls import include, path
from apps.trading.api.views import HealthCheckView, SimpleHealthView

urlpatterns = [
    path("health/", SimpleHealthView.as_view(), name="simple-health-check"),
    path("api/health", HealthCheckView.as_view(), name="health-check"),
    path("api/", include("apps.trading.api.urls")),
]
