import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-[28px] border border-[#1F1F23] bg-[#111113] shadow-[0_32px_120px_-72px_rgba(0,0,0,0.85)]',
        className
      )}
      {...props}
    />
  )
}
