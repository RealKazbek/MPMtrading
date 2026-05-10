'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { formatPnL, formatPrice } from '@/lib/format'
import { useTradingStore, type CandleData, type Instrument } from '@/store/tradingStore'
import InlineMessage from '@/components/ui/InlineMessage'
import Skeleton from '@/components/ui/Skeleton'
import SurfaceCard from '@/components/ui/SurfaceCard'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (instrument: Instrument) => void
}

export default function Chart({ selectedInstrument, onInstrumentChange }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<unknown>(null)
  const { activeTrades, candles, chartState, instruments, latestPrice, subscribeSymbol } = useTradingStore(
    useShallow((state) => ({
      activeTrades: state.activeTrades,
      candles: state.candlesBySymbol[selectedInstrument] ?? [],
      chartState: state.chartStates[selectedInstrument],
      instruments: state.instruments,
      latestPrice: state.currentPrices[selectedInstrument],
      subscribeSymbol: state.subscribeSymbol,
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
  const instrumentTrades = useMemo(
    () => activeTrades.filter((trade) => trade.instrument === selectedInstrument),
    [activeTrades, selectedInstrument]
  )

  useEffect(() => {
    subscribeSymbol(selectedInstrument)
  }, [selectedInstrument, subscribeSymbol])

  useEffect(() => {
    let mounted = true
    let cleanupFn: (() => void) | undefined

    const init = async () => {
      if (!chartRef.current || !mounted) return

      const { createChart } = await import('lightweight-charts')
      if (!chartRef.current || !mounted) return

      chartRef.current.innerHTML = ''

      const chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        layout: {
          background: { color: 'transparent' },
          textColor: '#7f6770',
          fontFamily: 'var(--font-body)',
        },
        grid: {
          horzLines: { color: 'rgba(241, 217, 227, 0.45)' },
          vertLines: { color: 'rgba(241, 217, 227, 0.6)' },
        },
        crosshair: {
          horzLine: { color: 'rgba(239, 79, 136, 0.4)', labelBackgroundColor: '#ef4f88' },
          vertLine: { color: 'rgba(239, 79, 136, 0.4)', labelBackgroundColor: '#ef4f88' },
        },
        handleScale: true,
        handleScroll: true,
        rightPriceScale: {
          borderColor: 'rgba(231, 196, 211, 0.75)',
        },
        timeScale: {
          borderColor: 'rgba(231, 196, 211, 0.75)',
          secondsVisible: false,
          timeVisible: true,
        },
      })

      const series = (chart as { addCandlestickSeries: (options: unknown) => unknown }).addCandlestickSeries({
        borderDownColor: '#df3e65',
        borderUpColor: '#18a775',
        downColor: '#ef476f',
        upColor: '#1bbf83',
        wickDownColor: '#ef476f',
        wickUpColor: '#1bbf83',
      })

      seriesRef.current = series

      const resizeObserver = new ResizeObserver(() => {
        if (!chartRef.current) return

        ;(chart as { applyOptions: (options: unknown) => void }).applyOptions({
          height: chartRef.current.clientHeight,
          width: chartRef.current.clientWidth,
        })
      })

      resizeObserver.observe(chartRef.current)

      cleanupFn = () => {
        resizeObserver.disconnect()
        ;(chart as { remove: () => void }).remove()
      }
    }

    void init()

    return () => {
      mounted = false
      cleanupFn?.()
    }
  }, [selectedInstrument])

  useEffect(() => {
    if (!seriesRef.current) return
    if (candles.length === 0) return

    ;(seriesRef.current as { setData: (data: CandleData[]) => void }).setData(candles)
    setCurrentCandle(candles[candles.length - 1] ?? null)
  }, [candles])

  useEffect(() => {
    if (latestPrice === undefined || previousLastPrice.current === null) {
      previousLastPrice.current = latestPrice ?? null
      return
    }

    if (latestPrice === previousLastPrice.current) return

    setPriceChange(latestPrice > previousLastPrice.current ? 'up' : 'down')
    previousLastPrice.current = latestPrice

    const timeout = window.setTimeout(() => setPriceChange(null), 450)
    return () => window.clearTimeout(timeout)
  }, [latestPrice])

  useEffect(() => {
    if (!seriesRef.current) return

    const markers = instrumentTrades.flatMap((trade) => {
      if (candles.length === 0) return []

      const entryTime = Math.floor(new Date(trade.openTime).getTime() / 1000)
      const closestCandle = candles.reduce((previous, current) =>
        Math.abs(current.time - entryTime) < Math.abs(previous.time - entryTime) ? current : previous
      )

      return [
        {
          color: trade.direction === 'BUY' ? '#1bbf83' : '#ef476f',
          position: trade.direction === 'BUY' ? 'belowBar' : 'aboveBar',
          shape: trade.direction === 'BUY' ? 'arrowUp' : 'arrowDown',
          size: 1,
          text: `${trade.direction} @ ${formatPrice(trade.entryPrice, pricePrecision)}`,
          time: closestCandle.time,
        },
      ]
    })

    ;(seriesRef.current as { setMarkers: (markers: unknown[]) => void }).setMarkers(markers)
  }, [candles, instrumentTrades, pricePrecision])

  return (
    <SurfaceCard className="chart-card" padded={false}>
      <div className="surface-card-padding">
        <div className="chart-header">
          <div className="min-w-0">
            <span className="eyebrow">Market</span>
            <h2 className="section-title mt-3 text-[1.05rem]">Live chart</h2>
            <p className="section-subtitle">Realtime candles from API with websocket updates and polling fallback.</p>
          </div>

          <div className="min-w-0">
            {chartState?.isLoading && candles.length === 0 ? (
              <div className="rounded-[18px] border border-[var(--color-border)] bg-white/76 px-4 py-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-7 w-28" />
                <div className="mt-3 flex justify-end gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : currentCandle ? (
              <div className="rounded-[18px] border border-[var(--color-border)] bg-white/76 px-4 py-3 text-right">
                <p className="metric-label">{selectedInstrument}</p>
                <p
                  className="metric-value mt-1 text-xl font-semibold"
                  style={{
                    color:
                      priceChange === 'up'
                        ? 'var(--color-success)'
                        : priceChange === 'down'
                          ? 'var(--color-danger)'
                          : 'var(--color-text)',
                  }}
                >
                  {formatPrice(latestPrice ?? currentCandle.close, pricePrecision)}
                </p>
                <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs text-[var(--color-text-muted)]">
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
              className={instrument.symbol === selectedInstrument ? 'chip chip-active' : 'chip'}
            >
              {instrument.symbol}
            </button>
          ))}
        </div>
      </div>

      {chartState?.error && candles.length === 0 ? (
        <div className="surface-card-padding pt-0">
          <InlineMessage
            actionLabel="Retry"
            description="Candles could not be loaded from the backend. Check the API response and try again."
            onAction={() => {
              void useTradingStore.getState().fetchCandles(selectedInstrument)
            }}
            title="Chart unavailable"
            tone="danger"
          />
        </div>
      ) : null}

      {!chartState?.isLoading && !chartState?.error && candles.length === 0 ? (
        <div className="surface-card-padding pt-0">
          <InlineMessage
            description="No candle data is available for this instrument yet."
            title="No market data"
          />
        </div>
      ) : (
        <div ref={chartRef} className="chart-surface" />
      )}

      {instrumentTrades.length > 0 ? (
        <div className="surface-card-padding pt-0">
          <div className="chart-trade-legend">
            {instrumentTrades.map((trade) => (
              <div
                key={trade.id}
                className={trade.direction === 'BUY' ? 'trade-pill trade-pill-buy' : 'trade-pill trade-pill-sell'}
              >
                <span>{trade.direction}</span>
                <span>@ {formatPrice(trade.entryPrice, pricePrecision)}</span>
                <span>{formatPnL(trade.pnl)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
