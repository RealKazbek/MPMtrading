import { WS_ENDPOINTS } from '@/src/lib/api/endpoints'
import type {
  ConnectionStatus,
  TradingClientMessage,
  TradingServerMessage,
} from '@/src/lib/api/types'

type TradingWebSocketClientOptions = {
  onMessage: (message: TradingServerMessage) => void
  onStatusChange: (status: ConnectionStatus) => void
}

const HEARTBEAT_INTERVAL_MS = 20000
const MAX_RECONNECT_DELAY_MS = 15000

function getWsUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (explicitUrl) {
    const normalizedUrl = explicitUrl.replace(/\/$/, '')
    return normalizedUrl.endsWith(WS_ENDPOINTS.trading)
      ? normalizedUrl
      : `${normalizedUrl}${WS_ENDPOINTS.trading}`
  }

  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `ws://127.0.0.1:8000${WS_ENDPOINTS.trading}`
  }

  return null
}

export class TradingWebSocketClient {
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private manualClose = false
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private socket: WebSocket | null = null
  private subscribedSymbols = new Set<string>()

  constructor(private readonly options: TradingWebSocketClientOptions) {}

  connect() {
    const url = getWsUrl()

    if (!url || typeof window === 'undefined') {
      this.options.onStatusChange('OFFLINE')
      return
    }

    this.options.onStatusChange('CONNECTING')
    this.manualClose = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.socket = new WebSocket(url)

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.options.onStatusChange('LIVE')
      this.flushSubscriptions()
      this.startHeartbeat()
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as TradingServerMessage

        if (message.type === 'HEARTBEAT') {
          this.send({
            timestamp: new Date().toISOString(),
            type: 'PONG',
          })
          return
        }

        this.options.onMessage(message)
      } catch {
        // Ignore malformed frames without tearing down the current connection.
      }
    }

    this.socket.onerror = () => {
      this.options.onStatusChange('OFFLINE')
    }

    this.socket.onclose = () => {
      this.stopHeartbeat()
      this.options.onStatusChange('OFFLINE')

      if (!this.manualClose) {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, MAX_RECONNECT_DELAY_MS)
        this.reconnectAttempts += 1
        this.reconnectTimeout = setTimeout(() => this.connect(), delay)
      }
    }
  }

  disconnect() {
    this.manualClose = true
    this.stopHeartbeat()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.socket?.close()
    this.socket = null
  }

  subscribe(symbols: string[]) {
    this.subscribedSymbols = new Set(symbols)
    this.flushSubscriptions()
  }

  private flushSubscriptions() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    this.send({
      channels: ['balance', 'prices', 'candles', 'trades', 'sessionStats'],
      symbols: Array.from(this.subscribedSymbols),
      type: 'SUBSCRIBE',
    })
  }

  private send(message: TradingClientMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(JSON.stringify(message))
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      this.send({
        timestamp: new Date().toISOString(),
        type: 'PONG',
      })
    }, HEARTBEAT_INTERVAL_MS)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}
