'use client'

import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { formatPrice } from '@/lib/format'
import { useTradingStore, type Direction, type Instrument } from '@/store/tradingStore'
import InlineMessage from '@/components/ui/InlineMessage'
import FormField from '@/components/ui/FormField'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (instrument: Instrument) => void
  onOpened?: () => void
}

const lotPresets = ['0.01', '0.10', '1.00']

export default function TradeForm({
  selectedInstrument,
  onInstrumentChange,
  onOpened,
}: Props) {
  const { currentPrice, instruments, openTrade, tradeActionState } = useTradingStore(
    useShallow((state) => ({
      currentPrice: state.currentPrices[selectedInstrument] ?? 0,
      instruments: state.instruments,
      openTrade: state.openTrade,
      tradeActionState: state.tradeActionState,
    }))
  )

  const instrumentMeta = useMemo(
    () => instruments.find((instrument) => instrument.symbol === selectedInstrument),
    [instruments, selectedInstrument]
  )
  const pricePrecision = instrumentMeta?.pricePrecision

  const [direction, setDirection] = useState<Direction>('BUY')
  const [entry, setEntry] = useState('')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [lot, setLot] = useState('0.10')
  const [submitted, setSubmitted] = useState(false)

  const handleOpen = async () => {
    const entryPrice = Number.parseFloat(entry) || undefined
    const stopLoss = Number.parseFloat(sl) || undefined
    const takeProfit = Number.parseFloat(tp) || undefined
    const lotSize = Number.parseFloat(lot) || instrumentMeta?.minLot || 0.1

    try {
      await openTrade({
        direction,
        entryPrice,
        instrument: selectedInstrument,
        lotSize,
        stopLoss,
        takeProfit,
      })

      setSubmitted(true)
      window.setTimeout(() => setSubmitted(false), 1500)
      window.setTimeout(() => onOpened?.(), 420)
      setEntry('')
      setSl('')
      setTp('')
    } catch {
      setSubmitted(false)
    }
  }

  return (
    <div className="space-y-4">
      {tradeActionState.error ? (
        <InlineMessage
          className="mb-4"
          description={tradeActionState.error}
          title="Trade request failed"
          tone="danger"
        />
      ) : null}

      <FormField label="Instrument">
        <select
          className="surface-select"
          value={selectedInstrument}
          onChange={(event) => onInstrumentChange(event.target.value as Instrument)}
        >
          {instruments.map((instrument) => (
            <option key={instrument.symbol} value={instrument.symbol}>
              {instrument.symbol}
            </option>
          ))}
        </select>
      </FormField>

      <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3">
        <p className="metric-label">Current market price</p>
        <p className="metric-value mt-1 text-lg font-semibold">
          {currentPrice ? formatPrice(currentPrice, pricePrecision) : '--'}
        </p>
      </div>

      <div>
        <span className="field-label">Direction</span>
        <div className="grid grid-cols-2 gap-2">
          {(['BUY', 'SELL'] as Direction[]).map((value) => {
            const active = direction === value
            const className =
              value === 'BUY'
                ? active
                  ? 'surface-button-success'
                  : 'surface-button-ghost text-[var(--color-success)]'
                : active
                  ? 'surface-button-danger'
                  : 'surface-button-ghost text-[var(--color-danger)]'

            return (
              <button
                key={value}
                type="button"
                onClick={() => setDirection(value)}
                className={`${className} w-full`}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>

      <FormField label="Entry price">
        <input
          className="surface-input"
          type="number"
          inputMode="decimal"
          step="0.00001"
          placeholder={currentPrice ? `Market (${formatPrice(currentPrice, pricePrecision)})` : 'Market'}
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Stop loss">
          <input
            className="surface-input"
            type="number"
            inputMode="decimal"
            step="0.00001"
            placeholder="0.00"
            value={sl}
            onChange={(event) => setSl(event.target.value)}
          />
        </FormField>

        <FormField label="Take profit">
          <input
            className="surface-input"
            type="number"
            inputMode="decimal"
            step="0.00001"
            placeholder="0.00"
            value={tp}
            onChange={(event) => setTp(event.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Lot size">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="surface-input flex-1"
            type="number"
            inputMode="decimal"
            step={instrumentMeta?.lotStep ?? 0.01}
            min={instrumentMeta?.minLot ?? 0.01}
            value={lot}
            onChange={(event) => setLot(event.target.value)}
          />
          <div className="grid grid-cols-3 gap-2 sm:w-auto">
            {lotPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setLot(preset)}
                className={lot === preset ? 'chip chip-active' : 'chip'}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </FormField>

      <button
        type="button"
        onClick={() => void handleOpen()}
        disabled={tradeActionState.isLoading}
        className={direction === 'BUY' ? 'surface-button-success w-full' : 'surface-button-danger w-full'}
      >
        {tradeActionState.isLoading ? 'Submitting...' : submitted ? 'Trade opened' : `Open ${direction} trade`}
      </button>
    </div>
  )
}
