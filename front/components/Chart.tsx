'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { formatPercent, formatPrice } from '@/lib/format'
import InlineMessage from '@/components/ui/InlineMessage'
import Skeleton from '@/components/ui/Skeleton'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { useTradingStore, type CandleData, type Instrument } from '@/store/tradingStore'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (instrument: Instrument) => void
}

type ChartHandle = {
  applyOptions: (options: Record<string, unknown>) => void
  remove: () => void
}

type CandleSeriesHandle = {
  setData: (data: Array<Record<string, unknown>>) => void
}

export default function Chart({ selectedInstrument, onInstrumentChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<ChartHandle | null>(null)
  const latestCandlesRef = useRef<CandleData[]>([])
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const seriesRef = useRef<CandleSeriesHandle | null>(null)
  const isDisposedRef = useRef(false)
  const { candles, chartState, instruments, marketItem } = useTradingStore(
    useShallow((state) => ({
      candles: state.candlesBySymbol[selectedInstrument] ?? [],
      chartState: state.chartStates[selectedInstrument],
      instruments: state.instruments,
      marketItem: state.quotes[selectedInstrument],
    }))
  )

  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)
  const previousLastPrice = useRef<number | null>(null)

  const instrumentMeta = useMemo(
    () => instruments.find((instrument) => instrument.symbol === selectedInstrument),
    [instruments, selectedInstrument]
  )
  const pricePrecision = instrumentMeta?.pricePrecision

  useEffect(() => {
    latestCandlesRef.current = candles
  }, [candles])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      if (!containerRef.current || chartInstanceRef.current || cancelled) return

      const { createChart } = await import('lightweight-charts')
      if (!containerRef.current || cancelled || chartInstanceRef.current) return

      isDisposedRef.current = false

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: {
          background: { color: 'transparent' },
          textColor: '#92a0b2',
          fontFamily: 'var(--font-body)',
        },
        grid: {
          horzLines: { color: 'rgba(130, 142, 158, 0.12)' },
          vertLines: { color: 'rgba(130, 142, 158, 0.08)' },
        },
        crosshair: {
          horzLine: { color: 'rgba(127, 147, 170, 0.42)', labelBackgroundColor: '#5f7288' },
          vertLine: { color: 'rgba(127, 147, 170, 0.42)', labelBackgroundColor: '#5f7288' },
        },
        handleScale: true,
        handleScroll: true,
        rightPriceScale: {
          borderColor: 'rgba(130, 142, 158, 0.18)',
        },
        timeScale: {
          borderColor: 'rgba(130, 142, 158, 0.18)',
          secondsVisible: false,
          timeVisible: true,
        },
      })

      const series = chart.addCandlestickSeries({
        borderDownColor: '#ff6e84',
        borderUpColor: '#21c67a',
        downColor: '#ff647c',
        upColor: '#21c67a',
        wickDownColor: '#ff647c',
        wickUpColor: '#21c67a',
      })
      const safeSeries = series as unknown as CandleSeriesHandle

      chartInstanceRef.current = chart as unknown as ChartHandle
      seriesRef.current = safeSeries

      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current || !chartInstanceRef.current || isDisposedRef.current) return

        chartInstanceRef.current.applyOptions({
          height: containerRef.current.clientHeight,
          width: containerRef.current.clientWidth,
        })
      })

      resizeObserver.observe(containerRef.current)
      resizeObserverRef.current = resizeObserver

      if (latestCandlesRef.current.length > 0 && !isDisposedRef.current) {
        safeSeries.setData(latestCandlesRef.current as unknown as Array<Record<string, unknown>>)
      }
    }

    void init()

    return () => {
      cancelled = true

      const observer = resizeObserverRef.current
      resizeObserverRef.current = null
      if (observer) {
        try {
          observer.disconnect()
        } catch {
          // Ignore cleanup races in React StrictMode.
        }
      }

      const chart = chartInstanceRef.current
      chartInstanceRef.current = null
      seriesRef.current = null
      isDisposedRef.current = true

      if (chart) {
        try {
          chart.remove()
        } catch {
          // Ignore double-dispose noise from dev unmount races.
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || isDisposedRef.current) return

    seriesRef.current.setData(candles as unknown as Array<Record<string, unknown>>)
    setCurrentCandle(candles[candles.length - 1] ?? null)
  }, [candles])

  useEffect(() => {
    if (marketItem?.price === undefined || previousLastPrice.current === null) {
      previousLastPrice.current = marketItem?.price ?? null
      return
    }

    if (marketItem.price === previousLastPrice.current) return

    setPriceChange(marketItem.price > previousLastPrice.current ? 'up' : 'down')
    previousLastPrice.current = marketItem.price

    const timeout = window.setTimeout(() => setPriceChange(null), 450)
    return () => window.clearTimeout(timeout)
  }, [marketItem])

  return (
    <SurfaceCard className="chart-card" padded={false}>
      <div className="surface-card-padding">
        <div className="chart-header">
          <div className="min-w-0">
            <span className="eyebrow">Рынок</span>
            <h2 className="section-title mt-3 text-[1.05rem]">График</h2>
            <p className="section-subtitle">Локально сгенерированные свечи и динамика инструмента.</p>
          </div>

          <div className="min-w-0">
            {chartState?.isLoading && candles.length === 0 ? (
              <div className="rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] px-4 py-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-7 w-28" />
                <div className="mt-3 flex justify-end gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : currentCandle && marketItem ? (
              <div className="rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] px-4 py-3 text-right">
                <p className="metric-label">{selectedInstrument}</p>
                <p
                  className={`metric-value mt-1 text-xl font-semibold ${priceChange === 'up' ? 'price-flash-up' : priceChange === 'down' ? 'price-flash-down' : ''}`}
                  style={{
                    color:
                      priceChange === 'up'
                        ? 'var(--color-success)'
                        : priceChange === 'down'
                          ? 'var(--color-danger)'
                          : 'var(--color-text)',
                  }}
                >
                  {formatPrice(marketItem.price ?? currentCandle.close, pricePrecision)}
                </p>
                <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs text-[var(--color-text-muted)]">
                  <span style={{ color: marketItem.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatPercent(marketItem.changePercent)}
                  </span>
                  <span>O {formatPrice(currentCandle.open, pricePrecision)}</span>
                  <span>H {formatPrice(currentCandle.high, pricePrecision)}</span>
                  <span>L {formatPrice(currentCandle.low, pricePrecision)}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="chart-toolbar mt-4">
          {instruments.map((instrument) => (
            <button
              key={instrument.symbol}
              type="button"
              onClick={() => onInstrumentChange(instrument.symbol)}
              className={instrument.symbol === selectedInstrument ? 'chip chip-active transition-all duration-150' : 'chip transition-all duration-150'}
            >
              {instrument.symbol}
            </button>
          ))}
        </div>
      </div>

      {chartState?.error && candles.length === 0 ? (
        <div className="surface-card-padding pt-0">
          <InlineMessage
            actionLabel="Повторить"
            description="Не удалось получить локальную историю свечей."
            onAction={() => {
              void useTradingStore.getState().bootstrapDashboard()
            }}
            title="График недоступен"
            tone="danger"
          />
        </div>
      ) : null}

      {!chartState?.isLoading && !chartState?.error && candles.length === 0 ? (
        <div className="surface-card-padding pt-0">
          <InlineMessage
            description="Для выбранного инструмента свечи пока не накопились."
            title="Нет данных графика"
          />
        </div>
      ) : (
        <div ref={containerRef} className="chart-surface" />
      )}
    </SurfaceCard>
  )
}
