export type ConnectionStatus = 'LIVE' | 'CONNECTING' | 'OFFLINE'

export interface ApiErrorResponse {
  code?: string
  details?: unknown
  message: string
}

export interface DashboardSummaryDto {
  activeTrades: number
  balance: string
  equity: string
  floatingPnl: string
  totalPnl: string
  winRate: number
}

export interface SessionStatsDto {
  activeTrades: number
  closedTrades: number
  floatingPnl: string
  wins: number
}

export interface InstrumentDto {
  displayName: string
  lotStep: string
  minLot: string
  pricePrecision: number
  quantityPrecision: number
  quoteCurrency: string
  symbol: string
}

export interface QuoteDto {
  ask: string
  bid: string
  last: string
  symbol: string
  timestamp: string
}

export interface CandleDto {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
  volume?: string | null
}

export interface ActiveTradeDto {
  currentPrice: string
  direction: 'BUY' | 'SELL'
  entryPrice: string
  id: string
  lotSize: string
  openTime: string
  pnl: string
  pnlPercent: string
  stopLoss: string
  symbol: string
  takeProfit: string
}

export interface ClosedTradeDto {
  closeTime: string
  direction: 'BUY' | 'SELL'
  entryPrice: string
  exitPrice: string
  id: string
  lotSize: string
  openTime: string
  pnl: string
  pnlPercent: string
  result: 'WIN' | 'LOSS'
  stopLoss: string
  symbol: string
  takeProfit: string
}

export interface ProfileDto {
  email: string
  memberSince: string
  name: string
  tier: string
}

export interface ProfileStatsDto {
  activeTrades: number
  averageLoss: string
  averageWin: string
  balance: string
  profitFactor: string
  totalPnl: string
  totalTrades: number
  winRate: number
}

export interface AchievementDto {
  description?: string
  earned: boolean
  id: string
  label: string
}

export interface ProfileSettingDto {
  label: string
  value: string
}

export interface DashboardSnapshotResponse {
  activeTrades: ActiveTradeDto[]
  instruments: InstrumentDto[]
  quotes: QuoteDto[]
  sessionStats: SessionStatsDto
  summary: DashboardSummaryDto
}

export interface TradeHistoryResponse {
  trades: ClosedTradeDto[]
}

export interface ProfileResponse {
  achievements: AchievementDto[]
  profile: ProfileDto
  settings: ProfileSettingDto[]
  stats: ProfileStatsDto
}

export interface CandlesResponse {
  candles: CandleDto[]
  symbol: string
  timeframe: string
}

export interface OpenTradeRequest {
  direction: 'BUY' | 'SELL'
  entryPrice?: string
  lotSize: string
  stopLoss?: string
  symbol: string
  takeProfit?: string
}

export interface CloseTradeRequest {
  tradeId: string
}

export interface TradeMutationResponse {
  activeTrade?: ActiveTradeDto
  closedTrade?: ClosedTradeDto
  message?: string
  quotes?: QuoteDto[]
  sessionStats: SessionStatsDto
  summary: DashboardSummaryDto
}

export interface PriceTickMessage {
  ask: string
  bid: string
  last: string
  symbol: string
  timestamp: string
  type: 'PRICE_TICK'
}

export interface CandleUpdateMessage {
  candle: CandleDto
  symbol: string
  timeframe: string
  type: 'CANDLE_UPDATE'
}

export interface BalanceUpdateMessage {
  balance: string
  equity: string
  floatingPnl: string
  totalPnl?: string
  type: 'BALANCE_UPDATE'
  winRate?: number
}

export interface TradeStatusUpdateMessage {
  trade: ActiveTradeDto | ClosedTradeDto
  tradeStatus: 'OPENED' | 'UPDATED' | 'CLOSED'
  type: 'TRADE_STATUS_UPDATE'
}

export interface SessionStatsUpdateMessage {
  sessionStats: SessionStatsDto
  type: 'SESSION_STATS_UPDATE'
}

export interface HeartbeatMessage {
  timestamp: string
  type: 'HEARTBEAT'
}

export interface ErrorMessage {
  error: ApiErrorResponse
  type: 'ERROR'
}

export type TradingServerMessage =
  | BalanceUpdateMessage
  | CandleUpdateMessage
  | ErrorMessage
  | HeartbeatMessage
  | PriceTickMessage
  | SessionStatsUpdateMessage
  | TradeStatusUpdateMessage

export interface SubscribeMessage {
  channels: Array<'balance' | 'candles' | 'prices' | 'sessionStats' | 'trades'>
  symbols?: string[]
  type: 'SUBSCRIBE'
}

export interface UnsubscribeMessage {
  channels: Array<'balance' | 'candles' | 'prices' | 'sessionStats' | 'trades'>
  symbols?: string[]
  type: 'UNSUBSCRIBE'
}

export interface PongMessage {
  timestamp: string
  type: 'PONG'
}

export type TradingClientMessage = PongMessage | SubscribeMessage | UnsubscribeMessage
