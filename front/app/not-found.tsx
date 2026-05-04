import Link from 'next/link'
import type { CSSProperties } from 'react'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-tape not-found-tape-one">MPM RISK DESK // ROUTE VANISHED // АХАХА</div>
      <div className="not-found-tape not-found-tape-two">ORDER #404 REJECTED BY REALITY</div>

      <section className="not-found-card">
        <div className="not-found-terminal">
          <div className="not-found-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="not-found-chart">
            {Array.from({ length: 24 }).map((_, index) => (
              <i key={index} style={{ '--i': index } as CSSProperties} />
            ))}
          </div>
          <div className="not-found-gif" aria-hidden="true">
            <span>BUY</span>
            <span>SELL</span>
            <span>404</span>
          </div>
          <div className="not-found-liquidation">404</div>
        </div>

        <div className="not-found-copy">
          <p className="not-found-kicker">Serik Perizat, у нас смешная свеча</p>
          <h1>Страница ушла в минус быстрее, чем SL.</h1>
          <p>
            Мы искали этот маршрут по всем таймфреймам, но рынок сказал: “нет такой позиции”.
            Зато dashboard живой, красивый и готов к новым сделкам.
          </p>

          <div className="not-found-actions">
            <Link href="/dashboard/" className="not-found-primary">
              Back to Dashboard
            </Link>
            <Link href="/history/" className="not-found-secondary">
              Trade History
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
