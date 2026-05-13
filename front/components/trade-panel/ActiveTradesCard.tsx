'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { formatPercent, formatPnL, formatPrice, formatTradeDate } from '@/lib/format'
import { useTradingStore, type Instrument, type Trade } from '@/store/tradingStore'
import InlineMessage from '@/components/ui/InlineMessage'
import SurfaceCard from '@/components/ui/SurfaceCard'

type Props = {
  activeTrades: Trade[]
  currentPrices: Record<Instrument, number>
  closeTrade: (tradeId: string) => Promise<void>
}

export default function ActiveTradesCard({ activeTrades, currentPrices, closeTrade }: Props) {
  const instruments = useTradingStore((state) => state.instruments)
  const precisionMap = useMemo(
    () => Object.fromEntries(instruments.map((instrument) => [instrument.symbol, instrument.pricePrecision])),
    [instruments]
  )

  if (activeTrades.length === 0) {
    return (
      <SurfaceCard>
        <InlineMessage
          description="Открытые позиции появятся здесь."
          title="Нет активных позиций"
        />
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard>
      <div className="card-header">
        <div>
          <h2 className="section-title">Активные позиции</h2>
          <p className="section-subtitle">Текущие сделки и результат по ним.</p>
        </div>
        <span className="chip chip-active">{activeTrades.length} online</span>
      </div>

      <div className="mt-4 space-y-3">
        {activeTrades.map((trade) => {
          const currentPrice = currentPrices[trade.instrument]
          const isProfit = trade.pnl >= 0
          const precision = precisionMap[trade.instrument]

          return (
            <article
              key={trade.id}
              className="rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        trade.direction === 'BUY'
                          ? 'trade-pill trade-pill-buy'
                          : 'trade-pill trade-pill-sell'
                      }
                    >
                      {trade.direction === 'BUY' ? 'BUY' : 'SELL'}
                    </span>
                    <p className="truncate text-sm font-semibold tracking-[0.04em]">{trade.instrument}</p>
                    <span className="chip">{trade.lotSize} lot</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                    {[
                      { label: 'Вход', value: formatPrice(trade.entryPrice, precision) },
                      { label: 'Рынок', value: formatPrice(currentPrice ?? trade.currentPrice, precision) },
                      { label: 'SL', value: formatPrice(trade.stopLoss, precision) },
                      { label: 'TP', value: formatPrice(trade.takeProfit, precision) },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-[10px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                        <p className="metric-label">{item.label}</p>
                        <p className="metric-value mt-1 truncate text-sm font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                    Открыта {formatTradeDate(trade.openTime)}
                  </p>
                </div>

                <div className="rounded-[10px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-right">
                  <p className="metric-label">PnL</p>
                  <p
                    className="metric-value text-lg font-semibold"
                    style={{ color: isProfit ? 'var(--color-success)' : 'var(--color-danger)' }}
                  >
                    {formatPnL(trade.pnl)}
                  </p>
                  <p
                    className="metric-value mt-1 text-xs font-semibold"
                    style={{ color: isProfit ? 'var(--color-success)' : 'var(--color-danger)' }}
                  >
                    {formatPercent(trade.pnlPercent)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <p className="text-sm text-[var(--color-text-muted)]">Идентификатор: {trade.id.slice(0, 8)}</p>
                <button
                  type="button"
                  onClick={() => void closeTrade(trade.id)}
                  className="surface-button-ghost min-w-[8rem]"
                >
                  Закрыть
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </SurfaceCard>
  )
}
