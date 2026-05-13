'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SurfaceCard from '@/components/ui/SurfaceCard'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    router.push('/dashboard/')
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1080px]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_420px]">
          <SurfaceCard muted className="hidden min-h-[560px] lg:flex lg:flex-col lg:justify-between">
            <div>
              <span className="eyebrow">MPM Terminal</span>
              <h1 className="page-title mt-5 max-w-[12ch]">
                Торговый терминал для сосредоточенной работы.
              </h1>
              <p className="page-subtitle">
                График, позиции и журнал в компактной профессиональной среде.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Исполнение', 'Быстрый доступ к графику, сделке и позициям.'],
                ['Структура', 'Данные выстроены по приоритету без лишнего текста.'],
                ['Мобильная версия', 'Компактные панели и аккуратная адаптация.'],
                ['Система UI', 'Единые карточки, поля и статусы по всему интерфейсу.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[12px] border border-[var(--color-border)] bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="w-full">
            <div className="mx-auto max-w-sm">
              <span className="app-logo">M</span>
              <h2 className="page-title mt-5 text-[2rem]">Вход</h2>
              <p className="page-subtitle">
                Демонстрационный доступ в терминал.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <label className="block">
                  <span className="field-label">Email</span>
                  <input
                    type="email"
                    className="surface-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="field-label">Пароль</span>
                  <input
                    type="password"
                    className="surface-input"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                {error ? (
                  <div className="rounded-[12px] border border-[rgba(255,100,124,0.22)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-text)]">
                    {error}
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Запомнить</span>
                  </label>
                  <button type="button" className="text-[var(--color-primary-hover)]">
                    Забыли пароль
                  </button>
                </div>

                <button type="submit" disabled={loading} className="surface-button w-full">
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </form>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  )
}
