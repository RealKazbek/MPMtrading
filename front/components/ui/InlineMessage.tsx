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
        'rounded-[18px] border px-4 py-4',
        tone === 'danger'
          ? 'border-[rgba(239,71,111,0.18)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)]',
        className
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-inherit/80">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="surface-button-ghost mt-3">
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
