from __future__ import annotations

import logging
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv()
load_dotenv(BASE_DIR / ".env")
logger = logging.getLogger(__name__)


def env_flag(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(*names: str, default: str = "") -> list[str]:
    for name in names:
        value = os.getenv(name)
        if value is not None:
            return [item.strip() for item in value.split(",") if item.strip()]
    return [item.strip() for item in default.split(",") if item.strip()]

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = env_flag("DJANGO_DEBUG", env_flag("DEBUG", True))
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).strip().lower()
IS_PRODUCTION = ENVIRONMENT == "production" or not DEBUG

ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    "ALLOWED_HOSTS",
    default="127.0.0.1,localhost,.onrender.com,mpmtrading.onrender.com",
)
ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "ALLOWED_ORIGINS",
    "CORS_ORIGIN",
    default="http://localhost:3000,http://127.0.0.1:3000,https://mpmtrading.netlify.app",
)
CORS_ALLOWED_ORIGINS = ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    default=",".join(ALLOWED_ORIGINS),
)
WS_ALLOWED_ORIGINS = env_list(
    "WS_ALLOWED_ORIGINS",
    "WS_ORIGIN",
    default="http://localhost:3000,http://127.0.0.1:3000,https://mpmtrading.netlify.app",
)
CORS_ALLOW_CREDENTIALS = env_flag("CORS_ALLOW_CREDENTIALS", True)

INSTALLED_APPS = [
    "daphne",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "channels",
    "apps.trading",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "apps.trading.api.middleware.ApiRequestLoggingMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
ASGI_APPLICATION = "config.asgi.application"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
            ],
        },
    },
]

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        ),
    }
    DATABASES["default"].setdefault("OPTIONS", {})
    DATABASES["default"]["OPTIONS"].setdefault("connect_timeout", int(os.getenv("DATABASE_CONNECT_TIMEOUT", "5")))
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_USER_MODEL = "trading.DashboardUser"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
APPEND_SLASH = False

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

if IS_PRODUCTION:
    SECURE_SSL_REDIRECT = env_flag("SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env_flag("SECURE_HSTS_INCLUDE_SUBDOMAINS", True)
    SECURE_HSTS_PRELOAD = env_flag("SECURE_HSTS_PRELOAD", False)
    SECURE_REFERRER_POLICY = os.getenv("SECURE_REFERRER_POLICY", "strict-origin-when-cross-origin")
else:
    SECURE_SSL_REDIRECT = False
    SECURE_HSTS_SECONDS = 0

REDIS_URL = os.getenv("REDIS_URL", "")
if REDIS_URL:
    # Production setup: configure REDIS_URL on Render so WebSocket events fan out
    # correctly across processes and instances.
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_URL]},
        }
    }
else:
    # Local development fallback. This is fine for one ASGI process, but Redis is
    # required for production scaling and multi-instance WebSocket broadcasts.
    logger.warning("REDIS_URL is not configured. Falling back to in-memory Channels layer.")
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }

REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "apps.trading.api.exceptions.trading_exception_handler",
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
}

MARKET_STREAM_INTERVAL_MS = int(os.getenv("MARKET_STREAM_INTERVAL_MS", "1500"))
MARKET_DEFAULT_TIMEFRAME = os.getenv("MARKET_DEFAULT_TIMEFRAME", "1m")
DEMO_USER_EMAIL = os.getenv("DEMO_USER_EMAIL", "trader@realtimedesk.dev")
MARKET_STREAM_AUTOSTART = False
MARKET_STREAM_LOG_EVERY_N_TICKS = int(os.getenv("MARKET_STREAM_LOG_EVERY_N_TICKS", "20"))

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        }
    },
    "root": {
        "handlers": ["console"],
        "level": LOG_LEVEL,
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "apps.trading": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
}
