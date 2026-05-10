# Backend README

## Overview

`back/` contains the Django + Channels backend for the realtime dashboard.

It exposes:

- REST API for snapshot, history, profile, candles, and trades
- WebSocket endpoint at `/ws/trading`
- Neon PostgreSQL persistence
- Render-ready ASGI deployment with Daphne

## Important Files

- [config/settings.py](C:/Users/Kazbek/Desktop/websocket/back/config/settings.py)
- [config/asgi.py](C:/Users/Kazbek/Desktop/websocket/back/config/asgi.py)
- [config/urls.py](C:/Users/Kazbek/Desktop/websocket/back/config/urls.py)
- [apps/trading/realtime/routing.py](C:/Users/Kazbek/Desktop/websocket/back/apps/trading/realtime/routing.py)
- [build.sh](C:/Users/Kazbek/Desktop/websocket/back/build.sh)
- [.env.example](C:/Users/Kazbek/Desktop/websocket/back/.env.example)

## Production Notes

- Start command: `daphne -b 0.0.0.0 -p $PORT config.asgi:application`
- WhiteNoise serves collected static files
- `build.sh` installs dependencies, runs `collectstatic`, then runs `migrate`
- `DATABASE_URL` must point to Neon PostgreSQL with `sslmode=require`
- `REDIS_URL` is recommended for production WebSocket fan-out

## Backend Environment Variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require
DJANGO_SECRET_KEY=replace-me
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app
WS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
REDIS_URL=redis://default:password@host:port
ENVIRONMENT=production
MARKET_STREAM_AUTOSTART=true
LOG_LEVEL=INFO
```

## Commands

```bash
cd back
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py collectstatic --noinput
python -m daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

## Health Check

Health endpoint:

`GET /api/health`

Expected response:

```json
{
  "status": "ok",
  "database": "connected",
  "websocket": "active"
}
```

## WebSocket Notes

- Routing is defined in `apps/trading/realtime/routing.py`
- Consumer is implemented in `apps/trading/realtime/consumer.py`
- Allowed origins are controlled through `WS_ALLOWED_ORIGINS`
- Channels uses Redis when `REDIS_URL` is present, otherwise an in-memory layer
