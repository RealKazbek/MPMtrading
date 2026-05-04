'use client'

import { useState } from 'react'
import { useTradingStore, Instrument, Direction } from '@/store/tradingStore'
import { INSTRUMENTS } from '@/lib/mockData'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (i: Instrument) => void
  onOpened?: () => void
}

export default function TradeForm({ selectedInstrument, onInstrumentChange, onOpened }: Props) {
  const { currentPrices, openTrade } = useTradingStore()
  const currentPrice = currentPrices[selectedInstrument]

  const [direction, setDirection] = useState<Direction>('BUY')
  const [entry, setEntry] = useState('')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [lot, setLot] = useState('0.1')
  const [submitted, setSubmitted] = useState(false)

  const handleOpen = () => {
    const entryPrice = parseFloat(entry) || currentPrice
    const stopLoss = parseFloat(sl) || (direction === 'BUY' ? entryPrice * 0.999 : entryPrice * 1.001)
    const takeProfit = parseFloat(tp) || (direction === 'BUY' ? entryPrice * 1.002 : entryPrice * 0.998)
    const lotSize = parseFloat(lot) || 0.1

    openTrade({
      instrument: selectedInstrument,
      direction,
      entryPrice,
      stopLoss,
      takeProfit,
      lotSize,
    })

    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 1500)
    if (onOpened) {
      setTimeout(onOpened, 450)
    }
    setEntry('')
    setSl('')
    setTp('')
  }

  const formatP = (p: number) => {
    if (selectedInstrument === 'BTCUSD' || selectedInstrument === 'NASDAQ') return p.toFixed(2)
    if (selectedInstrument === 'XAUUSD') return p.toFixed(2)
    return p.toFixed(5)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9d174d' }}>
          Instrument
        </label>
        <select
          className="input-pink"
          value={selectedInstrument}
          onChange={(e) => onInstrumentChange(e.target.value as Instrument)}
        >
          {INSTRUMENTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{ background: 'rgba(253,242,248,0.8)', border: '1px solid rgba(249,168,212,0.3)' }}
      >
        <span className="text-xs font-medium" style={{ color: '#c084ab' }}>
          Current Price
        </span>
        <span className="text-sm font-bold" style={{ color: '#be185d' }}>
          {formatP(currentPrice)}
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9d174d' }}>
          Direction
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['BUY', 'SELL'] as Direction[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className="py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={
                direction === d
                  ? d === 'BUY'
                    ? {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                      }
                    : {
                        background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(244,63,94,0.35)',
                      }
                  : {
                      background: 'rgba(253,242,248,0.6)',
                      color: d === 'BUY' ? '#10b981' : '#f43f5e',
                      border: `1.5px solid ${d === 'BUY' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                    }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9d174d' }}>
          Entry Price
        </label>
        <input
          className="input-pink"
          type="number"
          placeholder={`Market (${formatP(currentPrice)})`}
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          step="0.00001"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#dc2626' }}>
            Stop Loss
          </label>
          <input
            className="input-pink"
            type="number"
            placeholder="0.00"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            step="0.00001"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#10b981' }}>
            Take Profit
          </label>
          <input
            className="input-pink"
            type="number"
            placeholder="0.00"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
            step="0.00001"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9d174d' }}>
          Lot Size
        </label>
        <div className="flex gap-2">
          <input
            className="input-pink flex-1"
            type="number"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            step="0.01"
            min="0.01"
          />
          <div className="flex gap-1">
            {['0.01', '0.1', '1.0'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLot(l)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={
                  lot === l
                    ? { background: 'rgba(244,114,182,0.2)', color: '#be185d', border: '1px solid rgba(244,114,182,0.4)' }
                    : { background: 'rgba(253,242,248,0.7)', color: '#c084ab' }
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleOpen}
        className="btn-primary w-full text-sm font-bold flex items-center justify-center gap-2"
        style={{
          padding: '0.875rem',
          background:
            direction === 'BUY'
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f43f5e, #e11d48)',
          boxShadow:
            direction === 'BUY'
              ? '0 4px 15px rgba(16,185,129,0.4)'
              : '0 4px 15px rgba(244,63,94,0.4)',
        }}
      >
        {submitted ? 'Trade Opened!' : `Open ${direction} Trade`}
      </button>
    </div>
  )
}
