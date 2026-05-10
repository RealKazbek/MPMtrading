'use client'

import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Chart from '@/components/Chart'
import Navbar from '@/components/Navbar'
import TradePanel from '@/components/TradePanel'
import TradeStats from '@/components/TradeStats'
import PageHeader from '@/components/ui/PageHeader'
import InlineMessage from '@/components/ui/InlineMessage'
import { type Instrument } from '@/store/tradingStore'
import { useTradingStore } from '@/store/tradingStore'

export default function DashboardPage() {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('')
  const { bootstrapDashboard, connectionStatus, dashboardState, fetchCandles, instruments, startPolling, connectRealtime, subscribeSymbol } = useTradingStore(
    useShallow((state) => ({
      bootstrapDashboard: state.bootstrapDashboard,
      connectRealtime: state.connectRealtime,
      connectionStatus: state.connectionStatus,
      dashboardState: state.dashboardState,
      fetchCandles: state.fetchCandles,
      instruments: state.instruments,
      startPolling: state.startPolling,
      subscribeSymbol: state.subscribeSymbol,
    }))
  )

  const firstInstrument = instruments[0]?.symbol ?? ''
  const effectiveInstrument = selectedInstrument || firstInstrument

  useEffect(() => {
    void bootstrapDashboard()
    const disconnect = connectRealtime()
    return () => disconnect()
  }, [bootstrapDashboard, connectRealtime])

  useEffect(() => {
    if (!selectedInstrument && firstInstrument) {
      setSelectedInstrument(firstInstrument)
    }
  }, [firstInstrument, selectedInstrument])

  useEffect(() => {
    if (!effectiveInstrument) return
    void fetchCandles(effectiveInstrument)
    subscribeSymbol(effectiveInstrument)
  }, [effectiveInstrument, fetchCandles, subscribeSymbol])

  useEffect(() => {
    if (!effectiveInstrument) return
    if (connectionStatus === 'LIVE') return

    const stopPolling = startPolling(effectiveInstrument)
    return () => stopPolling()
  }, [connectionStatus, effectiveInstrument, startPolling])

  const connectionCopy = useMemo(() => {
    if (connectionStatus === 'LIVE') {
      return 'Realtime stream connected.'
    }

    if (connectionStatus === 'CONNECTING') {
      return 'Realtime stream is reconnecting. Polling fallback keeps the UI fresh.'
    }

    return 'Realtime stream offline. Polling fallback is active until the websocket returns.'
  }, [connectionStatus])

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main page-stack">
        <PageHeader
          eyebrow="Desk"
          title="Trading dashboard"
          subtitle="A calmer, tighter execution workspace built for fast reading, clean spacing, and dependable mobile use."
        />

        {!dashboardState.isLoading || dashboardState.error ? (
          <InlineMessage
            className="surface-card-muted"
            description={connectionCopy}
            title={`Connection status: ${connectionStatus}`}
            tone={connectionStatus === 'OFFLINE' ? 'danger' : 'default'}
          />
        ) : null}

        <section className="dashboard-shell">
          <TradeStats />

          <div className="dashboard-grid">
            <div className="dashboard-chart">
              {effectiveInstrument ? (
                <Chart
                  selectedInstrument={effectiveInstrument}
                  onInstrumentChange={setSelectedInstrument}
                />
              ) : (
                <InlineMessage
                  description="No instruments were returned by the backend snapshot."
                  title="No markets available"
                />
              )}
            </div>

            <aside className="dashboard-panel">
              {effectiveInstrument ? (
                <TradePanel
                  selectedInstrument={effectiveInstrument}
                  onInstrumentChange={setSelectedInstrument}
                />
              ) : (
                <InlineMessage
                  description="Trading controls will appear once the backend returns at least one instrument."
                  title="No execution instruments"
                />
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}
