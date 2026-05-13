import { create } from 'zustand'
import { TradingWebSocketClient } from '@/src/features/trading/realtime'
import type { ConnectionStatus, MarketTick, TradingServerMessage } from '@/src/lib/api/types'

export type Direction = 'BUY' | 'SELL'
export type Instrument = string

export interface CandleData {
  close: number
  high: number
  low: number
  open: number
  time: number
}

export interface Quote {
  ask: number
  bid: number
  change: number
  changePercent: number
  displayName: string
  last: number
  price: number
  pricePrecision: number
  symbol: string
  timestamp: string
}

export interface InstrumentMeta {
  displayName: string
  lotStep: number
  minLot: number
  pricePrecision: number
  quantityPrecision: number
  quoteCurrency: string
  symbol: string
}

export interface Trade {
  currentPrice: number
  direction: Direction
  entryPrice: number
  id: string
  instrument: Instrument
  lotSize: number
  openTime: string
  pnl: number
  pnlPercent: number
  stopLoss: number
  takeProfit: number
}

export interface ClosedTrade extends Trade {
  closeTime: string
  exitPrice: number
  result: 'WIN' | 'LOSS'
}

export interface Summary {
  activeTrades: number
  balance: number
  equity: number
  floatingPnl: number
  totalPnl: number
  winRate: number
}

export interface SessionStats {
  activeTrades: number
  closedTrades: number
  floatingPnl: number
  wins: number
}

export interface Profile {
  email: string
  memberSince: string
  name: string
  tier: string
}

export interface ProfileStats {
  activeTrades: number
  averageLoss: number
  averageWin: number
  balance: number
  profitFactor: string
  totalPnl: number
  totalTrades: number
  winRate: number
}

export interface Achievement {
  description: string
  earned: boolean
  id: string
  label: string
}

export interface ProfileSetting {
  label: string
  value: string
}

export interface ResourceState {
  error: null | string
  isLoading: boolean
  lastLoadedAt: null | number
}

interface TradingState {
  achievements: Achievement[]
  activeTrades: Trade[]
  candlesBySymbol: Record<string, CandleData[]>
  chartStates: Record<string, ResourceState>
  connectionStatus: ConnectionStatus
  currentPrices: Record<string, number>
  dashboardState: ResourceState
  historyState: ResourceState
  instruments: InstrumentMeta[]
  market: Quote[]
  profile: null | Profile
  profileSettings: ProfileSetting[]
  profileState: ResourceState
  profileStats: null | ProfileStats
  quotes: Record<string, Quote>
  selectedInstrument: Instrument
  sessionStats: null | SessionStats
  summary: null | Summary
  tradeActionState: ResourceState
  tradeHistory: ClosedTrade[]

  bootstrapDashboard: (options?: { silent?: boolean }) => Promise<void>
  closeTrade: (tradeId: string) => Promise<void>
  connectRealtime: () => () => void
  fetchCandles: (symbol: string, options?: { silent?: boolean }) => Promise<void>
  loadHistory: () => Promise<void>
  loadProfile: () => Promise<void>
  openTrade: (payload: {
    direction: Direction
    entryPrice?: number
    instrument: Instrument
    lotSize: number
    stopLoss?: number
    takeProfit?: number
  }) => Promise<void>
  setSelectedInstrument: (symbol: Instrument) => void
  startPolling: (symbol: string) => () => void
  subscribeSymbol: (symbol: string) => void
}

const createResourceState = (): ResourceState => ({
  error: null,
  isLoading: false,
  lastLoadedAt: null,
})

let realtimeClient: TradingWebSocketClient | null = null
let realtimeSubscribers = 0
let pendingDisconnect: ReturnType<typeof setTimeout> | null = null

function patchResourceState(current: ResourceState, patch: Partial<ResourceState>): ResourceState {
  return { ...current, ...patch }
}

function normalizeTick(tick: Omit<MarketTick, 'candle'> | MarketTick): Quote {
  const spread = tick.price < 10 ? 0.0002 : tick.price * 0.0003

  return {
    ask: tick.price + spread,
    bid: Math.max(tick.price - spread, 0),
    change: tick.change,
    changePercent: tick.change_percent,
    displayName: tick.displayName,
    last: tick.price,
    price: tick.price,
    pricePrecision: tick.pricePrecision,
    symbol: tick.symbol,
    timestamp: tick.timestamp,
  }
}

function normalizeCandle(candle: {
  close: number
  high: number
  low: number
  open: number
  timestamp: string
}): CandleData {
  return {
    close: candle.close,
    high: candle.high,
    low: candle.low,
    open: candle.open,
    time: Math.floor(new Date(candle.timestamp).getTime() / 1000),
  }
}

