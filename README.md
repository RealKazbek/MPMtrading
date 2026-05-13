# MPM Trading Dashboard

Учебный realtime dashboard, в котором Django backend генерирует тестовые рыночные котировки и отправляет их на frontend через WebSocket. Интерфейс обновляется в реальном времени без перезагрузки страницы.

## Технологии

- Frontend: Next.js 14, React 18, TypeScript, Zustand, Tailwind CSS
- Backend: Django 6, Django REST Framework, Django Channels, Daphne
- Realtime: WebSocket over ASGI
- Deploy: Netlify для frontend, Render для backend

## Структура проекта

- [back](C:/Users/Kazbek/Desktop/websocket/back) - Django backend
- [front](C:/Users/Kazbek/Desktop/websocket/front) - Next.js frontend
- [render.yaml](C:/Users/Kazbek/Desktop/websocket/render.yaml) - пример конфигурации Render
- [netlify.toml](C:/Users/Kazbek/Desktop/websocket/netlify.toml) - конфигурация Netlify

## Локальный запуск backend

```bash
cd back
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py check
python manage.py runserver
```

Локально backend работает без Redis. Для Channels используется `InMemoryChannelLayer`, поэтому `python manage.py runserver` остается рабочим вариантом для разработки.

## Локальный запуск frontend

```bash
cd front
npm install
copy .env.example .env.local
npm run dev
```

Локальный WebSocket endpoint:

```text
ws://127.0.0.1:8000/ws/market/
```

## Переменные окружения

### Backend

См. шаблон: [back/.env.example](C:/Users/Kazbek/Desktop/websocket/back/.env.example)

Ключевые переменные:

```env
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=false
ENVIRONMENT=production
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,.onrender.com,mpmtrading.onrender.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://mpmtrading.netlify.app
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://mpmtrading.netlify.app
WS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://mpmtrading.netlify.app
DATABASE_URL=postgresql://...
REDIS_URL=
```

### Frontend

См. шаблон: [front/.env.example](C:/Users/Kazbek/Desktop/websocket/front/.env.example)

```env
NEXT_PUBLIC_API_URL=https://mpmtrading.onrender.com
NEXT_PUBLIC_WS_URL=wss://mpmtrading.onrender.com/ws/market/
```

В production frontend должен использовать:

```text
wss://mpmtrading.onrender.com/ws/market/
```

Если `NEXT_PUBLIC_WS_URL` не задан, в development используется fallback:

```text
ws://127.0.0.1:8000/ws/market/
```

## Деплой backend на Render

1. Создать Web Service из папки `back`.
2. Указать build command: `bash build.sh`
3. Указать start command:

```bash
daphne -b 0.0.0.0 -p $PORT config.asgi:application
```

4. Добавить переменные окружения из `back/.env.example`
5. Установить production secret key и database URL через Render environment variables
6. При необходимости подключить Redis для fan-out между несколькими процессами

Публичный адрес backend:

```text
https://mpmtrading.onrender.com
```

## Деплой frontend на Netlify

Проект настроен как static export Next.js, поэтому отдельный Next.js runtime plugin не требуется.

1. Подключить репозиторий в Netlify
2. Base directory: `front`
3. Build command: `npm run build`
4. Publish directory: `out`
5. Добавить переменные:

```env
NEXT_PUBLIC_API_URL=https://mpmtrading.onrender.com
NEXT_PUBLIC_WS_URL=wss://mpmtrading.onrender.com/ws/market/
```

Публичный адрес frontend:

```text
https://mpmtrading.netlify.app
```

## WebSocket endpoint

```text
/ws/market/
```

Локально:

```text
ws://127.0.0.1:8000/ws/market/
```

В production:

```text
wss://mpmtrading.onrender.com/ws/market/
```

## Проверка WebSocket в DevTools

1. Открыть frontend в браузере
2. Открыть `DevTools -> Network`
3. Выбрать фильтр `WS`
4. Открыть соединение `/ws/market/`
5. Проверить статус `101 Switching Protocols`
6. Убедиться, что во Frames приходят сообщения `MARKET_SNAPSHOT`, `MARKET_BATCH` и `HEARTBEAT`

## Build checks

Backend:

```bash
cd back
python manage.py check
```

Frontend:

```bash
cd front
npm run build
```

## Соответствие требованиям задания

- Сервер отправляет обновления каждые N секунд
- Клиент получает данные через WebSocket
- Dashboard обновляется без перезагрузки страницы
- Внешний market API не требуется, данные генерируются локально
