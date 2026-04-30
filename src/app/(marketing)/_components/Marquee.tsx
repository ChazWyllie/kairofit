'use client'

import { useReducedMotion } from 'framer-motion'

export function Marquee({ items }: { items: readonly string[] }) {
  const reduceMotion = useReducedMotion()
  const repeated = [...items, ...items]

  return (
    <div className="overflow-hidden border-y border-marketing-border bg-marketing-bg-tint py-4">
      <div
        className="flex min-w-max items-center gap-6 px-6"
        style={{
          animation: reduceMotion ? 'none' : 'marketing-marquee 34s linear infinite',
        }}
      >
        {repeated.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-6">
            <span className="text-sm text-marketing-text-primary">{item}</span>
            <span className="text-xs text-marketing-accent">●</span>
          </div>
        ))}
      </div>
    </div>
  )
}
