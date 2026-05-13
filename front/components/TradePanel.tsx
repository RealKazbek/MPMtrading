'use client'

import { useShallow } from 'zustand/react/shallow'
import { formatPercent, formatPrice, formatTradeDate } from '@/lib/format'
import InlineMessage from '@/components/ui/InlineMessage'
import Skeleton from '@/components/ui/Skeleton'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { useTradingStore, type Instrument } from '@/store/tradingStore'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (instrument: Instrument) => void
}

export default function TradePanel({ selectedInstrument, onInstrumentChange }: Props) {
  const { dashboardState, market } = useTradingStore(
    useShallow((state) => ({
      dashboardState: state.dashboardState,
      market: state.market,
    }))
  )
  const selectedMarket = market.find((item) => item.symbol === selectedInstrument)

  return (
    <div className="dashboard-panel-scroll">
      {dashboardState.isLoading && market.length === 0 ? (
        <SurfaceCard>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </SurfaceCard>
      ) : dashboardState.error && market.length === 0 ? (
        <InlineMessage
          actionLabel="Повторить"
          description={dashboardState.error}
          onAction={() => {
            useTradingStore.getState().connectRealtime()
          }}
          title="Рынок недоступен"
          tone="danger"
        />
      ) : (
        <SurfaceCard muted className="surface-card-interactive">
          <div className="card-header">
            <div>
              <span className="eyebrow">Инструмент</span>
              <h2 className="section-title mt-3 text-[1.05rem]">{selectedMarket?.symbol ?? 'Ожидание'}</h2>
              <p className="section-subtitle">{selectedMarket?.displayName ?? 'Данные поступят после подключения.'}</p>
            </div>
            {selectedMarket ? (
              <div className={selectedMarket.change >= 0 ? 'badge-profit' : 'badge-loss'}>
                {formatPercent(selectedMarket.changePercent)}
              </div>
            ) : null}
          </div>

          {selectedMarket ? (
            <div className="market-summary-grid mt-5">
              {[
                { label: 'Цена', value: formatPrice(selectedMarket.price, selectedMarket.pricePrecision) },
                { label: 'Изменение', value: `${selectedMarket.change >= 0 ? '+' : ''}${selectedMarket.change.toFixed(selectedMarket.pricePrecision)}` },
                { label: 'Процент', value: formatPercent(selectedMarket.changePercent) },
                { label: 'Время', value: formatTradeDate(selectedMarket.timestamp) },
              ].map((item) => (
                <div key={item.label} className="rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] px-3 py-3">
                  <p className="metric-label">{item.label}</p>
                  <p className="metric-value mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </SurfaceCard>
      )}

      <SurfaceCard className="surface-card-interactive">
        <div className="card-header">
          <div>
            <h2 className="section-title">Лента рынка</h2>
            <p className="section-subtitle">Все инструменты обновляются через WebSocket.</p>
          </div>
          <span className="chip chip-active">{market.length} символа</span>
        </div>

        <div className="mt-4 table-wrap">
          <table className="trade-table trade-table-compact">
            <thead>
              <tr>
                <th>Символ</th>
                <th>Цена</th>
                <th>Изм.</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {market.map((item) => (
                <tr
                  key={item.symbol}
                  onClick={() => onInstrumentChange(item.symbol)}
                  className="cursor-pointer"
                >
                  <td className="font-semibold" data-label="Символ">{item.symbol}</td>
                  <td className="metric-value" data-label="Цена">{formatPrice(item.price, item.pricePrecision)}</td>
                  <td
                    className="metric-value"
                    data-label="Изм."
                    style={{ color: item.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                  >
                    {`${item.change >= 0 ? '+' : ''}${item.change.toFixed(item.pricePrecision)}`}
                  </td>
                  <td
                    className="metric-value"
                    data-label="%"
                    style={{ color: item.changePercent >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                  >
                    {formatPercent(item.changePercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  )
}
