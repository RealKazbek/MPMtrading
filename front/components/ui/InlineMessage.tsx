import { cn } from '@/lib/utils'

type InlineMessageProps = {
  actionLabel?: string
  className?: string
  description: string
  onAction?: () => void
  tone?: 'default' | 'danger'
  title: string
}

export default function InlineMessage({
  actionLabel,
  className,
  description,
  onAction,
  tone = 'default',
  title,
}: InlineMessageProps) {
  return (
    <div
      className={cn(
        'rounded-[12px] border px-4 py-3.5',
        tone === 'danger'
          ? 'border-[rgba(255,100,124,0.22)] bg-[var(--color-danger-soft)] text-[var(--color-text)]'
          : 'border-[var(--color-border)] bg-[rgba(127,147,170,0.08)] text-[var(--color-text)]',
        className
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-5 text-[var(--color-text-muted)]">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="surface-button-ghost mt-3">
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
