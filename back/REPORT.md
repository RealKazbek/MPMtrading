# Report - Realtime Dashboard Project

## 1. Introduction

This project implements a realtime trading dashboard backend for the course **WebSockets Protocol Explained - Master Web Development**. The system demonstrates how a modern web application can combine REST APIs with WebSocket communication to deliver low-latency dashboard updates without repeated page refreshes.

## 2. Project Goal

The goal of the project is to build a backend that:

- loads initial state through REST
- streams live market and trading events through WebSocket
- persists domain data in PostgreSQL
- supports multiple realtime clients
- follows clean backend architecture practices

## 3. System Architecture

The system uses a hybrid architecture:

- Next.js frontend for the dashboard UI
- Django REST Framework for HTTP API endpoints
- Django Channels for WebSocket communication
- PostgreSQL as the persistent data store
- optional Redis as a production-ready channel layer
- a separate market stream replay service for live price propagation

Core backend layers:

- API layer
- service layer
- realtime transport layer
- persistence layer

## 4. REST API

Implemented endpoints:

- `GET /api/dashboard/snapshot`
- `GET /api/markets/:symbol/candles`
- `GET /api/trades/history`
- `GET /api/profile`
- `POST /api/trades`
- `POST /api/trades/:tradeId/close`

REST is responsible for:

- initial page data bootstrap
- chart history loading
- profile and account information
- trade open and close mutations

## 5. WebSocket Architecture

WebSocket endpoint:

- `WS /ws/trading`

Supported capabilities:

- multiple concurrent clients
- reconnect support on the frontend
- heartbeat and pong cycle
- logical channel subscriptions
- symbol-based subscriptions
- graceful disconnect persistence
- typed JSON events

Main server events:

- `PRICE_TICK`
- `CANDLE_UPDATE`
- `BALANCE_UPDATE`
- `TRADE_STATUS_UPDATE`
- `SESSION_STATS_UPDATE`

## 6. Database Structure

Main tables:

- `users`
- `instruments`
- `active_trades`
- `trade_history`
- `candles`
- `price_ticks`
- `sessions`
- `websocket_connections`
- `dashboard_snapshots`

Design decisions:

- UUID primary keys
- decimal fields for money
- UTC timestamps
- indexes for symbol, timestamp, user, and status lookup
- persistent seeded demo dataset stored through migrations

## 7. Realtime Data Flow

1. Frontend calls REST endpoints for initial state.
2. Frontend opens `WS /ws/trading`.
3. Client subscribes to channels and symbols.
4. Market replay service reads persisted `price_ticks`.
5. Backend updates live instrument prices and trade state.
6. Backend broadcasts typed WebSocket events to subscribed clients.
7. Frontend merges those updates into local state with minimal rerenders.
8. If WebSocket becomes unavailable, frontend uses polling fallback.

## 8. Screenshots

Add the following screenshots before submission:

- live dashboard overview
- active trade open/close flow
- websocket connection in browser devtools
- chart updates in realtime
- profile and history pages

## 9. Conclusion

The project demonstrates a realistic foundation for a realtime fintech dashboard. Instead of using mock in-memory data, it relies on PostgreSQL persistence, typed REST and WebSocket contracts, subscription-based live updates, and a modular backend structure. This makes the project suitable for explaining WebSocket protocol usage, hybrid application architecture, and production-oriented realtime system design.
