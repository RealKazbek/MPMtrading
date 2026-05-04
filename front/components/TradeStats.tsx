'use client'

import { useTradingStore } from '@/store/tradingStore'

export default function TradeStats() {
  const { balance, activeTrades, tradeHistory } = useTradingStore()

  const totalPnL = tradeHistory.reduce((s, t) => s + t.pnl, 0)
  const wins = tradeHistory.filter((t) => t.result === 'WIN').length
  const winRate = tradeHistory.length > 0 ? (wins / tradeHistory.length) * 100 : 0
  const floatingPnL = activeTrades.reduce((s, t) => s + t.pnl, 0)

  const stats = [
    {
      label: 'Balance',
      value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'BAL',
      color: '#be185d',
      bg: 'rgba(253,242,248,0.8)',
    },
    {
      label: 'Total PnL',
      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`,
      icon: 'PNL',
      color: totalPnL >= 0 ? '#10b981' : '#f43f5e',
      bg: totalPnL >= 0 ? 'rgba(209,250,229,0.5)' : 'rgba(254,226,226,0.5)',
    },
    {
      label: 'Floating PnL',
      value: `${floatingPnL >= 0 ? '+' : ''}$${floatingPnL.toFixed(2)}`,
      icon: 'FLT',
      color: floatingPnL >= 0 ? '#10b981' : '#f43f5e',
      bg: floatingPnL >= 0 ? 'rgba(209,250,229,0.4)' : 'rgba(254,226,226,0.4)',
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: 'WIN',
      color: '#f472b6',
      bg: 'rgba(253,242,248,0.8)',
    },
  ]

  return (
    <div className="stats-grid grid grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="stat-card stat-card-animated flex items-center gap-3"
          style={{ background: stat.bg, animationDelay: `${index * 70}ms` }}
        >
          <span className="stat-token">{stat.icon}</span>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#c084ab' }}>
              {stat.label}
            </p>
            <p className="text-base font-bold" style={{ color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
