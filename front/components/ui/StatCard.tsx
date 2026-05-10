import type { ReactNode } from 'react'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: string
  icon: string
  tone?: 'default' | 'success' | 'danger'
  helper?: string
  className?: string
  aside?: ReactNode
}

const toneClasses = {
  default: 'text-[var(--color-text)]',
  success: 'text-[var(--color-success)]',
  danger: 'text-[var(--color-danger)]',
}

export default function StatCard({
  label,
  value,
  icon,
  tone = 'default',
  helper,
  className,
  aside,
}: StatCardProps) {
  return (
    <SurfaceCard className={cn('stat-card', className)}>
      <span className="stat-token">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="metric-label">{label}</p>
          {aside}
        </div>
        <p className={cn('metric-value mt-2 text-lg font-semibold break-words', toneClasses[tone])}>
          {value}
        </p>
        {helper ? <p className="mt-1 text-xs text-[var(--color-text-soft)]">{helper}</p> : null}
      </div>
    </SurfaceCard>
  )
}
