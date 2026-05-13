# Frontend README

## Overview

`front/` contains the Next.js realtime dashboard client.

The frontend:

- loads initial data from the backend REST API
- connects to the backend WebSocket for live updates
- keeps production URLs configurable through environment variables
- builds as a static export for Netlify

## Important Files

- [src/lib/api/client.ts](C:/Users/Kazbek/Desktop/websocket/front/src/lib/api/client.ts)
- [src/features/trading/realtime.ts](C:/Users/Kazbek/Desktop/websocket/front/src/features/trading/realtime.ts)
- [next.config.mjs](C:/Users/Kazbek/Desktop/websocket/front/next.config.mjs)
- [package.json](C:/Users/Kazbek/Desktop/websocket/front/package.json)
- [../netlify.toml](C:/Users/Kazbek/Desktop/websocket/netlify.toml)
- [.env.example](C:/Users/Kazbek/Desktop/websocket/front/.env.example)

## Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com/ws/market/
```

Local example:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000/ws/market/
```

## Commands

```bash
cd front
npm install
npm run dev
npm run build
```

## Production Notes

- Localhost fallback is used only outside production mode
- Netlify must receive both `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`
- Production WebSocket URL must use `wss://`
- Static export output is written to `front/out`

## Realtime Notes

- The client opens `/ws/market/`
- It sends `SUBSCRIBE` with channels and symbols
- It handles `HEARTBEAT` and responds with `PONG`
- It reconnects automatically if the socket closes
