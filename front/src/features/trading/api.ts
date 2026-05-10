import { apiRequest } from '@/src/lib/api/client'
import { API_ENDPOINTS } from '@/src/lib/api/endpoints'
import type {
  CandlesResponse,
  CloseTradeRequest,
  DashboardSnapshotResponse,
  OpenTradeRequest,
  ProfileResponse,
  TradeHistoryResponse,
  TradeMutationResponse,
} from '@/src/lib/api/types'

export function getDashboardSnapshot() {
  return apiRequest<DashboardSnapshotResponse>(API_ENDPOINTS.dashboardSnapshot, {
    cache: 'no-store',
    retries: 3,
  })
}

export function getTradeHistory() {
  return apiRequest<TradeHistoryResponse>(API_ENDPOINTS.tradeHistory, {
    cache: 'no-store',
    retries: 3,
  })
}

export function getProfile() {
  return apiRequest<ProfileResponse>(API_ENDPOINTS.profile, {
    cache: 'no-store',
    retries: 2,
  })
}

export function getCandles(symbol: string) {
  return apiRequest<CandlesResponse>(API_ENDPOINTS.candles(symbol), {
    cache: 'no-store',
    retries: 3,
  })
}

export function createTrade(payload: OpenTradeRequest) {
  return apiRequest<TradeMutationResponse>(API_ENDPOINTS.trades, {
    body: payload,
    method: 'POST',
    retries: 0,
  })
}

export function closeTrade(payload: CloseTradeRequest) {
  return apiRequest<TradeMutationResponse>(API_ENDPOINTS.closeTrade(payload.tradeId), {
    method: 'POST',
    retries: 0,
  })
}
