import Link from 'next/link'
import type { CSSProperties } from 'react'
import SurfaceCard from '@/components/ui/SurfaceCard'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <SurfaceCard className="not-found-visual flex flex-col justify-between">
          <div>
            <span className="eyebrow">Route error</span>
            <p className="not-found-code mt-5">404</p>
            <p className="page-subtitle mt-4 max-w-none">
              This route dropped out of the stack before the order could be filled.
            </p>
          </div>

          <div className="not-found-grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <i
                key={index}
                style={{ height: `${44 + ((index * 29) % 130)}px` } as CSSProperties}
              />
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col justify-center">
          <span className="eyebrow">Recovery</span>
          <h1 className="page-title mt-5 max-w-[12ch]">The page moved faster than your stop loss.</h1>
          <p className="page-subtitle">
            The good news: the dashboard is still intact, the journal is safe, and the rest of the workspace is ready for the next decision.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/" className="surface-button">
              Back to dashboard
            </Link>
            <Link href="/history/" className="surface-button-ghost">
              Open trade history
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </main>
  )
}