export const useTradingStore = create<TradingState>()((set, get) => ({
  achievements: [],
  activeTrades: [],
  candlesBySymbol: {},
  chartStates: {},
  connectionStatus: 'OFFLINE',
  currentPrices: {},
  dashboardState: patchResourceState(createResourceState(), { isLoading: true }),
  historyState: createResourceState(),
  instruments: [],
  market: [],
  profile: null,
  profileSettings: [],
  profileState: createResourceState(),
  profileStats: null,
  quotes: {},
  selectedInstrument: '',
  sessionStats: null,
  summary: null,
  tradeActionState: createResourceState(),
  tradeHistory: [],

  bootstrapDashboard: async () => {
    set((state) => ({
      dashboardState: patchResourceState(state.dashboardState, {
        error: null,
        isLoading: true,
      }),
    }))
  },

  loadHistory: async () => {
    set((state) => ({
      historyState: patchResourceState(state.historyState, {
        error: null,
        isLoading: false,
        lastLoadedAt: Date.now(),
      }),
      tradeHistory: [],
    }))
  },

  loadProfile: async () => {
    set((state) => ({
      achievements: [],
      profile: {
        email: 'demo@terminal.local',
        memberSince: new Date().toISOString().slice(0, 10),
        name: 'Демо-профиль',
        tier: 'Учебный режим',
      },
      profileSettings: [
        { label: 'Источник данных', value: 'Локальный генератор' },
        { label: 'Транспорт', value: 'WebSocket / Channels' },
      ],
      profileState: patchResourceState(state.profileState, {
        error: null,
        isLoading: false,
        lastLoadedAt: Date.now(),
      }),
      profileStats: {
        activeTrades: 0,
        averageLoss: 0,
        averageWin: 0,
        balance: 0,
        profitFactor: '0.00',
        totalPnl: 0,
        totalTrades: 0,
        winRate: 0,
      },
    }))
  },

  fetchCandles: async () => undefined,

  openTrade: async () => undefined,

  closeTrade: async () => undefined,

  subscribeSymbol: () => undefined,

  setSelectedInstrument: (symbol) => {
    set({ selectedInstrument: symbol })
  },

  connectRealtime: () => {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    realtimeSubscribers += 1

    if (pendingDisconnect) {
      clearTimeout(pendingDisconnect)
      pendingDisconnect = null
    }

    if (!realtimeClient) {
      realtimeClient = new TradingWebSocketClient({
        onMessage: (message: TradingServerMessage) => {
          if (message.type === 'MARKET_SNAPSHOT') {
            const market = message.market.map(normalizeTick)
            const selectedInstrument = get().selectedInstrument || market[0]?.symbol || ''

            set((state) => ({
              candlesBySymbol: Object.fromEntries(
                Object.entries(message.history).map(([symbol, candles]) => [
                  symbol,
                  candles.map(normalizeCandle),
                ])
              ),
              chartStates: Object.fromEntries(
                message.instruments.map((instrument) => [
                  instrument.symbol,
                  patchResourceState(state.chartStates[instrument.symbol] ?? createResourceState(), {
                    error: null,
                    isLoading: false,
                    lastLoadedAt: Date.now(),
                  }),
                ])
              ),
              currentPrices: Object.fromEntries(market.map((item) => [item.symbol, item.price])),
              dashboardState: patchResourceState(state.dashboardState, {
                error: null,
                isLoading: false,
                lastLoadedAt: Date.now(),
              }),
              instruments: message.instruments,
              market,
              quotes: Object.fromEntries(market.map((item) => [item.symbol, item])),
              selectedInstrument,
            }))
            return
          }

          if (message.type === 'MARKET_BATCH') {
            set((state) => {
              const nextQuotes = { ...state.quotes }
              const nextPrices = { ...state.currentPrices }
              const nextCandles = { ...state.candlesBySymbol }

              for (const update of message.updates) {
                const quote = normalizeTick(update)
                nextQuotes[quote.symbol] = quote
                nextPrices[quote.symbol] = quote.price

                const normalizedCandle = normalizeCandle(update.candle)
                const currentSeries = nextCandles[quote.symbol] ?? []
                const lastCandle = currentSeries[currentSeries.length - 1]

                nextCandles[quote.symbol] =
                  lastCandle && lastCandle.time === normalizedCandle.time
                    ? [...currentSeries.slice(0, -1), normalizedCandle]
                    : [...currentSeries, normalizedCandle].slice(-120)
              }

              return {
                candlesBySymbol: nextCandles,
                currentPrices: nextPrices,
                market: Object.values(nextQuotes).sort((left, right) => left.symbol.localeCompare(right.symbol)),
                quotes: nextQuotes,
              }
            })
          }
        },
        onStatusChange: (status) => {
          set({ connectionStatus: status })
        },
      })
    }

    realtimeClient.connect()

    return () => {
      realtimeSubscribers = Math.max(0, realtimeSubscribers - 1)

      if (pendingDisconnect) {
        clearTimeout(pendingDisconnect)
      }

      pendingDisconnect = setTimeout(() => {
        if (realtimeSubscribers > 0) {
          return
        }

        realtimeClient?.disconnect()
        realtimeClient = null
        set({ connectionStatus: 'OFFLINE' })
      }, 150)
    }
  },

  startPolling: () => () => undefined,
}))
