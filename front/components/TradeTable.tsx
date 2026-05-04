'use client'

import { ClosedTrade } from '@/store/tradingStore'

type Props = {
  trades: ClosedTrade[]
  showAll?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function TradeTable({ trades, showAll = false }: Props) {
  const displayed = showAll ? trades : trades.slice(0, 5)

  if (displayed.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mt-3 text-sm" style={{ color: '#c084ab' }}>
          No trades yet - start trading!
        </p>
      </div>
    )
  }

  return (
    <div className="trade-table-wrap overflow-x-auto">
      <table className="trade-table w-full">
        <thead>
          <tr>
            {['Instrument', 'Dir', 'Entry', 'Exit', 'SL', 'TP', 'PnL ($)', 'PnL (%)', 'Result', 'Opened', 'Closed'].map(
              (h) => (
                <th key={h} className="text-left whitespace-nowrap">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {displayed.map((trade) => {
            const isWin = trade.result === 'WIN'
            return (
              <tr key={trade.id} className="transition-all duration-150">
                <td className="font-semibold" style={{ color: '#be185d' }}>
                  {trade.instrument}
                </td>
                <td>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{
                      background:
                        trade.direction === 'BUY'
                          ? 'rgba(209,250,229,0.6)'
                          : 'rgba(254,226,226,0.6)',
                      color:
                        trade.direction === 'BUY' ? '#065f46' : '#991b1b',
                    }}
                  >
                    {trade.direction}
                  </span>
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>
                  {trade.entryPrice.toFixed(4)}
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>
                  {trade.exitPrice.toFixed(4)}
                </td>
                <td className="text-xs" style={{ color: '#dc2626' }}>
                  {trade.stopLoss.toFixed(4)}
                </td>
                <td className="text-xs" style={{ color: '#059669' }}>
                  {trade.takeProfit.toFixed(4)}
                </td>
                <td className="font-bold" style={{ color: isWin ? '#10b981' : '#f43f5e', fontVariantNumeric: 'tabular-nums' }}>
                  {isWin ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                </td>
                <td style={{ color: isWin ? '#10b981' : '#f43f5e', fontVariantNumeric: 'tabular-nums' }}>
                  {isWin ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                </td>
                <td className="result-cell">
                  <span className={isWin ? 'badge-profit' : 'badge-loss'}>
                    {isWin ? 'Win' : 'Loss'}
                  </span>
                </td>
                <td className="text-xs whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDate(trade.openTime)}
                </td>
                <td className="text-xs whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDate(trade.closeTime)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
