'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, formatPnL } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useTradingStore } from '@/store/tradingStore'

const links = [
  { href: '/dashboard/', label: 'Dashboard', short: 'Trade' },
  { href: '/history/', label: 'History', short: 'History' },
  { href: '/profile/', label: 'Profile', short: 'Profile' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { connectionStatus, summary } = useTradingStore(
    useShallow((state) => ({
      connectionStatus: state.connectionStatus,
      summary: state.summary,
    }))
  )

  const balance = summary?.balance ?? 0
  const floatingPnL = summary?.floatingPnl ?? 0
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [balanceChanged, setBalanceChanged] = useState<'up' | 'down' | null>(null)
  const previousBalance = useRef(balance)

  useEffect(() => {
    if (balance === previousBalance.current) {
      setDisplayBalance(balance)
      return
    }

    setBalanceChanged(balance > previousBalance.current ? 'up' : 'down')
    const start = previousBalance.current
    const end = balance
    const duration = 240
    const startedAt = performance.now()
    let frame = 0

    const tick = (time: number) => {
      const progress = Math.min((time - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayBalance(start + (end - start) * eased)

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      } else {
        setBalanceChanged(null)
      }
    }

    frame = window.requestAnimationFrame(tick)
    previousBalance.current = balance

    return () => window.cancelAnimationFrame(frame)
  }, [balance])

  const connectionTone = useMemo(() => {
    if (connectionStatus === 'LIVE') {
      return {
        dot: 'var(--color-success)',
        label: 'LIVE',
        text: 'text-[var(--color-success)]',
      }
    }

    if (connectionStatus === 'CONNECTING') {
      return {
        dot: 'var(--color-primary)',
        label: 'CONNECTING',
        text: 'text-[var(--color-primary)]',
      }
    }

    return {
      dot: 'var(--color-danger)',
      label: 'OFFLINE',
      text: 'text-[var(--color-danger)]',
    }
  }, [connectionStatus])

  return (
    <>
      <nav className="app-navbar">
        <div className="app-container flex min-h-[var(--navbar-height)] items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard/" className="flex items-center gap-3">
              <span className="app-logo">M</span>
              <div className="min-w-0">
                <p className="app-wordmark truncate">MPM Trading</p>
                <p className="truncate text-sm text-[var(--color-text-muted)]">
                  Premium execution workspace
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

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white/70 px-3 py-2 sm:flex">
              <span className="live-dot" style={{ background: connectionTone.dot, boxShadow: `0 0 0 6px color-mix(in srgb, ${connectionTone.dot} 12%, transparent)` }} />
              <span className={cn('text-xs font-semibold tracking-[0.16em]', connectionTone.text)}>
                {connectionTone.label}
              </span>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-white/80 px-3 py-2 shadow-[var(--shadow-xs)]">
              <p className="metric-label">Balance</p>
              <p
                className="metric-value text-sm font-semibold"
                style={{
                  color:
                    balanceChanged === 'up'
                      ? 'var(--color-success)'
                      : balanceChanged === 'down'
                        ? 'var(--color-danger)'
                        : 'var(--color-text)',
                }}
              >
                {summary ? `$${formatCurrency(displayBalance)}` : '--'}
              </p>
            </div>

            <div className="hidden rounded-[16px] border border-[var(--color-border)] bg-white/80 px-3 py-2 shadow-[var(--shadow-xs)] sm:block">
              <p className="metric-label">Floating</p>
              <p
                className="metric-value text-sm font-semibold"
                style={{
                  color: floatingPnL >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {summary ? formatPnL(floatingPnL) : '--'}
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
                className={cn(
                  'nav-link min-h-[3rem] px-3 text-xs font-semibold',
                  active && 'nav-link-active'
                )}
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
