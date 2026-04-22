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
    'bg-marketing-accent text-marketing-accent-on shadow-accent-glow-sm hover:-translate-y-0.5 hover:shadow-accent-glow',
  secondary:
    'border border-marketing-border-strong bg-marketing-bg-elevated text-marketing-text-primary hover:border-marketing-accent hover:text-marketing-accent',
  ghost: 'text-marketing-text-primary hover:text-marketing-accent',
} as const

export function Button({ asChild = false, className, variant = 'primary', ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
