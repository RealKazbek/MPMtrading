'use client'

import Navbar from '@/components/Navbar'
import TradeTable from '@/components/TradeTable'
import { useTradingStore } from '@/store/tradingStore'

export default function HistoryPage() {
  const { tradeHistory } = useTradingStore()

  const wins = tradeHistory.filter((t) => t.result === 'WIN')
  const losses = tradeHistory.filter((t) => t.result === 'LOSS')
  const totalPnL = tradeHistory.reduce((s, t) => s + t.pnl, 0)
  const winRate = tradeHistory.length > 0 ? (wins.length / tradeHistory.length) * 100 : 0

  const summaryCards = [
    { label: 'Total Trades', value: tradeHistory.length.toString(), icon: 'ALL', color: '#be185d' },
    { label: 'Wins', value: wins.length.toString(), icon: 'WIN', color: '#10b981' },
    { label: 'Losses', value: losses.length.toString(), icon: 'LOSS', color: '#f43f5e' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: 'RATE', color: '#f472b6' },
    {
      label: 'Total PnL',
      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`,
      icon: 'PNL',
      color: totalPnL >= 0 ? '#10b981' : '#f43f5e',
    },
    {
      label: 'Avg PnL',
      value: tradeHistory.length
        ? `${totalPnL / tradeHistory.length >= 0 ? '+' : ''}$${(totalPnL / tradeHistory.length).toFixed(2)}`
        : '$0.00',
      icon: 'AVG',
      color: '#be185d',
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f472b6, #f43f5e)', boxShadow: '0 4px 15px rgba(244,114,182,0.4)' }}
          >
            <span className="text-sm font-black text-white">H</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trade History
            </h1>
            <p className="text-sm" style={{ color: '#c084ab' }}>
              Your complete trading record
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {summaryCards.map((card, index) => (
            <div
              key={card.label}
              className="stat-card stat-card-animated text-center"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <span className="stat-token mx-auto">{card.icon}</span>
              <p className="text-xs mt-1 mb-0.5" style={{ color: '#c084ab' }}>{card.label}</p>
              <p className="text-base font-bold" style={{ color: card.color, fontVariantNumeric: 'tabular-nums' }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {tradeHistory.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold gradient-text-soft">Win / Loss Ratio</h3>
              <span className="text-xs" style={{ color: '#c084ab' }}>
                {wins.length}W - {losses.length}L
              </span>
            </div>
            <div className="flex rounded-2xl overflow-hidden h-4">
              {wins.length > 0 && (
                <div
                  className="transition-all duration-500 flex items-center justify-center text-xs text-white font-bold"
                  style={{
                    width: `${winRate}%`,
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                />
              )}
              {losses.length > 0 && (
                <div
                  className="flex-1"
                  style={{ background: 'linear-gradient(90deg, #f43f5e, #e11d48)' }}
                />
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                {winRate.toFixed(1)}% Win
              </span>
              <span className="text-xs font-semibold" style={{ color: '#f43f5e' }}>
                {(100 - winRate).toFixed(1)}% Loss
              </span>
            </div>
          </div>
        )}

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold gradient-text">All Trades</h2>
            <span
              className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(244,114,182,0.12)', color: '#be185d' }}
            >
              {tradeHistory.length} trades
            </span>
          </div>
          <TradeTable trades={tradeHistory} showAll />
        </div>
      </main>
    </div>
  )
}
