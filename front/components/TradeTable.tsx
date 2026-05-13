'use client'

import { formatPercent, formatPrice, formatTradeDate } from '@/lib/format'
import type { ClosedTrade } from '@/store/tradingStore'

type Props = {
  trades: ClosedTrade[]
  showAll?: boolean
}

export default function TradeTable({ trades, showAll = false }: Props) {
  const displayed = showAll ? trades : trades.slice(0, 5)

  if (displayed.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Закрытых сделок пока нет.
        </p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="trade-table">
        <thead>
          <tr>
            {['Инструмент', 'Сторона', 'Вход', 'Выход', 'SL', 'TP', 'PnL', 'PnL %', 'Итог', 'Открыта', 'Закрыта'].map(
              (heading) => (
                <th key={heading}>{heading}</th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {displayed.map((trade) => {
            const isWin = trade.result === 'WIN'
            const directionClass =
              trade.direction === 'BUY' ? 'trade-pill trade-pill-buy' : 'trade-pill trade-pill-sell'

            return (
              <tr key={trade.id}>
                <td className="font-semibold">{trade.instrument}</td>
                <td>
                  <span className={directionClass}>
                    {trade.direction === 'BUY' ? 'BUY' : 'SELL'}
                  </span>
                </td>
                <td className="metric-value text-[var(--color-text-muted)]">
                  {formatPrice(trade.entryPrice)}
                </td>
                <td className="metric-value text-[var(--color-text-muted)]">
                  {formatPrice(trade.exitPrice)}
                </td>
                <td className="metric-value text-[var(--color-danger)]">
                  {formatPrice(trade.stopLoss)}
                </td>
                <td className="metric-value text-[var(--color-success)]">
                  {formatPrice(trade.takeProfit)}
                </td>
                <td
                  className="metric-value font-semibold"
                  style={{ color: isWin ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {`${trade.pnl >= 0 ? '+' : '-'}$${Math.abs(trade.pnl).toFixed(2)}`}
                </td>
                <td
                  className="metric-value"
                  style={{ color: isWin ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {formatPercent(trade.pnlPercent)}
                </td>
                <td>
                  <span className={isWin ? 'badge-profit' : 'badge-loss'}>
                    {isWin ? 'Плюс' : 'Минус'}
                  </span>
                </td>
                <td className="whitespace-nowrap text-xs text-[var(--color-text-muted)]">
                  {formatTradeDate(trade.openTime)}
                </td>
                <td className="whitespace-nowrap text-xs text-[var(--color-text-muted)]">
                  {formatTradeDate(trade.closeTime)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
