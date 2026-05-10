'use client'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Navbar from '@/components/Navbar'
import TradeTable from '@/components/TradeTable'
import InlineMessage from '@/components/ui/InlineMessage'
import PageHeader from '@/components/ui/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import StatCard from '@/components/ui/StatCard'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { formatPnL } from '@/lib/format'
import { useTradingStore } from '@/store/tradingStore'

export default function HistoryPage() {
  const { historyState, loadHistory, tradeHistory } = useTradingStore(
    useShallow((state) => ({
      historyState: state.historyState,
      loadHistory: state.loadHistory,
      tradeHistory: state.tradeHistory,
    }))
  )

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const wins = tradeHistory.filter((trade) => trade.result === 'WIN')
  const losses = tradeHistory.filter((trade) => trade.result === 'LOSS')
  const totalPnL = tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0)
  const winRate = tradeHistory.length > 0 ? (wins.length / tradeHistory.length) * 100 : 0

  const statCards = useMemo(
    () => [
      { helper: 'Closed positions', icon: 'ALL', label: 'Total trades', tone: 'default' as const, value: String(tradeHistory.length) },
      { helper: 'Profitable closes', icon: 'WIN', label: 'Wins', tone: 'success' as const, value: String(wins.length) },
      { helper: 'Protected downside', icon: 'LOS', label: 'Losses', tone: 'danger' as const, value: String(losses.length) },
      { helper: 'Hit ratio', icon: 'RTE', tone: 'default' as const, label: 'Win rate', value: `${winRate.toFixed(1)}%` },
      { helper: 'Closed performance', icon: 'PNL', label: 'Total PnL', tone: totalPnL >= 0 ? 'success' as const : 'danger' as const, value: formatPnL(totalPnL) },
    ],
    [losses.length, totalPnL, tradeHistory.length, winRate, wins.length]
  )

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main page-stack">
        <PageHeader
          eyebrow="Journal"
          title="Trade history"
          subtitle="A cleaner ledger for reviewing execution quality, payout distribution and overall consistency."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {historyState.isLoading && tradeHistory.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="surface-card surface-card-padding stat-card">
                  <Skeleton className="h-10 w-10 rounded-[14px]" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-6 w-24" />
                  </div>
                </div>
              ))
            : statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
        </div>

        {historyState.error && tradeHistory.length === 0 ? (
          <InlineMessage
            actionLabel="Retry"
            description={historyState.error}
            onAction={() => {
              void useTradingStore.getState().loadHistory()
            }}
            title="Trade history unavailable"
            tone="danger"
          />
        ) : null}

        <SurfaceCard>
          <div className="card-header">
            <div>
              <h2 className="section-title">Win / loss ratio</h2>
              <p className="section-subtitle">A single glance view of outcome distribution across all closed trades.</p>
            </div>
            <span className="chip">{wins.length}W / {losses.length}L</span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#1bbf83,#5fd5aa)]"
              style={{ width: `${Math.max(winRate, 8)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[var(--color-success)]">{winRate.toFixed(1)}% win</span>
            <span className="text-[var(--color-danger)]">{(100 - winRate).toFixed(1)}% loss</span>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="card-header">
            <div>
              <h2 className="section-title">All trades</h2>
              <p className="section-subtitle">Full history with stable numeric formatting and safer overflow handling.</p>
            </div>
            <span className="chip chip-active">{tradeHistory.length} records</span>
          </div>

          <div className="mt-5">
            <TradeTable trades={tradeHistory} showAll />
          </div>
        </SurfaceCard>
      </main>
    </div>
  )
}
