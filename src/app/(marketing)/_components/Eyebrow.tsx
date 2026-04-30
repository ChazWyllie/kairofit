import type { ReactNode } from 'react'

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-mono-label uppercase tracking-[0.18em] text-marketing-accent">
      {children}
    </p>
  )
}
