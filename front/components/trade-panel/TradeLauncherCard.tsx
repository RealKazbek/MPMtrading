'use client'

import { useMemo } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { formatPrice } from '@/lib/format'
import type { Instrument } from '@/store/tradingStore'
import SurfaceCard from '@/components/ui/SurfaceCard'

type Props = {
  instrument: Instrument
  currentPrice: number | undefined
  onOpen: () => void
}

export default function TradeLauncherCard({ instrument, currentPrice, onOpen }: Props) {
  const instruments = useTradingStore((state) => state.instruments)
  const precision = useMemo(
    () => instruments.find((item) => item.symbol === instrument)?.pricePrecision,
    [instrument, instruments]
  )

  return (
    <SurfaceCard className="surface-card-muted">
      <div className="card-header">
        <div className="min-w-0">
          <span className="eyebrow">Исполнение</span>
          <h2 className="section-title mt-3 text-[1.05rem]">Новая сделка</h2>
          <p className="section-subtitle">Текущая цена и вход в один клик.</p>
        </div>
        <button type="button" onClick={onOpen} className="surface-button min-w-[9rem]">
          Открыть
        </button>
      </div>

      <div className="mt-5 rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] p-4">
        <p className="metric-label">{instrument} цена</p>
        <p className="metric-value mt-2 text-[1.75rem] font-semibold">
          {currentPrice ? formatPrice(currentPrice, precision) : '--'}
        </p>
      </div>
    </SurfaceCard>
  )
}
