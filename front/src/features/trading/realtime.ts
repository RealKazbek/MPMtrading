import { WS_ENDPOINTS } from '@/src/lib/api/endpoints'
import type {
  ConnectionStatus,
  TradingServerMessage,
} from '@/src/lib/api/types'

type TradingWebSocketClientOptions = {
  onMessage: (message: TradingServerMessage) => void
  onStatusChange: (status: ConnectionStatus) => void
}

const MAX_RECONNECT_DELAY_MS = 15000

function getWsUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (explicitUrl) {
    const normalizedUrl = explicitUrl.replace(/\/$/, '')
    return normalizedUrl.endsWith(WS_ENDPOINTS.trading)
      ? normalizedUrl
      : `${normalizedUrl}${WS_ENDPOINTS.trading}`
  }

  if (process.env.NODE_ENV !== 'production') {
    return `ws://127.0.0.1:8000${WS_ENDPOINTS.trading}`
  }

  return null
}

export class TradingWebSocketClient {
  private isConnecting = false
  private isDisposed = false
  private manualClose = false
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private socket: WebSocket | null = null

  constructor(private readonly options: TradingWebSocketClientOptions) {}

  connect() {
    const url = getWsUrl()

    if (!url || typeof window === 'undefined') {
      this.options.onStatusChange('OFFLINE')
      return
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING || this.isConnecting)) {
      return
    }

    this.options.onStatusChange('CONNECTING')
    this.isConnecting = true
    this.isDisposed = false
    this.manualClose = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    const socket = new WebSocket(url)
    this.socket = socket

    socket.onopen = () => {
      if (this.socket !== socket || this.isDisposed) {
        try {
          socket.close()
        } catch {
          // Ignore stale socket cleanup.
        }
        return
      }

      this.isConnecting = false
      this.reconnectAttempts = 0
      this.options.onStatusChange('LIVE')
    }

    socket.onmessage = (event) => {
      if (this.socket !== socket || this.isDisposed) return

      try {
        const message = JSON.parse(event.data) as TradingServerMessage
        this.options.onMessage(message)
      } catch {
        // Ignore malformed frames without tearing down the current connection.
      }
    }

    socket.onerror = () => {
      if (this.socket !== socket) return

      this.isConnecting = false
      this.options.onStatusChange('OFFLINE')
    }

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null
      }

      this.isConnecting = false

      if (this.isDisposed) {
        return
      }

      this.options.onStatusChange('OFFLINE')

      if (!this.manualClose) {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, MAX_RECONNECT_DELAY_MS)
        this.reconnectAttempts += 1
        this.reconnectTimeout = setTimeout(() => this.connect(), delay)
      }
    }
  }

  disconnect() {
    this.isDisposed = true
    this.manualClose = true
    this.isConnecting = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    const socket = this.socket
    this.socket = null

    if (!socket) {
      return
    }

    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null

    if (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
      return
    }

    try {
      socket.close()
    } catch {
      // Ignore disconnect races during dev StrictMode unmount.
    }
  }
}
