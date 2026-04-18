import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-marketing-border bg-marketing-bg-elevated shadow-surface',
        className
      )}
      {...props}
    />
  )
}
