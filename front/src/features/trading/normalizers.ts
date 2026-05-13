import type {
  AchievementDto,
  ActiveTradeDto,
  CandleDto,
  ClosedTradeDto,
  DashboardSummaryDto,
  InstrumentDto,
  ProfileDto,
  ProfileSettingDto,
  ProfileStatsDto,
  QuoteDto,
  SessionStatsDto,
} from '@/src/lib/api/types'
import type {
  Achievement,
  CandleData,
  InstrumentMeta,
  Profile,
  ProfileSetting,
  ProfileStats,
  Quote,
  SessionStats,
  Summary,
  Trade,
  ClosedTrade,
} from '@/store/tradingStore'

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 0
  return typeof value === 'number' ? value : Number.parseFloat(value)
}

export function normalizeSummary(dto: DashboardSummaryDto): Summary {
  return {
    activeTrades: dto.activeTrades,
    balance: toNumber(dto.balance),
    equity: toNumber(dto.equity),
    floatingPnl: toNumber(dto.floatingPnl),
    totalPnl: toNumber(dto.totalPnl),
    winRate: dto.winRate,
  }
}

export function normalizeSessionStats(dto: SessionStatsDto): SessionStats {
  return {
    activeTrades: dto.activeTrades,
    closedTrades: dto.closedTrades,
    floatingPnl: toNumber(dto.floatingPnl),
    wins: dto.wins,
  }
}

export function normalizeInstrument(dto: InstrumentDto): InstrumentMeta {
  return {
    displayName: dto.displayName,
    lotStep: toNumber(dto.lotStep),
    minLot: toNumber(dto.minLot),
    pricePrecision: dto.pricePrecision,
    quantityPrecision: dto.quantityPrecision,
    quoteCurrency: dto.quoteCurrency,
    symbol: dto.symbol,
  }
}

export function normalizeQuote(dto: QuoteDto): Quote {
  const last = toNumber(dto.last)

  return {
    ask: toNumber(dto.ask),
    bid: toNumber(dto.bid),
    change: 0,
    changePercent: 0,
    displayName: dto.symbol,
    last: toNumber(dto.last),
    price: last,
    pricePrecision: 2,
    symbol: dto.symbol,
    timestamp: dto.timestamp,
  }
}

export function normalizeTrade(dto: ActiveTradeDto): Trade {
  return {
    currentPrice: toNumber(dto.currentPrice),
    direction: dto.direction,
    entryPrice: toNumber(dto.entryPrice),
    id: dto.id,
    instrument: dto.symbol,
    lotSize: toNumber(dto.lotSize),
    openTime: dto.openTime,
    pnl: toNumber(dto.pnl),
    pnlPercent: toNumber(dto.pnlPercent),
    stopLoss: toNumber(dto.stopLoss),
    takeProfit: toNumber(dto.takeProfit),
  }
}

export function normalizeClosedTrade(dto: ClosedTradeDto): ClosedTrade {
  return {
    closeTime: dto.closeTime,
    currentPrice: toNumber(dto.exitPrice),
    direction: dto.direction,
    entryPrice: toNumber(dto.entryPrice),
    exitPrice: toNumber(dto.exitPrice),
    id: dto.id,
    instrument: dto.symbol,
    lotSize: toNumber(dto.lotSize),
    openTime: dto.openTime,
    pnl: toNumber(dto.pnl),
    pnlPercent: toNumber(dto.pnlPercent),
    result: dto.result,
    stopLoss: toNumber(dto.stopLoss),
    takeProfit: toNumber(dto.takeProfit),
  }
}

export function normalizeCandle(dto: CandleDto): CandleData {
  return {
    close: toNumber(dto.close),
    high: toNumber(dto.high),
    low: toNumber(dto.low),
    open: toNumber(dto.open),
    time: Math.floor(new Date(dto.timestamp).getTime() / 1000),
  }
}

export function normalizeProfile(dto: ProfileDto): Profile {
  return {
    email: dto.email,
    memberSince: dto.memberSince,
    name: dto.name,
    tier: dto.tier,
  }
}

export function normalizeProfileStats(dto: ProfileStatsDto): ProfileStats {
  return {
    activeTrades: dto.activeTrades,
    averageLoss: toNumber(dto.averageLoss),
    averageWin: toNumber(dto.averageWin),
    balance: toNumber(dto.balance),
    profitFactor: dto.profitFactor,
    totalPnl: toNumber(dto.totalPnl),
    totalTrades: dto.totalTrades,
    winRate: dto.winRate,
  }
}

export function normalizeAchievement(dto: AchievementDto): Achievement {
  return {
    description: dto.description ?? '',
    earned: dto.earned,
    id: dto.id,
    label: dto.label,
  }
}

export function normalizeProfileSetting(dto: ProfileSettingDto): ProfileSetting {
  return {
    label: dto.label,
    value: dto.value,
  }
}
