'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTradingStore } from '@/store/tradingStore'
import { useEffect, useRef, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { balance, activeTrades } = useTradingStore()
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [balanceChanged, setBalanceChanged] = useState<'up' | 'down' | null>(null)
  const prevRef = useRef(balance)

  const floatingPnL = activeTrades.reduce((sum, t) => sum + t.pnl, 0)
  const totalEquity = balance + floatingPnL

  useEffect(() => {
    if (balance !== prevRef.current) {
      setBalanceChanged(balance > prevRef.current ? 'up' : 'down')
      const interval = setInterval(() => {
        setDisplayBalance((d) => {
          const diff = balance - d
          if (Math.abs(diff) < 0.01) {
            clearInterval(interval)
            setBalanceChanged(null)
            return balance
          }
          return d + diff * 0.15
        })
      }, 16)
      prevRef.current = balance
      return () => clearInterval(interval)
    }
  }, [balance])

  useEffect(() => {
    setDisplayBalance(balance)
  }, [balance])

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/history', label: 'History' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav
      className="app-navbar sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(249,168,212,0.3)',
        boxShadow: '0 4px 20px rgba(244,114,182,0.08)',
      }}
    >
      <Link href="/dashboard/" className="navbar-brand flex items-center gap-2.5 group">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #f472b6, #f43f5e)',
            boxShadow: '0 4px 12px rgba(244,114,182,0.4)',
          }}
        >
          <span className="text-sm font-black text-white">M</span>
        </div>
        <span
          className="text-lg font-bold gradient-text"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          MPM Trading
        </span>
      </Link>

      <div className="navbar-links flex items-center gap-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname === `${link.href}/`
          return (
            <Link
              key={link.href}
              href={`${link.href}/`}
              className="nav-link flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(244,63,94,0.1))',
                      color: '#be185d',
                      boxShadow: '0 2px 8px rgba(244,114,182,0.2)',
                    }
                  : { color: '#c084ab' }
              }
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      <div className="navbar-account flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="live-dot" />
          <span className="text-xs font-medium" style={{ color: '#10b981' }}>LIVE</span>
        </div>

        <div
          className="px-4 py-2 rounded-2xl transition-all duration-300"
          style={{
            background: 'rgba(253,242,248,0.9)',
            border: '1px solid rgba(249,168,212,0.4)',
            boxShadow: balanceChanged
              ? balanceChanged === 'up'
                ? '0 0 12px rgba(16,185,129,0.3)'
                : '0 0 12px rgba(244,63,94,0.3)'
              : 'none',
          }}
        >
          <p className="text-xs font-medium mb-0.5" style={{ color: '#c084ab' }}>
            Balance
          </p>
          <p
            className="text-sm font-bold transition-all"
            style={{
              color:
                balanceChanged === 'up'
                  ? '#10b981'
                  : balanceChanged === 'down'
                  ? '#f43f5e'
                  : '#be185d',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {activeTrades.length > 0 && (
          <div
            className="px-3 py-2 rounded-2xl"
            style={{
              background: floatingPnL >= 0 ? 'rgba(209,250,229,0.6)' : 'rgba(254,226,226,0.6)',
              border: `1px solid ${floatingPnL >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
            }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: '#6b7280' }}>
              Equity
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: floatingPnL >= 0 ? '#065f46' : '#991b1b' }}
            >
              ${totalEquity.toFixed(2)}
            </p>
          </div>
        )}

        <div
          className="user-avatar user-photo-avatar w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          title="Serik Perizat"
        >
          {/* <img src="/images/serik-perizat-avatar.png" alt="Serik Perizat" /> */}
        </div>
      </div>
    </nav>
  )
}
