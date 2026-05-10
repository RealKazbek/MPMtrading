import { create } from 'zustand'
import { createTrade, closeTrade as closeTradeRequest, getCandles, getDashboardSnapshot, getProfile, getTradeHistory } from '@/src/features/trading/api'
import {
  normalizeAchievement,
  normalizeCandle,
  normalizeClosedTrade,
  normalizeInstrument,
  normalizeProfile,
  normalizeProfileSetting,
  normalizeProfileStats,
  normalizeQuote,
  normalizeSessionStats,
  normalizeSummary,
  normalizeTrade,
} from '@/src/features/trading/normalizers'
import { TradingWebSocketClient } from '@/src/features/trading/realtime'
import type {
  ConnectionStatus,
  TradingServerMessage,
} from '@/src/lib/api/types'

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
  last: number
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
  profile: null | Profile
  profileSettings: ProfileSetting[]
  profileState: ResourceState
  profileStats: null | ProfileStats
  quotes: Record<string, Quote>
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
  startPolling: (symbol: string) => () => void
  subscribeSymbol: (symbol: string) => void
}

const createResourceState = (): ResourceState => ({
  error: null,
  isLoading: false,
  lastLoadedAt: null,
})

let realtimeClient: TradingWebSocketClient | null = null
let pollingTimer: ReturnType<typeof setInterval> | null = null

function patchResourceState(current: ResourceState, patch: Partial<ResourceState>): ResourceState {
  return { ...current, ...patch }
}

