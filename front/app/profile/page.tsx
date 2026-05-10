'use client'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import InlineMessage from '@/components/ui/InlineMessage'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/ui/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import StatCard from '@/components/ui/StatCard'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { formatCurrency, formatPnL } from '@/lib/format'
import { useTradingStore } from '@/store/tradingStore'

export default function ProfilePage() {
  const { achievements, loadProfile, profile, profileSettings, profileState, profileStats } = useTradingStore(
    useShallow((state) => ({
      achievements: state.achievements,
      loadProfile: state.loadProfile,
      profile: state.profile,
      profileSettings: state.profileSettings,
      profileState: state.profileState,
      profileStats: state.profileStats,
    }))
  )

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main page-stack">
        <PageHeader
          eyebrow="Profile"
          title="Trader profile"
          subtitle="Core identity, performance summary and account preferences wrapped in the same restrained surface system."
        />

        {profileState.error && !profile ? (
          <InlineMessage
            actionLabel="Retry"
            description={profileState.error}
            onAction={() => {
              void useTradingStore.getState().loadProfile()
            }}
            title="Profile unavailable"
            tone="danger"
          />
        ) : null}

        <SurfaceCard muted>
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="app-logo h-16 w-16 rounded-[20px] text-xl">SP</div>
            <div className="min-w-0">
              <h2 className="section-title text-[1.3rem]">{profile?.name ?? 'Loading profile'}</h2>
              <p className="section-subtitle">{profile?.email ?? 'Waiting for backend response'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip chip-active">{profile?.tier ?? 'Tier pending'}</span>
                <span className="chip">{profile?.memberSince ? `Member since ${profile.memberSince}` : 'Member since --'}</span>
              </div>
            </div>
            <div className="md:ml-auto md:text-right">
              <p className="metric-label">Portfolio balance</p>
              <p className="metric-value mt-2 text-[2rem] font-semibold">
                {profileStats ? `$${formatCurrency(profileStats.balance)}` : '--'}
              </p>
            </div>
          </div>
        </SurfaceCard>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {profileState.isLoading && !profileStats
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="surface-card surface-card-padding stat-card">
                  <Skeleton className="h-10 w-10 rounded-[14px]" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-6 w-24" />
                  </div>
                </div>
              ))
            : profileStats
              ? (
                <>
                  <StatCard label="Balance" value={`$${formatCurrency(profileStats.balance)}`} helper="Current account value" icon="BAL" />
                  <StatCard label="Total PnL" value={formatPnL(profileStats.totalPnl)} helper="All time" icon="PNL" tone={profileStats.totalPnl >= 0 ? 'success' : 'danger'} />
                  <StatCard label="Win rate" value={`${profileStats.winRate.toFixed(1)}%`} helper={`${profileStats.totalTrades} total trades`} icon="WIN" />
                  <StatCard label="Active trades" value={String(profileStats.activeTrades)} helper="Positions currently open" icon="LIV" />
                  <StatCard label="Avg win" value={`+$${profileStats.averageWin.toFixed(2)}`} helper="Per winning trade" icon="A+" tone="success" />
                  <StatCard label="Avg loss" value={`$${profileStats.averageLoss.toFixed(2)}`} helper="Per losing trade" icon="A-" tone="danger" />
                  <StatCard label="Total trades" value={String(profileStats.totalTrades)} helper="Closed positions" icon="TRD" />
                  <StatCard label="Profit factor" value={profileStats.profitFactor} helper="Avg win / avg loss" icon="PF" />
                </>
              )
              : null}
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard>
            <div className="card-header">
              <div>
                <h2 className="section-title">Achievements</h2>
                <p className="section-subtitle">Compact milestone markers without distracting visual noise.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-[18px] border px-4 py-4"
                  style={{
                    borderColor: achievement.earned ? 'rgba(239, 79, 136, 0.18)' : 'var(--color-border)',
                    background: achievement.earned ? 'rgba(239, 79, 136, 0.07)' : 'rgba(255, 255, 255, 0.6)',
                    color: achievement.earned ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                >
                  <p className="text-sm font-semibold">{achievement.label}</p>
                  <p className="mt-1 text-xs">{achievement.earned ? 'Unlocked' : achievement.description || 'In progress'}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="card-header">
              <div>
                <h2 className="section-title">Account settings</h2>
                <p className="section-subtitle">A simple settings summary with the new shared spacing system.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {profileSettings.map((setting) => (
                <div
                  key={setting.label}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--color-border)] bg-white/72 px-4 py-3"
                >
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">{setting.label}</span>
                  <span className="break-all text-sm font-medium">{setting.value}</span>
                </div>
              ))}
            </div>

            <button className="surface-button mt-5">Save changes</button>
          </SurfaceCard>
        </div>
      </main>
    </div>
  )
}
