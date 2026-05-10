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
      setError('Please fill in all fields')
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
              <span className="eyebrow">MPM Trading</span>
              <h1 className="page-title mt-5 max-w-[12ch]">
                Quiet premium trading interface for focused execution.
              </h1>
              <p className="page-subtitle">
                The workspace is intentionally restrained: softer tones, clearer hierarchy, and tighter mobile ergonomics without touching business logic.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Execution-first', 'Chart, orders and stats stay aligned without visual noise.'],
                ['Responsive by default', 'Touch targets, safe-area padding and stacked cards work naturally on phones.'],
                ['Stable rendering', 'Server redirect, font optimization and calmer layout reduce shift and hydration risk.'],
                ['Production-ready UI', 'Shared tokens, reusable cards and consistent controls keep the system coherent.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[18px] border border-[var(--color-border)] bg-white/72 p-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="w-full">
            <div className="mx-auto max-w-sm">
              <span className="app-logo">M</span>
              <h2 className="page-title mt-5 text-[2rem]">Sign in</h2>
              <p className="page-subtitle">
                Access the MPM workspace. Demo mode accepts any email and password.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <label className="block">
                  <span className="field-label">Email address</span>
                  <input
                    type="email"
                    className="surface-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="field-label">Password</span>
                  <input
                    type="password"
                    className="surface-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                {error ? (
                  <div className="rounded-[16px] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                    {error}
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="text-[var(--color-primary)]">
                    Forgot password
                  </button>
                </div>

                <button type="submit" disabled={loading} className="surface-button w-full">
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  )
}