export const useTradingStore = create<TradingState>()((set, get) => ({
  achievements: [],
  activeTrades: [],
  candlesBySymbol: {},
  chartStates: {},
  connectionStatus: 'OFFLINE',
  currentPrices: {},
  dashboardState: createResourceState(),
  historyState: createResourceState(),
  instruments: [],
  profile: null,
  profileSettings: [],
  profileState: createResourceState(),
  profileStats: null,
  quotes: {},
  sessionStats: null,
  summary: null,
  tradeActionState: createResourceState(),
  tradeHistory: [],

  bootstrapDashboard: async (options) => {
    if (!options?.silent) {
      set((state) => ({
        dashboardState: patchResourceState(state.dashboardState, {
          error: null,
          isLoading: true,
        }),
      }))
    }

    try {
      const response = await getDashboardSnapshot()
      const instruments = response.instruments.map(normalizeInstrument)
      const quotes = response.quotes.map(normalizeQuote)
      const currentPrices = Object.fromEntries(quotes.map((quote) => [quote.symbol, quote.last]))

      set((state) => ({
        activeTrades: response.activeTrades.map(normalizeTrade),
        currentPrices,
        dashboardState: patchResourceState(state.dashboardState, {
          error: null,
          isLoading: false,
          lastLoadedAt: Date.now(),
        }),
        instruments,
        quotes: Object.fromEntries(quotes.map((quote) => [quote.symbol, quote])),
        sessionStats: normalizeSessionStats(response.sessionStats),
        summary: normalizeSummary(response.summary),
      }))
    } catch (error) {
      set((state) => ({
        dashboardState: patchResourceState(state.dashboardState, {
          error: error instanceof Error ? error.message : 'Failed to load dashboard',
          isLoading: false,
        }),
      }))
    }
  },

  loadHistory: async () => {
    set((state) => ({
      historyState: patchResourceState(state.historyState, {
        error: null,
        isLoading: true,
      }),
    }))

    try {
      const response = await getTradeHistory()
      set((state) => ({
        historyState: patchResourceState(state.historyState, {
          error: null,
          isLoading: false,
          lastLoadedAt: Date.now(),
        }),
        tradeHistory: response.trades.map(normalizeClosedTrade),
      }))
    } catch (error) {
      set((state) => ({
        historyState: patchResourceState(state.historyState, {
          error: error instanceof Error ? error.message : 'Failed to load trade history',
          isLoading: false,
        }),
      }))
    }
  },

  loadProfile: async () => {
    set((state) => ({
      profileState: patchResourceState(state.profileState, {
        error: null,
        isLoading: true,
      }),
    }))

    try {
      const response = await getProfile()
      set((state) => ({
        achievements: response.achievements.map(normalizeAchievement),
        profile: normalizeProfile(response.profile),
        profileSettings: response.settings.map(normalizeProfileSetting),
        profileState: patchResourceState(state.profileState, {
          error: null,
          isLoading: false,
          lastLoadedAt: Date.now(),
        }),
        profileStats: normalizeProfileStats(response.stats),
      }))
    } catch (error) {
      set((state) => ({
        profileState: patchResourceState(state.profileState, {
          error: error instanceof Error ? error.message : 'Failed to load profile',
          isLoading: false,
        }),
      }))
    }
  },

  fetchCandles: async (symbol, options) => {
    const currentState = get().chartStates[symbol] ?? createResourceState()

    if (!options?.silent) {
      set((state) => ({
        chartStates: {
          ...state.chartStates,
          [symbol]: patchResourceState(currentState, {
            error: null,
            isLoading: true,
          }),
        },
      }))
    }

    try {
      const response = await getCandles(symbol)

      set((state) => ({
        candlesBySymbol: {
          ...state.candlesBySymbol,
          [symbol]: response.candles.map(normalizeCandle),
        },
        chartStates: {
          ...state.chartStates,
          [symbol]: patchResourceState(state.chartStates[symbol] ?? createResourceState(), {
            error: null,
            isLoading: false,
            lastLoadedAt: Date.now(),
          }),
        },
      }))
    } catch (error) {
      set((state) => ({
        chartStates: {
          ...state.chartStates,
          [symbol]: patchResourceState(state.chartStates[symbol] ?? createResourceState(), {
            error: error instanceof Error ? error.message : 'Failed to load candles',
            isLoading: false,
          }),
        },
      }))
    }
  },

  openTrade: async (payload) => {
    set((state) => ({
      tradeActionState: patchResourceState(state.tradeActionState, {
        error: null,
        isLoading: true,
      }),
    }))

    try {
      const response = await createTrade({
        direction: payload.direction,
        entryPrice: payload.entryPrice?.toString(),
        lotSize: payload.lotSize.toString(),
        stopLoss: payload.stopLoss?.toString(),
        symbol: payload.instrument,
        takeProfit: payload.takeProfit?.toString(),
      })

      set((state) => {
        const nextTrades = response.activeTrade
          ? [normalizeTrade(response.activeTrade), ...state.activeTrades]
          : state.activeTrades
        const nextQuotes = response.quotes?.map(normalizeQuote) ?? Object.values(state.quotes)

        return {
          activeTrades: nextTrades,
          currentPrices: Object.fromEntries(nextQuotes.map((quote) => [quote.symbol, quote.last])),
          quotes: Object.fromEntries(nextQuotes.map((quote) => [quote.symbol, quote])),
          sessionStats: normalizeSessionStats(response.sessionStats),
          summary: normalizeSummary(response.summary),
          tradeActionState: patchResourceState(state.tradeActionState, {
            error: null,
            isLoading: false,
            lastLoadedAt: Date.now(),
          }),
        }
      })
    } catch (error) {
      set((state) => ({
        tradeActionState: patchResourceState(state.tradeActionState, {
          error: error instanceof Error ? error.message : 'Failed to open trade',
          isLoading: false,
        }),
      }))
      throw error
    }
  },

  closeTrade: async (tradeId) => {
    set((state) => ({
      tradeActionState: patchResourceState(state.tradeActionState, {
        error: null,
        isLoading: true,
      }),
    }))

    try {
      const response = await closeTradeRequest({ tradeId })

      set((state) => {
        const remainingTrades = state.activeTrades.filter((trade) => trade.id !== tradeId)
        const nextHistory = response.closedTrade
          ? [normalizeClosedTrade(response.closedTrade), ...state.tradeHistory]
          : state.tradeHistory
        const nextQuotes = response.quotes?.map(normalizeQuote) ?? Object.values(state.quotes)

        return {
          activeTrades: remainingTrades,
          currentPrices: Object.fromEntries(nextQuotes.map((quote) => [quote.symbol, quote.last])),
          quotes: Object.fromEntries(nextQuotes.map((quote) => [quote.symbol, quote])),
          sessionStats: normalizeSessionStats(response.sessionStats),
          summary: normalizeSummary(response.summary),
          tradeActionState: patchResourceState(state.tradeActionState, {
            error: null,
            isLoading: false,
            lastLoadedAt: Date.now(),
          }),
          tradeHistory: nextHistory,
        }
      })
    } catch (error) {
      set((state) => ({
        tradeActionState: patchResourceState(state.tradeActionState, {
          error: error instanceof Error ? error.message : 'Failed to close trade',
          isLoading: false,
        }),
      }))
      throw error
    }
  },

  subscribeSymbol: (symbol) => {
    realtimeClient?.subscribe([symbol])
  },

  connectRealtime: () => {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    realtimeClient?.disconnect()

    realtimeClient = new TradingWebSocketClient({
      onMessage: (message: TradingServerMessage) => {
        set((state) => {
          if (message.type === 'PRICE_TICK') {
            const quote = normalizeQuote(message)
            return {
              currentPrices: {
                ...state.currentPrices,
                [quote.symbol]: quote.last,
              },
              quotes: {
                ...state.quotes,
                [quote.symbol]: quote,
              },
            }
          }

          if (message.type === 'CANDLE_UPDATE') {
            const candle = normalizeCandle(message.candle)
            const currentCandles = state.candlesBySymbol[message.symbol] ?? []
            const lastCandle = currentCandles[currentCandles.length - 1]
            const nextCandles =
              lastCandle && lastCandle.time === candle.time
                ? [...currentCandles.slice(0, -1), candle]
                : [...currentCandles, candle].slice(-400)

            return {
              candlesBySymbol: {
                ...state.candlesBySymbol,
                [message.symbol]: nextCandles,
              },
            }
          }

          if (message.type === 'BALANCE_UPDATE') {
            return {
              summary: state.summary
                ? {
                    ...state.summary,
                    balance: Number.parseFloat(message.balance),
                    equity: Number.parseFloat(message.equity),
                    floatingPnl: Number.parseFloat(message.floatingPnl),
                    totalPnl: message.totalPnl ? Number.parseFloat(message.totalPnl) : state.summary.totalPnl,
                    winRate: message.winRate ?? state.summary.winRate,
                  }
                : state.summary,
            }
          }

          if (message.type === 'TRADE_STATUS_UPDATE') {
            if (message.tradeStatus === 'CLOSED') {
              const closedTrade = normalizeClosedTrade(message.trade as never)
              return {
                activeTrades: state.activeTrades.filter((trade) => trade.id !== closedTrade.id),
                tradeHistory: [closedTrade, ...state.tradeHistory],
              }
            }

            const liveTrade = normalizeTrade(message.trade as never)
            const existing = state.activeTrades.find((trade) => trade.id === liveTrade.id)
            const activeTrades = existing
              ? state.activeTrades.map((trade) => (trade.id === liveTrade.id ? liveTrade : trade))
              : [liveTrade, ...state.activeTrades]

            return { activeTrades }
          }

          if (message.type === 'SESSION_STATS_UPDATE') {
            return {
              sessionStats: normalizeSessionStats(message.sessionStats),
            }
          }

          return {}
        })
      },
      onStatusChange: (status) => {
        set({ connectionStatus: status })
      },
    })

    realtimeClient.connect()

    return () => {
      realtimeClient?.disconnect()
      realtimeClient = null
      set({ connectionStatus: 'OFFLINE' })
    }
  },

  startPolling: (symbol) => {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }

    const poll = () => {
      void get().bootstrapDashboard({ silent: true })
      void get().fetchCandles(symbol, { silent: true })
    }

    poll()
    pollingTimer = setInterval(poll, 15000)

    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    }
  },
}))
