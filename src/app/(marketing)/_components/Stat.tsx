import type { ReactNode } from 'react'

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-marketing-border bg-marketing-bg-elevated p-6">
      <div className="font-mono text-mono-stat text-marketing-accent">{value}</div>
      <p className="mt-3 text-small text-marketing-text-secondary">{label}</p>
    </div>
  )
}
