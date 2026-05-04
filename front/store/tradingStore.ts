import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Direction = 'BUY' | 'SELL'
export type Instrument = 'EURUSD' | 'GBPUSD' | 'XAUUSD' | 'BTCUSD' | 'NASDAQ'

export interface Trade {
  id: string
  instrument: Instrument
  direction: Direction
  entryPrice: number
  stopLoss: number
  takeProfit: number
  lotSize: number
  openTime: string
  pnl: number
  pnlPercent: number
}

export interface ClosedTrade extends Trade {
  exitPrice: number
  closeTime: string
  result: 'WIN' | 'LOSS'
}

interface TradingState {
  balance: number
  activeTrades: Trade[]
  tradeHistory: ClosedTrade[]
  currentPrices: Record<Instrument, number>
  prevBalance: number

  setBalance: (balance: number) => void
  openTrade: (trade: Omit<Trade, 'id' | 'openTime' | 'pnl' | 'pnlPercent'>) => void
  closeTrade: (tradeId: string, currentPrice: number) => void
  updatePrices: (prices: Record<Instrument, number>) => void
  updateTradePnL: () => void
}

const INITIAL_PRICES: Record<Instrument, number> = {
  EURUSD: 1.0842,
  GBPUSD: 1.2651,
  XAUUSD: 2341.50,
  BTCUSD: 67430.00,
  NASDAQ: 19845.30,
}

const INITIAL_HISTORY: ClosedTrade[] = [
  {
    id: 'h1', instrument: 'EURUSD', direction: 'BUY',
    entryPrice: 1.0810, exitPrice: 1.0855, stopLoss: 1.0790, takeProfit: 1.0870,
    lotSize: 1.0, openTime: '2025-01-15T09:30:00', closeTime: '2025-01-15T14:22:00',
    pnl: 450, pnlPercent: 4.5, result: 'WIN',
  },
  {
    id: 'h2', instrument: 'XAUUSD', direction: 'SELL',
    entryPrice: 2360.00, exitPrice: 2380.00, stopLoss: 2375.00, takeProfit: 2330.00,
    lotSize: 0.5, openTime: '2025-01-14T11:00:00', closeTime: '2025-01-14T16:45:00',
    pnl: -200, pnlPercent: -2.0, result: 'LOSS',
  },
  {
    id: 'h3', instrument: 'BTCUSD', direction: 'BUY',
    entryPrice: 65000, exitPrice: 67200, stopLoss: 64000, takeProfit: 68000,
    lotSize: 0.2, openTime: '2025-01-13T08:00:00', closeTime: '2025-01-13T20:00:00',
    pnl: 880, pnlPercent: 8.8, result: 'WIN',
  },
  {
    id: 'h4', instrument: 'GBPUSD', direction: 'SELL',
    entryPrice: 1.2700, exitPrice: 1.2640, stopLoss: 1.2740, takeProfit: 1.2630,
    lotSize: 1.5, openTime: '2025-01-12T10:15:00', closeTime: '2025-01-12T15:30:00',
    pnl: 360, pnlPercent: 3.6, result: 'WIN',
  },
  {
    id: 'h5', instrument: 'NASDAQ', direction: 'BUY',
    entryPrice: 19600, exitPrice: 19500, stopLoss: 19400, takeProfit: 19900,
    lotSize: 0.3, openTime: '2025-01-11T14:00:00', closeTime: '2025-01-11T18:00:00',
    pnl: -150, pnlPercent: -1.5, result: 'LOSS',
  },
]

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      balance: 10000,
      prevBalance: 10000,
      activeTrades: [],
      tradeHistory: INITIAL_HISTORY,
      currentPrices: INITIAL_PRICES,

      setBalance: (balance) => set((s) => ({ prevBalance: s.balance, balance })),

      openTrade: (tradeData) => {
        const trade: Trade = {
          ...tradeData,
          id: `t_${Date.now()}`,
          openTime: new Date().toISOString(),
          pnl: 0,
          pnlPercent: 0,
        }
        set((s) => ({ activeTrades: [...s.activeTrades, trade] }))
      },

      closeTrade: (tradeId, currentPrice) => {
        const { activeTrades, balance } = get()
        const trade = activeTrades.find((t) => t.id === tradeId)
        if (!trade) return

        const pnl =
          trade.direction === 'BUY'
            ? (currentPrice - trade.entryPrice) * trade.lotSize * 100
            : (trade.entryPrice - currentPrice) * trade.lotSize * 100

        const pnlPercent = (pnl / balance) * 100

        const closed: ClosedTrade = {
          ...trade,
          exitPrice: currentPrice,
          closeTime: new Date().toISOString(),
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPercent * 100) / 100,
          result: pnl >= 0 ? 'WIN' : 'LOSS',
        }

        const newBalance = Math.round((balance + pnl) * 100) / 100

        set((s) => ({
          activeTrades: s.activeTrades.filter((t) => t.id !== tradeId),
          tradeHistory: [closed, ...s.tradeHistory],
          prevBalance: s.balance,
          balance: newBalance,
        }))
      },

      updatePrices: (prices) => set({ currentPrices: prices }),

      updateTradePnL: () => {
        const { activeTrades, currentPrices } = get()
        if (activeTrades.length === 0) return

        const updated = activeTrades.map((trade) => {
          const current = currentPrices[trade.instrument]
          const pnl =
            trade.direction === 'BUY'
              ? (current - trade.entryPrice) * trade.lotSize * 100
              : (trade.entryPrice - current) * trade.lotSize * 100
          const pnlPercent = (pnl / 10000) * 100
          return {
            ...trade,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 100) / 100,
          }
        })
        set({ activeTrades: updated })
      },
    }),
    {
      name: 'trading-store',
      partialize: (s) => ({
        balance: s.balance,
        tradeHistory: s.tradeHistory,
        activeTrades: s.activeTrades,
      }),
    }
  )
)
