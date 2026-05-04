import { Instrument } from '@/store/tradingStore'

export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

const BASE_PRICES: Record<Instrument, number> = {
  EURUSD: 1.0842,
  GBPUSD: 1.2651,
  XAUUSD: 2341.50,
  BTCUSD: 67430.00,
  NASDAQ: 19845.30,
}

const VOLATILITY: Record<Instrument, number> = {
  EURUSD: 0.0008,
  GBPUSD: 0.001,
  XAUUSD: 2.5,
  BTCUSD: 180,
  NASDAQ: 25,
}

export function generateInitialCandles(instrument: Instrument, count = 120): CandleData[] {
  const candles: CandleData[] = []
  let price = BASE_PRICES[instrument]
  const vol = VOLATILITY[instrument]
  const now = Math.floor(Date.now() / 1000)
  const interval = 60 // 1 minute candles

  for (let i = count; i >= 0; i--) {
    const time = now - i * interval
    const changePercent = (Math.random() - 0.495) * vol * 3
    const open = price
    const close = price * (1 + changePercent)
    const high = Math.max(open, close) * (1 + Math.random() * vol * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * vol * 0.5)

    candles.push({
      time,
      open: Math.round(open * 100000) / 100000,
      high: Math.round(high * 100000) / 100000,
      low: Math.round(low * 100000) / 100000,
      close: Math.round(close * 100000) / 100000,
    })

    price = close
  }

  return candles
}

export function generateNextCandle(
  lastCandle: CandleData,
  instrument: Instrument
): CandleData {
  const vol = VOLATILITY[instrument]
  const change = (Math.random() - 0.495) * vol * 3
  const open = lastCandle.close
  const close = open * (1 + change)
  const high = Math.max(open, close) * (1 + Math.random() * vol * 0.3)
  const low = Math.min(open, close) * (1 - Math.random() * vol * 0.3)

  return {
    time: lastCandle.time + 60,
    open: Math.round(open * 100000) / 100000,
    high: Math.round(high * 100000) / 100000,
    low: Math.round(low * 100000) / 100000,
    close: Math.round(close * 100000) / 100000,
  }
}

export function getNextPrice(currentPrice: number, instrument: Instrument): number {
  const vol = VOLATILITY[instrument]
  const change = (Math.random() - 0.495) * vol * 2
  return Math.round((currentPrice + change) * 100000) / 100000
}

export function formatPrice(price: number, instrument: Instrument): string {
  if (instrument === 'BTCUSD' || instrument === 'NASDAQ') {
    return price.toFixed(2)
  }
  if (instrument === 'XAUUSD') {
    return price.toFixed(2)
  }
  return price.toFixed(5)
}

export function formatPnL(pnl: number): string {
  const sign = pnl >= 0 ? '+' : ''
  return `${sign}$${Math.abs(pnl).toFixed(2)}`
}

export const INSTRUMENTS: Instrument[] = ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'NASDAQ']
