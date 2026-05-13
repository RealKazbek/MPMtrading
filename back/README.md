# Backend README

## Overview

`back/` contains the Django + Channels backend for the realtime dashboard.

It exposes:

- a local fake market data generator
- WebSocket endpoint at `/ws/market`
- a simple health endpoint
- ASGI startup through Django + Channels

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
- `DATABASE_URL` is optional for local development
- local development uses an in-memory Channels layer when Redis is not configured

## Backend Environment Variables

```env
DJANGO_SECRET_KEY=replace-me
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=your-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app
WS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
REDIS_URL=
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## Commands

```bash
cd back
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
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
- Fake prices are generated in `apps/trading/realtime/simulator.py`
- Local frontend should connect to `ws://127.0.0.1:8000/ws/market/`
