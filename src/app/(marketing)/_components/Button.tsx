import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { clsx } from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

const variants = {
  primary:
    'bg-[#CAFF4C] text-[#0A0A0B] shadow-[0_0_36px_rgba(202,255,76,0.2)] hover:-translate-y-0.5 hover:shadow-[0_0_44px_rgba(202,255,76,0.28)]',
  secondary:
    'border border-[#2A2A2F] bg-[#111113] text-[#F5F5F4] hover:border-[#CAFF4C] hover:text-[#CAFF4C]',
  ghost: 'text-[#F5F5F4] hover:text-[#CAFF4C]',
} as const

export function Button({ asChild = false, className, variant = 'primary', ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CAFF4C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
