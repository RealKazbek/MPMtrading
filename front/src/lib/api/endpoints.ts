export const API_ENDPOINTS = {
  candles: (symbol: string, timeframe = '1m') =>
    `/api/markets/${encodeURIComponent(symbol)}/candles?timeframe=${encodeURIComponent(timeframe)}`,
  closeTrade: (tradeId: string) => `/api/trades/${encodeURIComponent(tradeId)}/close`,
  dashboardSnapshot: '/api/dashboard/snapshot',
  profile: '/api/profile',
  tradeHistory: '/api/trades/history',
  trades: '/api/trades',
} as const

export const WS_ENDPOINTS = {
  trading: '/ws/trading',
} as const
