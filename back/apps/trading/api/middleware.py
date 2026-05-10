from __future__ import annotations

import logging
import time

logger = logging.getLogger(__name__)


class ApiRequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started_at = time.perf_counter()
        response = self.get_response(request)

        if request.path.startswith("/api/"):
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.info(
                "API %s %s -> %s (%sms)",
                request.method,
                request.path,
                response.status_code,
                duration_ms,
            )

        return response
