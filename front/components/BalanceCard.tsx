'use client'

import { useTradingStore } from '@/store/tradingStore'

export default function BalanceCard() {
  const { balance, activeTrades, tradeHistory } = useTradingStore()
  const totalPnL = tradeHistory.reduce((s, t) => s + t.pnl, 0)
  const startBalance = 10000
  const growth = ((balance - startBalance) / startBalance) * 100

  return (
    <div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)',
        boxShadow: '0 8px 40px rgba(244,114,182,0.4)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.3)' }} />
      <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full opacity-10"
        style={{ background: 'rgba(255,255,255,0.5)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white text-opacity-80 text-sm">💰 Total Balance</span>
        </div>
        <p className="text-4xl font-bold text-white mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: growth >= 0 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
              color: 'white',
            }}
          >
            {growth >= 0 ? '+' : ''}{growth.toFixed(2)}% all time
          </span>
        </div>
      </div>
    </div>
  )
}
