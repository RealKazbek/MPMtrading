# Presentation Outline

## 1. Problem

- Traditional dashboards often require manual refresh or frequent polling.
- Constant HTTP refresh increases latency and wastes network resources.
- Trading dashboards need live quotes, live trades, and instant balance updates.

## 2. Solution

- Build a hybrid REST + WebSocket realtime dashboard backend.
- Use REST for initial page bootstrap.
- Use WebSocket for live incremental updates.
- Persist all core data in PostgreSQL.

## 3. Architecture

- Next.js frontend
- Django REST API
- Django Channels WebSocket server
- PostgreSQL database
- optional Redis channel layer
- market replay worker

## 4. WebSocket Demonstration

- connect to `WS /ws/trading`
- subscribe to symbols
- receive `PRICE_TICK` and `CANDLE_UPDATE`
- show heartbeat and reconnect behavior

## 5. Realtime Updates Demonstration

- initial REST snapshot load
- open a trade through REST
- receive `TRADE_STATUS_UPDATE`
- see `BALANCE_UPDATE` and `SESSION_STATS_UPDATE`
- switch symbols and observe efficient subscription flow

## 6. Technology Stack

- Next.js
- TypeScript
- Zustand
- Django
- Django REST Framework
- Django Channels
- PostgreSQL
- Redis

## 7. Conclusion

- WebSocket reduces the need for repeated HTTP refreshes.
- Hybrid architecture gives both stability and realtime capability.
- PostgreSQL provides persistent, production-like storage.
- The project demonstrates a clean client-server realtime dashboard design.
