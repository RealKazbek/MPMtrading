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
          eyebrow="Профиль"
          title="Профиль трейдера"
          subtitle="Счет, статистика и параметры аккаунта."
        />

        {profileState.error && !profile ? (
          <InlineMessage
            actionLabel="Повторить"
            description={profileState.error}
            onAction={() => {
              void useTradingStore.getState().loadProfile()
            }}
            title="Профиль недоступен"
            tone="danger"
          />
        ) : null}

        <SurfaceCard muted>
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="app-logo h-16 w-16 rounded-[16px] text-xl">SP</div>
            <div className="min-w-0">
              <h2 className="section-title text-[1.3rem]">{profile?.name ?? 'Загрузка профиля'}</h2>
              <p className="section-subtitle">{profile?.email ?? 'Ожидание ответа сервера'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip chip-active">{profile?.tier ?? 'Тариф уточняется'}</span>
                <span className="chip">{profile?.memberSince ? `С ${profile.memberSince}` : 'С --'}</span>
              </div>
            </div>
            <div className="md:ml-auto md:text-right">
              <p className="metric-label">Баланс портфеля</p>
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
                  <StatCard label="Баланс" value={`$${formatCurrency(profileStats.balance)}`} helper="Текущее значение счета" icon="BAL" />
                  <StatCard label="Общий PnL" value={formatPnL(profileStats.totalPnl)} helper="За весь период" icon="PNL" tone={profileStats.totalPnl >= 0 ? 'success' : 'danger'} />
                  <StatCard label="Винрейт" value={`${profileStats.winRate.toFixed(1)}%`} helper={`${profileStats.totalTrades} сделок`} icon="WIN" />
                  <StatCard label="Активные" value={String(profileStats.activeTrades)} helper="Открыто сейчас" icon="LIV" />
                  <StatCard label="Средний плюс" value={`+$${profileStats.averageWin.toFixed(2)}`} helper="На прибыльную сделку" icon="A+" tone="success" />
                  <StatCard label="Средний минус" value={`$${profileStats.averageLoss.toFixed(2)}`} helper="На убыточную сделку" icon="A-" tone="danger" />
                  <StatCard label="Всего сделок" value={String(profileStats.totalTrades)} helper="Закрытые позиции" icon="TRD" />
                  <StatCard label="Profit factor" value={profileStats.profitFactor} helper="Средний плюс / минус" icon="PF" />
                </>
              )
              : null}
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard>
            <div className="card-header">
              <div>
                <h2 className="section-title">Достижения</h2>
                <p className="section-subtitle">Ключевые этапы торговой активности.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-[12px] border px-4 py-4"
                  style={{
                    borderColor: achievement.earned ? 'rgba(127, 147, 170, 0.24)' : 'var(--color-border)',
                    background: achievement.earned ? 'rgba(127, 147, 170, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    color: achievement.earned ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                >
                  <p className="text-sm font-semibold">{achievement.label}</p>
                  <p className="mt-1 text-xs">{achievement.earned ? 'Получено' : achievement.description || 'В процессе'}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="card-header">
              <div>
                <h2 className="section-title">Параметры аккаунта</h2>
                <p className="section-subtitle">Текущие настройки профиля.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {profileSettings.map((setting) => (
                <div
                  key={setting.label}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">{setting.label}</span>
                  <span className="break-all text-sm font-medium">{setting.value}</span>
                </div>
              ))}
            </div>

            <button className="surface-button mt-5">Сохранить</button>
          </SurfaceCard>
        </div>
      </main>
    </div>
  )
}
