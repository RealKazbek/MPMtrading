'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Chart from '@/components/Chart'
import TradePanel from '@/components/TradePanel'
import TradeStats from '@/components/TradeStats'
import { Instrument } from '@/store/tradingStore'

export default function DashboardPage() {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('EURUSD')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="dashboard-shell flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        {/* Stats Row */}
        <TradeStats />

        {/* Chart + Panel */}
        <div className="dashboard-grid flex-1 min-h-0 overflow-hidden">
          {/* Chart — 70% */}
          <div className="dashboard-chart min-w-0 min-h-0">
            <Chart
              selectedInstrument={selectedInstrument}
              onInstrumentChange={setSelectedInstrument}
            />
          </div>

          {/* Trade Panel — 30% */}
          <div className="dashboard-panel min-h-0 overflow-y-auto">
            <TradePanel
              selectedInstrument={selectedInstrument}
              onInstrumentChange={setSelectedInstrument}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
