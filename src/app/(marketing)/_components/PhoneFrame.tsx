import type { ReactNode } from 'react'
import { clsx } from 'clsx'

export function PhoneFrame({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'relative mx-auto w-full max-w-[340px] rounded-[40px] border border-marketing-border-strong bg-marketing-bg-deep p-3 shadow-[0_50px_140px_-70px_rgba(0,0,0,0.95)]',
        className
      )}
    >
      <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-marketing-bg-elevated" />
      <div className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-bg-layer">
        {children}
      </div>
    </div>
  )
}
