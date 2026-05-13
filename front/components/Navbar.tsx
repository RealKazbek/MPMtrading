'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { formatPercent, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useTradingStore } from '@/store/tradingStore'

const links = [
  { href: '/dashboard/', label: 'Терминал', short: 'Терминал' },
  { href: '/history/', label: 'История', short: 'История' },
  { href: '/profile/', label: 'Профиль', short: 'Профиль' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { connectionStatus, selectedInstrument, selectedQuote } = useTradingStore(
    useShallow((state) => ({
      connectionStatus: state.connectionStatus,
      selectedInstrument: state.selectedInstrument,
      selectedQuote: state.quotes[state.selectedInstrument],
    }))
  )

  const connectionTone = useMemo(() => {
    if (connectionStatus === 'LIVE') {
      return {
        dot: 'var(--color-success)',
        label: 'ПОДКЛЮЧЕНО',
        text: 'text-[var(--color-success)]',
      }
    }

    if (connectionStatus === 'CONNECTING') {
      return {
        dot: 'var(--color-primary)',
        label: 'ПОДКЛЮЧЕНИЕ...',
        text: 'text-[var(--color-primary)]',
      }
    }

    return {
      dot: 'var(--color-danger)',
      label: 'ОТКЛЮЧЕНО',
      text: 'text-[var(--color-danger)]',
    }
  }, [connectionStatus])

  return (
    <>
      <nav className="app-navbar">
        <div className="app-container mobile-header flex min-h-[var(--navbar-height)] items-center justify-between gap-3 py-2.5">
          <div className="mobile-brand flex min-w-0 items-center gap-3">
            <Link href="/dashboard/" className="flex min-w-0 items-center gap-3">
              <span className="app-logo">M</span>
              <div className="min-w-0">
                <p className="app-wordmark truncate">MPM Терминал</p>
                <p className="mobile-brand-sub truncate text-xs uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                  Учебный trading dashboard
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname === link.href.slice(0, -1)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn('nav-link text-sm font-medium', active && 'nav-link-active')}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="status-panel mobile-status flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-white/[0.03] px-2.5 py-2 sm:flex">
              <span className="live-dot" style={{ background: connectionTone.dot, boxShadow: `0 0 0 6px color-mix(in srgb, ${connectionTone.dot} 12%, transparent)` }} />
              <span className={cn('text-[11px] font-semibold tracking-[0.16em]', connectionTone.text)}>
                {connectionTone.label}
              </span>
            </div>

            <div className="nav-metric mobile-nav-metric rounded-[10px] border border-[var(--color-border)] bg-white/[0.03] px-3 py-2 shadow-[var(--shadow-xs)]">
              <p className="metric-label mobile-metric-label">Символ</p>
              <p className="metric-value mobile-metric-value text-sm font-semibold">
                {selectedInstrument || '--'}
              </p>
            </div>

            <div className="nav-metric hidden rounded-[10px] border border-[var(--color-border)] bg-white/[0.03] px-3 py-2 shadow-[var(--shadow-xs)] sm:block">
              <p className="metric-label">Цена / %</p>
              <p
                className="metric-value text-sm font-semibold"
                style={{
                  color: (selectedQuote?.changePercent ?? 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {selectedQuote ? `${formatPrice(selectedQuote.price, selectedQuote.pricePrecision)} · ${formatPercent(selectedQuote.changePercent)}` : '--'}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="mobile-bottom-nav md:hidden">
        <div className="mobile-bottom-nav-inner">
          {links.map((link) => {
            const active = pathname === link.href || pathname === link.href.slice(0, -1)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn('nav-link min-h-[3rem] px-3 text-xs font-semibold', active && 'nav-link-active')}
              >
                {link.short}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
