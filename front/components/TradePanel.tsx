'use client'

import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import TradeForm from '@/components/TradeForm'
import ActiveTradesCard from '@/components/trade-panel/ActiveTradesCard'
import SessionStatsCard from '@/components/trade-panel/SessionStatsCard'
import TradeLauncherCard from '@/components/trade-panel/TradeLauncherCard'
import InlineMessage from '@/components/ui/InlineMessage'
import Skeleton from '@/components/ui/Skeleton'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { useTradingStore, type Instrument } from '@/store/tradingStore'

type Props = {
  selectedInstrument: Instrument
  onInstrumentChange: (instrument: Instrument) => void
}

export default function TradePanel({ selectedInstrument, onInstrumentChange }: Props) {
  const { activeTrades, closeTrade, currentPrices, dashboardState, tradeActionState } = useTradingStore(
    useShallow((state) => ({
      activeTrades: state.activeTrades,
      closeTrade: state.closeTrade,
      currentPrices: state.currentPrices,
      dashboardState: state.dashboardState,
      tradeActionState: state.tradeActionState,
    }))
  )

  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const currentPrice = currentPrices[selectedInstrument]
  const floatingPnL = useMemo(
    () => activeTrades.reduce((sum, trade) => sum + trade.pnl, 0),
    [activeTrades]
  )

  return (
    <div className="dashboard-panel-scroll">
      <TradeLauncherCard
        instrument={selectedInstrument}
        currentPrice={currentPrice}
        onOpen={() => setTradeModalOpen(true)}
      />

      {tradeModalOpen ? (
        <div
          className="trade-modal-backdrop"
          role="presentation"
          onClick={() => setTradeModalOpen(false)}
        >
          <SurfaceCard
            className="trade-modal"
            muted
            padded
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-header">
              <div>
                <span className="eyebrow">Execution ticket</span>
                <h2 className="section-title mt-3 text-[1.05rem]">Open new trade</h2>
                <p className="section-subtitle">Orders are now submitted directly to the backend API.</p>
              </div>
              <button
                type="button"
                className="surface-button-ghost h-11 w-11 shrink-0 rounded-full px-0"
                aria-label="Close trade modal"
                onClick={() => setTradeModalOpen(false)}
              >
                x
              </button>
            </div>
            <div className="mt-5">
              <TradeForm
                selectedInstrument={selectedInstrument}
                onInstrumentChange={onInstrumentChange}
                onOpened={() => setTradeModalOpen(false)}
              />
            </div>
          </SurfaceCard>
        </div>
      ) : null}

      {dashboardState.isLoading && activeTrades.length === 0 ? (
        <SurfaceCard>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </SurfaceCard>
      ) : dashboardState.error && activeTrades.length === 0 ? (
        <InlineMessage
          actionLabel="Retry"
          description={dashboardState.error}
          onAction={() => {
            void useTradingStore.getState().bootstrapDashboard()
          }}
          title="Trades unavailable"
          tone="danger"
        />
      ) : (
        <ActiveTradesCard
          activeTrades={activeTrades}
          currentPrices={currentPrices}
          closeTrade={closeTrade}
        />
      )}

      <SurfaceCard>
        <div className="card-header">
          <div>
            <h2 className="section-title">Session overview</h2>
            <p className="section-subtitle">Backend-sourced activity snapshot with live connection fallback.</p>
          </div>
        </div>

        {tradeActionState.error ? (
          <InlineMessage
            className="mt-4"
            description={tradeActionState.error}
            title="Last trade action failed"
            tone="danger"
          />
        ) : null}

        <div className="mt-4">
          <SessionStatsCard
            activeTradesCount={activeTrades.length}
            floatingPnL={floatingPnL}
          />
        </div>
      </SurfaceCard>
    </div>
  )
}
