'use client'

import { useState } from 'react'
import { useTradingStore, Instrument } from '@/store/tradingStore'
import TradeForm from './TradeForm'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (i: Instrument) => void
}

export default function TradePanel({ selectedInstrument, onInstrumentChange }: Props) {
  const { activeTrades, closeTrade, currentPrices } = useTradingStore()
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const currentPrice = currentPrices[selectedInstrument]

  return (
    <div className="trade-panel flex flex-col gap-4 h-full min-h-0">
      <div className="glass-card p-5 panel-card trade-form-card trade-launch-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">MPM</span>
              <h2 className="text-base font-bold gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
                New Trade
              </h2>
            </div>
            <p className="text-xs" style={{ color: '#c084ab' }}>
              {selectedInstrument} market price
            </p>
            <p className="text-xl font-black mt-1" style={{ color: '#be185d', fontVariantNumeric: 'tabular-nums' }}>
              {currentPrice.toFixed(selectedInstrument === 'EURUSD' || selectedInstrument === 'GBPUSD' ? 5 : 2)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTradeModalOpen(true)}
            className="trade-launch-button"
          >
            Open Trade
          </button>
        </div>
      </div>

      {tradeModalOpen && (
        <div
          className="trade-modal-backdrop"
          role="presentation"
          onClick={() => setTradeModalOpen(false)}
        >
          <div
            className="trade-modal glass-card"
            role="dialog"
            aria-modal="true"
            aria-label="Open new trade"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="trade-modal-header">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#c084ab' }}>
                  MPM Trading
                </p>
                <h2 className="text-xl font-bold gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Open New Trade
                </h2>
              </div>
              <button
                type="button"
                className="trade-modal-close"
                aria-label="Close trade modal"
                onClick={() => setTradeModalOpen(false)}
              >
                x
              </button>
            </div>
            <TradeForm
              selectedInstrument={selectedInstrument}
              onInstrumentChange={onInstrumentChange}
              onOpened={() => setTradeModalOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="panel-scroll-zone flex flex-col gap-4 min-h-0">
        {activeTrades.length > 0 && (
          <div className="glass-card p-5 panel-card active-trades-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">LIVE</span>
                <h2 className="text-base font-bold gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Active Trades
                </h2>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(244,114,182,0.15)', color: '#be185d' }}
              >
                {activeTrades.length}
              </span>
            </div>

            <div className="active-trades-list space-y-3">
              {activeTrades.map((trade) => {
                const currentPrice = currentPrices[trade.instrument]
                const isProfit = trade.pnl >= 0

                return (
                  <div
                    key={trade.id}
                    className="rounded-2xl p-4 animate-fade-in trade-card"
                    style={{
                      background: isProfit
                        ? 'linear-gradient(135deg, rgba(253,242,248,0.92), rgba(209,250,229,0.55), rgba(252,231,243,0.82))'
                        : 'linear-gradient(135deg, rgba(253,242,248,0.92), rgba(254,226,226,0.64), rgba(252,231,243,0.86))',
                      border: `1px solid ${isProfit ? 'rgba(236,72,153,0.22)' : 'rgba(244,63,94,0.26)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{
                            background: trade.direction === 'BUY'
                              ? 'linear-gradient(135deg, rgba(209,250,229,0.95), rgba(252,231,243,0.9))'
                              : 'linear-gradient(135deg, rgba(254,226,226,0.95), rgba(252,231,243,0.9))',
                            color: trade.direction === 'BUY' ? '#065f46' : '#991b1b',
                          }}
                        >
                          {trade.direction}
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#3d1a2e' }}>
                          {trade.instrument}
                        </span>
                      </div>
                      <span
                        className="text-lg font-bold"
                        style={{ color: isProfit ? '#10b981' : '#f43f5e' }}
                      >
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: 'Entry', value: trade.entryPrice },
                        { label: 'Current', value: currentPrice },
                        { label: 'Lot', value: trade.lotSize },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="text-xs mb-0.5" style={{ color: '#c084ab' }}>{item.label}</p>
                          <p className="text-xs font-semibold" style={{ color: '#3d1a2e' }}>
                            {typeof item.value === 'number' && item.label !== 'Lot'
                              ? item.value.toFixed(trade.instrument === 'BTCUSD' || trade.instrument === 'NASDAQ' || trade.instrument === 'XAUUSD' ? 2 : 5)
                              : item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex justify-between px-2 py-1 rounded-lg" style={{ background: 'rgba(254,202,202,0.3)' }}>
                        <span style={{ color: '#9b7280' }}>SL</span>
                        <span className="font-medium" style={{ color: '#dc2626' }}>{trade.stopLoss.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between px-2 py-1 rounded-lg" style={{ background: 'rgba(167,243,208,0.3)' }}>
                        <span style={{ color: '#9b7280' }}>TP</span>
                        <span className="font-medium" style={{ color: '#059669' }}>{trade.takeProfit.toFixed(5)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs" style={{ color: '#c084ab' }}>PnL %</span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: isProfit ? '#10b981' : '#f43f5e' }}
                      >
                        {isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                      </span>
                    </div>

                    <button
                      onClick={() => closeTrade(trade.id, currentPrice)}
                      className="w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:opacity-90"
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        color: '#be185d',
                        border: '1px solid rgba(236,72,153,0.38)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.75)',
                      }}
                    >
                      Close Trade
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="glass-card p-5 panel-card session-stats-card">
          <div className="flex items-center gap-2 mb-3">
            <span>MPM</span>
            <h3 className="text-sm font-bold gradient-text-soft">Session Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Active Trades',
                value: activeTrades.length,
                color: '#be185d',
              },
              {
                label: 'Float PnL',
                value: `${activeTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? '+' : ''}$${activeTrades.reduce((s, t) => s + t.pnl, 0).toFixed(2)}`,
                color: activeTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? '#10b981' : '#f43f5e',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="stat-card text-center"
                style={{ padding: '0.75rem' }}
              >
                <p className="text-xs mb-1" style={{ color: '#c084ab' }}>{stat.label}</p>
                <p className="text-base font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
