'use client'

import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, formatPercent, formatPnL } from '@/lib/format'
import { useTradingStore } from '@/store/tradingStore'
import InlineMessage from '@/components/ui/InlineMessage'
import Skeleton from '@/components/ui/Skeleton'
import StatCard from '@/components/ui/StatCard'

export default function TradeStats() {
  const { dashboardState, sessionStats, summary } = useTradingStore(
    useShallow((state) => ({
      dashboardState: state.dashboardState,
      sessionStats: state.sessionStats,
      summary: state.summary,
    }))
  )

  if (dashboardState.isLoading && !summary) {
    return (
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card surface-card-padding stat-card">
            <Skeleton className="h-10 w-10 rounded-[14px]" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-6 w-28" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (dashboardState.error && !summary) {
    return (
      <InlineMessage
        actionLabel="Retry"
        description={dashboardState.error}
        onAction={() => {
          void useTradingStore.getState().bootstrapDashboard()
        }}
        title="Dashboard data unavailable"
        tone="danger"
      />
    )
  }

  if (!summary || !sessionStats) {
    return (
      <InlineMessage
        description="The backend did not return summary data for this session."
        title="No summary data"
      />
    )
  }

  return (
    <div className="stats-grid">
      <StatCard
        label="Balance"
        value={`$${formatCurrency(summary.balance)}`}
        helper="Current account value"
        icon="BAL"
      />
      <StatCard
        label="Closed PnL"
        value={formatPnL(summary.totalPnl)}
        helper={`${sessionStats.closedTrades} closed trades`}
        icon="PNL"
        tone={summary.totalPnl >= 0 ? 'success' : 'danger'}
      />
      <StatCard
        label="Open Exposure"
        value={formatPnL(summary.floatingPnl)}
        helper={`${summary.activeTrades} active position${summary.activeTrades === 1 ? '' : 's'}`}
        icon="FLT"
        tone={summary.floatingPnl >= 0 ? 'success' : 'danger'}
      />
      <StatCard
        label="Win Rate"
        value={formatPercent(summary.winRate).replace('+', '')}
        helper={`${sessionStats.wins} wins tracked by backend`}
        icon="WIN"
      />
    </div>
  )
}
