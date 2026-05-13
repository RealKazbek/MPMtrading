'use client'

import { useShallow } from 'zustand/react/shallow'
import { formatPercent, formatPrice } from '@/lib/format'
import InlineMessage from '@/components/ui/InlineMessage'
import Skeleton from '@/components/ui/Skeleton'
import StatCard from '@/components/ui/StatCard'
import { useTradingStore } from '@/store/tradingStore'

export default function TradeStats() {
  const { dashboardState, market } = useTradingStore(
    useShallow((state) => ({
      dashboardState: state.dashboardState,
      market: state.market,
    }))
  )

  if (dashboardState.isLoading && market.length === 0) {
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

  if (dashboardState.error && market.length === 0) {
    return (
      <InlineMessage
        actionLabel="Повторить"
        description={dashboardState.error}
        onAction={() => {
          useTradingStore.getState().connectRealtime()
        }}
        title="Поток рынка недоступен"
        tone="danger"
      />
    )
  }

  if (market.length === 0) {
    return (
      <InlineMessage
        description="После подключения здесь появятся основные инструменты."
        title="Ожидание котировок"
      />
    )
  }

  return (
    <div className="stats-grid">
      {market.map((item) => (
        <StatCard
          key={item.symbol}
          label={item.symbol}
          value={formatPrice(item.price, item.pricePrecision)}
          helper={`${item.change >= 0 ? '+' : ''}${item.change.toFixed(item.pricePrecision)} · ${formatPercent(item.changePercent)}`}
          icon={item.symbol.slice(0, 3)}
          tone={item.change >= 0 ? 'success' : 'danger'}
          className="surface-card-interactive"
        />
      ))}
    </div>
  )
}
