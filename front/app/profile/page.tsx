'use client'

import Navbar from '@/components/Navbar'
import { useTradingStore } from '@/store/tradingStore'

export default function ProfilePage() {
  const { balance, activeTrades, tradeHistory } = useTradingStore()

  const wins = tradeHistory.filter((t) => t.result === 'WIN').length
  const losses = tradeHistory.filter((t) => t.result === 'LOSS')
  const totalPnL = tradeHistory.reduce((s, t) => s + t.pnl, 0)
  const winRate = tradeHistory.length > 0 ? (wins / tradeHistory.length) * 100 : 0
  const avgWin =
    wins > 0
      ? tradeHistory.filter((t) => t.result === 'WIN').reduce((s, t) => s + t.pnl, 0) / wins
      : 0
  const avgLoss =
    losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0

  const stats = [
    { label: 'Balance', value: `$${balance.toFixed(2)}`, icon: 'BAL', color: '#be185d', sub: 'Current balance' },
    { label: 'Total PnL', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, icon: 'PNL', color: totalPnL >= 0 ? '#10b981' : '#f43f5e', sub: 'All time' },
    { label: 'Total Trades', value: tradeHistory.length.toString(), icon: 'TRD', color: '#f472b6', sub: 'Completed' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: 'WIN', color: '#f472b6', sub: `${wins}W / ${losses.length}L` },
    { label: 'Avg Win', value: `+$${avgWin.toFixed(2)}`, icon: 'AVG+', color: '#10b981', sub: 'Per winning trade' },
    { label: 'Avg Loss', value: `$${avgLoss.toFixed(2)}`, icon: 'AVG-', color: '#f43f5e', sub: 'Per losing trade' },
    { label: 'Active Trades', value: activeTrades.length.toString(), icon: 'LIVE', color: '#be185d', sub: 'Open positions' },
    {
      label: 'Profit Factor',
      value: avgLoss !== 0 ? (Math.abs(avgWin) / Math.abs(avgLoss)).toFixed(2) : 'INF',
      icon: 'PF',
      color: '#f472b6',
      sub: 'Win/Loss ratio',
    },
  ]

  const achievements = [
    { icon: 'START', label: 'First Trade', earned: tradeHistory.length >= 1 },
    { icon: 'WIN', label: 'First Win', earned: wins >= 1 },
    { icon: '5W', label: '5 Wins', earned: wins >= 5 },
    { icon: 'STREAK', label: 'Win Streak', earned: winRate >= 60 },
    { icon: 'POWER', label: 'Power Trader', earned: tradeHistory.length >= 10 },
    { icon: 'PROFIT', label: 'Profitable', earned: totalPnL > 0 },
  ]

  const settings = [
    { label: 'Display Name', value: 'Serik Perizat', icon: 'ID' },
    { label: 'Email', value: 'serik.perizat@mpm.trading', icon: 'MAIL' },
    { label: 'Account Type', value: 'Premium', icon: 'PLAN' },
    { label: 'Default Lot Size', value: '0.1', icon: 'LOT' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #f43f5e 100%)',
            boxShadow: '0 8px 40px rgba(244,114,182,0.35)',
          }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.4)', transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'rgba(255,255,255,0.5)', transform: 'translate(-20%, 30%)' }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className="user-avatar user-photo-avatar profile-avatar w-20 h-20 rounded-3xl flex items-center justify-center"
              title="Serik Perizat"
            >
              {/* <img src="/images/serik-perizat-avatar.png" alt="Serik Perizat" /> */}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Name Surname
              </h1>
              <p className="text-white text-opacity-80 text-sm mt-0.5">name.surname@mpm.trading</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span
                  className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
                >
                  Premium Trader
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  Member since Jan 2025
                </span>
              </div>
            </div>

            <div className="sm:ml-auto sm:text-right">
              <p className="text-white text-opacity-70 text-sm">Portfolio Balance</p>
              <p className="text-3xl font-bold text-white">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold gradient-text mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Trading Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="stat-token">{stat.icon}</span>
                  <span className="text-xs font-medium" style={{ color: '#c084ab' }}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-bold" style={{ color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#d8b4c8' }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-bold gradient-text mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className="text-center p-3 rounded-2xl transition-all duration-200"
                style={{
                  background: a.earned
                    ? 'linear-gradient(135deg, rgba(249,168,212,0.3), rgba(251,207,232,0.2))'
                    : 'rgba(243,244,246,0.5)',
                  border: a.earned
                    ? '1px solid rgba(244,114,182,0.3)'
                    : '1px solid rgba(229,231,235,0.5)',
                  opacity: a.earned ? 1 : 0.48,
                }}
              >
                <span className="stat-token mx-auto mb-2">{a.icon}</span>
                <p className="text-xs font-medium" style={{ color: a.earned ? '#be185d' : '#9ca3af' }}>
                  {a.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-bold gradient-text mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Account Settings
          </h2>
          <div className="space-y-3">
            {settings.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(253,242,248,0.7)', border: '1px solid rgba(249,168,212,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="stat-token">{item.icon}</span>
                  <span className="text-sm font-medium" style={{ color: '#9d174d' }}>
                    {item.label}
                  </span>
                </div>
                <span className="text-sm text-right" style={{ color: '#3d1a2e' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <button className="btn-primary mt-5 text-sm" style={{ padding: '0.75rem 2rem' }}>
            Save Changes
          </button>
        </section>
      </main>
    </div>
  )
}
