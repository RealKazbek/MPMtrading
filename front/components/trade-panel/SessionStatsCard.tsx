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
        label="Активные позиции"
        value={activeTradesCount.toString()}
        helper="Открыто сейчас"
        icon="LIV"
      />
      <StatCard
        label="Плавающий PnL"
        value={formatPnL(floatingPnL)}
        helper="Текущая переоценка"
        icon="P/L"
        tone={floatingPnL >= 0 ? 'success' : 'danger'}
      />
    </div>
  )
}
