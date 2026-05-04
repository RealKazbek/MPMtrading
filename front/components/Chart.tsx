'use client'

import { useEffect, useRef, useState } from 'react'
import { useTradingStore, Instrument } from '@/store/tradingStore'
import {
  generateInitialCandles,
  generateNextCandle,
  CandleData,
  INSTRUMENTS,
} from '@/lib/mockData'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (i: Instrument) => void
}

export default function Chart({ selectedInstrument, onInstrumentChange }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<unknown>(null)
  const seriesRef = useRef<unknown>(null)
  const candlesRef = useRef<CandleData[]>([])
  const markersRef = useRef<unknown[]>([])
  const { activeTrades, updatePrices, currentPrices, updateTradePnL } = useTradingStore()
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    let chart: unknown
    let cleanupFn: (() => void) | undefined

    const init = async () => {
      if (!chartRef.current) return

      const { createChart } = await import('lightweight-charts')

      chartRef.current.innerHTML = ''

      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        layout: {
          background: { color: 'transparent' },
          textColor: '#be185d',
          fontFamily: "'DM Sans', sans-serif",
        },
        grid: {
          vertLines: { color: 'rgba(249,168,212,0.2)' },
          horzLines: { color: 'rgba(249,168,212,0.15)' },
        },
        crosshair: {
          vertLine: { color: 'rgba(244,114,182,0.5)', labelBackgroundColor: '#f472b6' },
          horzLine: { color: 'rgba(244,114,182,0.5)', labelBackgroundColor: '#f472b6' },
        },
        rightPriceScale: {
          borderColor: 'rgba(249,168,212,0.3)',
        },
        timeScale: {
          borderColor: 'rgba(249,168,212,0.3)',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: true,
        handleScale: true,
      })

      chartInstance.current = chart

      const series = (chart as { addCandlestickSeries: (opts: unknown) => unknown }).addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderUpColor: '#059669',
        borderDownColor: '#e11d48',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      })

      seriesRef.current = series

      const candles = generateInitialCandles(selectedInstrument)
      candlesRef.current = candles
      ;(series as { setData: (d: unknown) => void }).setData(candles)

      const lastCandle = candles[candles.length - 1]
      setCurrentCandle(lastCandle)

      const ro = new ResizeObserver(() => {
        if (chartRef.current && chart) {
          ;(chart as { applyOptions: (o: unknown) => void }).applyOptions({
            width: chartRef.current.clientWidth,
            height: chartRef.current.clientHeight,
          })
        }
      })
      if (chartRef.current) ro.observe(chartRef.current)

      cleanupFn = () => {
        ro.disconnect()
        ;(chart as { remove: () => void }).remove()
      }
    }

    init()

    return () => {
      cleanupFn?.()
    }
  }, [selectedInstrument])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || candlesRef.current.length === 0) return

      const last = candlesRef.current[candlesRef.current.length - 1]
      const next = generateNextCandle(last, selectedInstrument)

      const isNewMinute = next.time !== last.time
      if (isNewMinute) {
        candlesRef.current = [...candlesRef.current.slice(-200), next]
      } else {
        candlesRef.current[candlesRef.current.length - 1] = next
      }

      ;(seriesRef.current as { update: (d: unknown) => void }).update(next)
      setCurrentCandle(next)
      setPriceChange(next.close > last.close ? 'up' : 'down')
      setTimeout(() => setPriceChange(null), 600)

      const newPrices = { ...currentPrices, [selectedInstrument]: next.close }
      updatePrices(newPrices)
      updateTradePnL()
    }, 2000)

    return () => clearInterval(interval)
  }, [selectedInstrument, currentPrices, updatePrices, updateTradePnL])

  useEffect(() => {
    if (!seriesRef.current) return

    const markers = activeTrades
      .filter((t) => t.instrument === selectedInstrument)
      .flatMap((trade) => {
        const candles = candlesRef.current
        if (candles.length === 0) return []

        const entryTime = Math.floor(new Date(trade.openTime).getTime() / 1000)
        const closestCandle = candles.reduce((prev, curr) =>
          Math.abs(curr.time - entryTime) < Math.abs(prev.time - entryTime) ? curr : prev
        )

        return [
          {
            time: closestCandle.time,
            position: trade.direction === 'BUY' ? 'belowBar' : 'aboveBar',
            color: trade.direction === 'BUY' ? '#10b981' : '#f43f5e',
            shape: trade.direction === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: `${trade.direction} @ ${trade.entryPrice}`,
            size: 1,
          },
        ]
      })

    ;(seriesRef.current as { setMarkers: (m: unknown) => void }).setMarkers(markers)
    markersRef.current = markers
  }, [activeTrades, selectedInstrument])

  const formatPrice = (price: number) => {
    if (selectedInstrument === 'BTCUSD' || selectedInstrument === 'NASDAQ') return price.toFixed(2)
    if (selectedInstrument === 'XAUUSD') return price.toFixed(2)
    return price.toFixed(5)
  }

  return (
    <div className="chart-card glass-card flex flex-col h-full min-h-0 overflow-hidden">
      <div
        className="chart-header flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(249,168,212,0.2)' }}
      >
        <div className="instrument-tabs flex items-center gap-1 flex-wrap">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst}
              onClick={() => onInstrumentChange(inst)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                inst === selectedInstrument
                  ? {
                      background: 'linear-gradient(135deg, #f472b6, #f43f5e)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(244,114,182,0.4)',
                    }
                  : { color: '#c084ab', background: 'rgba(253,242,248,0.5)' }
              }
            >
              {inst}
            </button>
          ))}
        </div>

        {currentCandle && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium mb-0.5" style={{ color: '#c084ab' }}>
                {selectedInstrument}
              </p>
              <p
                className="text-xl font-bold transition-all duration-300"
                style={{
                  color:
                    priceChange === 'up'
                      ? '#10b981'
                      : priceChange === 'down'
                      ? '#f43f5e'
                      : '#be185d',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatPrice(currentCandle.close)}
              </p>
            </div>

            <div
              className="hidden md:grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs px-3 py-2 rounded-xl"
              style={{ background: 'rgba(253,242,248,0.7)' }}
            >
              {[
                { label: 'O', value: formatPrice(currentCandle.open), color: '#c084ab' },
                { label: 'H', value: formatPrice(currentCandle.high), color: '#10b981' },
                { label: 'L', value: formatPrice(currentCandle.low), color: '#f43f5e' },
                { label: 'C', value: formatPrice(currentCandle.close), color: '#be185d' },
              ].map((item) => (
                <span key={item.label} style={{ color: item.color }}>
                  <span className="font-bold">{item.label}</span> {item.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={chartRef} className="chart-surface flex-1 w-full min-h-0" />

      {activeTrades.filter((t) => t.instrument === selectedInstrument).length > 0 && (
        <div
          className="chart-trade-legend px-4 py-2 flex gap-3 flex-wrap shrink-0"
          style={{ borderTop: '1px solid rgba(249,168,212,0.2)' }}
        >
          {activeTrades
            .filter((t) => t.instrument === selectedInstrument)
            .map((trade) => (
              <div
                key={trade.id}
                className="flex items-center gap-2 text-xs px-3 py-1 rounded-full"
                style={{
                  background:
                    trade.direction === 'BUY'
                      ? 'rgba(209,250,229,0.7)'
                      : 'rgba(254,226,226,0.7)',
                  color: trade.direction === 'BUY' ? '#065f46' : '#991b1b',
                }}
              >
                <span>{trade.direction} @ {trade.entryPrice}</span>
                <span className="font-bold">
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
