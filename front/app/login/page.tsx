'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    await new Promise((res) => setTimeout(res, 1200))
    router.push('/dashboard/')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fff1f2 70%, #fdf2f8 100%)',
      }}
    >
      <div
        className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f9a8d4, transparent)' }}
      />
      <div
        className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fb7185, transparent)' }}
      />
      <div
        className="absolute top-1/2 left-8 w-40 h-40 rounded-full opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }}
      />

      <span className="petal top-12 left-1/4 opacity-50" />
      <span className="petal top-20 right-1/3 opacity-40" style={{ animationDelay: '1s' }} />
      <span className="petal bottom-20 left-1/3 opacity-40" style={{ animationDelay: '0.5s' }} />
      <span className="petal bottom-32 right-1/4 opacity-35" style={{ animationDelay: '2s' }} />

      <div
        className="glass-card p-10 w-full max-w-md animate-fade-in relative z-10"
        style={{ boxShadow: '0 20px 60px rgba(244,114,182,0.2), 0 0 0 1px rgba(249,168,212,0.3)' }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #f472b6, #f43f5e)',
              boxShadow: '0 8px 25px rgba(244,114,182,0.45)',
            }}
          >
            <span className="text-xl font-black text-white">M</span>
          </div>
          <h1
            className="text-3xl font-bold gradient-text"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            MPM Trading
          </h1>
          <p className="text-sm mt-1" style={{ color: '#c084ab' }}>
            Serik Perizat workspace
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9d174d' }}>
              Email address
            </label>
            <input
              type="email"
              className="input-pink"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9d174d' }}>
              Password
            </label>
            <input
              type="password"
              className="input-pink"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div
              className="text-sm text-center py-2 px-4 rounded-xl"
              style={{ background: 'rgba(254,202,202,0.5)', color: '#b91c1c' }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#be185d' }}>
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <button type="button" className="hover:underline transition-all" style={{ color: '#f472b6' }}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
            style={{ padding: '0.875rem', borderRadius: '0.875rem' }}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>Sign In</>
            )}
          </button>
        </form>

        <div className="pink-divider mt-6" />

        <p className="text-center text-sm mt-4" style={{ color: '#c084ab' }}>
          Demo: use any email and password
        </p>
      </div>
    </div>
  )
}
