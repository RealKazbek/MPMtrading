from __future__ import annotations

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def trading_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    if isinstance(exc, ValidationError):
        message = "Validation failed."
    else:
        message = response.data.get("detail", f"Request failed with status {response.status_code}")

    response.data = {
        "code": getattr(exc, "default_code", "request_error"),
        "details": response.data,
        "message": str(message),
    }
    response.status_code = response.status_code or status.HTTP_400_BAD_REQUEST
    return response
