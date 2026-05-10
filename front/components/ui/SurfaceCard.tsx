import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SurfaceCardProps = ComponentPropsWithoutRef<'section'> & {
  children: ReactNode
  className?: string
  muted?: boolean
  padded?: boolean
}

export default function SurfaceCard({
  children,
  className,
  muted = false,
  padded = true,
  ...props
}: SurfaceCardProps) {
  return (
    <section
      {...props}
      className={cn(
        'surface-card',
        muted && 'surface-card-muted',
        padded && 'surface-card-padding',
        className
      )}
    >
      {children}
    </section>
  )
}
