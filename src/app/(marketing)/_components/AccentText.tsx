import type { ReactNode } from 'react'

export function AccentText({ children }: { children: ReactNode }) {
  return <span className="text-[#CAFF4C]">{children}</span>
}
