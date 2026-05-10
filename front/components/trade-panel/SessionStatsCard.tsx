'use client'

import { formatPnL } from '@/lib/format'
import StatCard from '@/components/ui/StatCard'

type Props = {
  activeTradesCount: number
  floatingPnL: number
}

export default function SessionStatsCard({ activeTradesCount, floatingPnL }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        label="Active trades"
        value={activeTradesCount.toString()}
        helper="Positions currently open"
        icon="LIV"
      />
      <StatCard
        label="Floating PnL"
        value={formatPnL(floatingPnL)}
        helper="Live mark-to-market result"
        icon="P/L"
        tone={floatingPnL >= 0 ? 'success' : 'danger'}
      />
    </div>
  )
}
