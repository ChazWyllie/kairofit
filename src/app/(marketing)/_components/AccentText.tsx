import type { ReactNode } from 'react'

export function AccentText({ children }: { children: ReactNode }) {
  return <span className="text-marketing-accent">{children}</span>
}
