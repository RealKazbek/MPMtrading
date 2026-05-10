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
          <span className="eyebrow">Execution</span>
          <h2 className="section-title mt-3 text-[1.05rem]">New trade</h2>
          <p className="section-subtitle">Review price and open a position without leaving the panel.</p>
        </div>
        <button type="button" onClick={onOpen} className="surface-button min-w-[9rem]">
          Open trade
        </button>
      </div>

      <div className="mt-5 rounded-[18px] border border-[var(--color-border)] bg-white/75 p-4">
        <p className="metric-label">{instrument} market price</p>
        <p className="metric-value mt-2 text-[1.75rem] font-semibold">
          {currentPrice ? formatPrice(currentPrice, precision) : '--'}
        </p>
      </div>
    </SurfaceCard>
  )
}
