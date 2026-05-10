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
          description="Open trades from the backend will appear here together with live PnL and close actions."
          title="No active trades"
        />
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard>
      <div className="card-header">
        <div>
          <h2 className="section-title">Active trades</h2>
          <p className="section-subtitle">Open positions update in real time from the API stream.</p>
        </div>
        <span className="chip chip-active">{activeTrades.length} live</span>
      </div>

      <div className="mt-4 space-y-3">
        {activeTrades.map((trade) => {
          const currentPrice = currentPrices[trade.instrument]
          const isProfit = trade.pnl >= 0
          const precision = precisionMap[trade.instrument]

          return (
            <article
              key={trade.id}
              className="rounded-[18px] border border-[var(--color-border)] bg-white/72 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        trade.direction === 'BUY'
                          ? 'trade-pill trade-pill-buy'
                          : 'trade-pill trade-pill-sell'
                      }
                    >
                      {trade.direction}
                    </span>
                    <p className="truncate text-sm font-semibold">{trade.instrument}</p>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    Opened {formatTradeDate(trade.openTime)}
                  </p>
                </div>

                <div className="text-right">
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

              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: 'Entry', value: formatPrice(trade.entryPrice, precision) },
                  { label: 'Current', value: formatPrice(currentPrice ?? trade.currentPrice, precision) },
                  { label: 'Stop loss', value: formatPrice(trade.stopLoss, precision) },
                  { label: 'Take profit', value: formatPrice(trade.takeProfit, precision) },
                ].map((item) => (
                  <div key={item.label} className="min-w-0 rounded-[14px] bg-[var(--color-bg-soft)] px-3 py-2">
                    <p className="metric-label">{item.label}</p>
                    <p className="metric-value mt-1 truncate text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">Lot size {trade.lotSize}</p>
                <button
                  type="button"
                  onClick={() => void closeTrade(trade.id)}
                  className="surface-button-ghost min-w-[8rem]"
                >
                  Close trade
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </SurfaceCard>
  )
}
