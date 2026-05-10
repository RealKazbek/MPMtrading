import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton-block', className)} aria-hidden="true" />
}
