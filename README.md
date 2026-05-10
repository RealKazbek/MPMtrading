# Realtime Dashboard

Production-ready university project with a hybrid REST + WebSocket architecture.

## Stack

- Frontend: Next.js 14, React 18, TypeScript, Zustand, Tailwind CSS
- Backend: Django 6, Django REST Framework, Django Channels, Daphne
- Database: Neon PostgreSQL
- Realtime: WebSocket with heartbeat, reconnect, and subscription channels
- Deploy: Render for backend, Netlify for frontend

## Architecture

1. Frontend loads initial screen data through REST.
2. Frontend opens `WS /ws/trading`.
3. Client sends `SUBSCRIBE` with channels and symbols.
4. Django Channels broadcasts realtime events through the ASGI app.
5. PostgreSQL stores persistent trading, profile, market, and connection data.
6. Redis can be attached in production for multi-process WebSocket fan-out.

## Repository Structure

```text
websocket/
  back/                  Django backend
    build.sh             Render build script
    .env.example         Backend env template
  front/                 Next.js frontend
    .env.example         Frontend env template
  render.yaml            Render blueprint example
  netlify.toml           Netlify build configuration
  DEPLOYMENT_GUIDE.txt   Step-by-step deploy guide
```

## Backend Run

```bash
cd back
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py check
python manage.py collectstatic --noinput
python -m daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Optional market stream command:

```bash
cd back
python manage.py run_market_stream
```

## Frontend Run

```bash
cd front
npm install
copy .env.example .env.local
npm run dev
```

## Required Environment Variables

### Backend

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require
DJANGO_SECRET_KEY=replace-me
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app
REDIS_URL=redis://default:password@host:port
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com/ws/trading
```

## Deployment

- Backend Render entrypoint: `daphne -b 0.0.0.0 -p $PORT config.asgi:application`
- Backend build script: [back/build.sh](C:/Users/Kazbek/Desktop/websocket/back/build.sh)
- Frontend Netlify config: [netlify.toml](C:/Users/Kazbek/Desktop/websocket/netlify.toml)
- Full deployment guide: [DEPLOYMENT_GUIDE.txt](C:/Users/Kazbek/Desktop/websocket/DEPLOYMENT_GUIDE.txt)

## Realtime Flow

- REST bootstrap endpoints:
  - `GET /api/dashboard/snapshot`
  - `GET /api/profile`
  - `GET /api/trades/history`
  - `GET /api/markets/:symbol/candles`
- WebSocket endpoint:
  - `WS /ws/trading`
- Client messages:
  - `SUBSCRIBE`
  - `UNSUBSCRIBE`
  - `PONG`
- Server messages:
  - `PRICE_TICK`
  - `CANDLE_UPDATE`
  - `BALANCE_UPDATE`
  - `TRADE_STATUS_UPDATE`
  - `SESSION_STATS_UPDATE`
  - `HEARTBEAT`

## Production Verification

1. Open backend health URL: `/api/health`
2. Open deployed frontend on Netlify
3. Confirm Network tab uses Render URL, not localhost
4. Confirm WebSocket status `101 Switching Protocols`
5. Confirm live frames arrive in DevTools
