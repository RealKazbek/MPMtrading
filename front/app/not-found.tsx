import Link from 'next/link'
import type { CSSProperties } from 'react'
import SurfaceCard from '@/components/ui/SurfaceCard'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <SurfaceCard className="not-found-visual flex flex-col justify-between">
          <div>
            <span className="eyebrow">Маршрут</span>
            <p className="not-found-code mt-5">404</p>
            <p className="page-subtitle mt-4 max-w-none">
              Страница не найдена.
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
          <span className="eyebrow">Навигация</span>
          <h1 className="page-title mt-5 max-w-[12ch]">Запрошенная страница недоступна.</h1>
          <p className="page-subtitle">
            Вернитесь в терминал или откройте журнал сделок.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/" className="surface-button">
              В терминал
            </Link>
            <Link href="/history/" className="surface-button-ghost">
              Открыть историю
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </main>
  )
}
