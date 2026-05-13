'use client'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Chart from '@/components/Chart'
import Navbar from '@/components/Navbar'
import TradePanel from '@/components/TradePanel'
import TradeStats from '@/components/TradeStats'
import InlineMessage from '@/components/ui/InlineMessage'
import PageHeader from '@/components/ui/PageHeader'
import { useTradingStore } from '@/store/tradingStore'

export default function DashboardPage() {
  const { connectRealtime, connectionStatus, dashboardState, selectedInstrument, setSelectedInstrument } = useTradingStore(
    useShallow((state) => ({
      connectRealtime: state.connectRealtime,
      connectionStatus: state.connectionStatus,
      dashboardState: state.dashboardState,
      selectedInstrument: state.selectedInstrument,
      setSelectedInstrument: state.setSelectedInstrument,
    }))
  )

  useEffect(() => {
    const disconnect = connectRealtime()
    return () => disconnect()
  }, [connectRealtime])

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main page-stack">
        <PageHeader
          eyebrow="MPM"
          title="Торговый терминал"
          subtitle="Учебный поток котировок через WebSocket без перезагрузки страницы."
        />

        {!dashboardState.isLoading || dashboardState.error ? (
          <InlineMessage
            className="surface-card-muted"
            description={
              connectionStatus === 'LIVE'
                ? 'Сервер отправляет новые цены каждые 1-2 секунды.'
                : connectionStatus === 'CONNECTING'
                  ? 'Устанавливаем WebSocket-соединение с сервером котировок.'
                  : 'Поток котировок сейчас недоступен.'
            }
            title={`Статус соединения: ${connectionStatus === 'LIVE' ? 'Подключено' : connectionStatus === 'CONNECTING' ? 'Подключение...' : 'Отключено'}`}
            tone={connectionStatus === 'OFFLINE' ? 'danger' : 'default'}
          />
        ) : null}

        <section className="dashboard-shell">
          <TradeStats />

          <div className="dashboard-grid">
            <div className="dashboard-chart">
              {selectedInstrument ? (
                <Chart
                  selectedInstrument={selectedInstrument}
                  onInstrumentChange={setSelectedInstrument}
                />
              ) : (
                <InlineMessage
                  description="Ожидаем первый снимок рынка от WebSocket-сервера."
                  title="Нет данных рынка"
                />
              )}
            </div>

            <aside className="dashboard-panel">
              {selectedInstrument ? (
                <TradePanel
                  selectedInstrument={selectedInstrument}
                  onInstrumentChange={setSelectedInstrument}
                />
              ) : (
                <InlineMessage
                  description="Таблица инструментов появится после первого сообщения сервера."
                  title="Ожидание потока"
                />
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}
