'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { comparisonRows } from '../_content'

export function ComparisonTable() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-bg-elevated">
      <div className="grid border-b border-marketing-border bg-marketing-bg-tint md:grid-cols-2">
        <div className="px-6 py-5">
          <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
            FitBod
          </p>
          <p className="mt-2 text-lg font-medium text-marketing-text-primary">Rigid generator</p>
        </div>
        <div className="border-t border-marketing-border bg-marketing-accent-tint px-6 py-5 md:border-l md:border-t-0">
          <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-accent">
            KairoFit
          </p>
          <p className="mt-2 text-lg font-medium text-marketing-text-primary">
            Adaptive AI coaching
          </p>
        </div>
      </div>
      {comparisonRows.map((row, index) => (
        <motion.div
          key={row.fitbod}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
          className="grid border-t border-marketing-border md:grid-cols-2"
        >
          <div className="px-6 py-6 text-sm leading-7 text-marketing-text-secondary">
            {row.fitbod}
          </div>
          <div className="border-t border-marketing-border bg-marketing-accent-tint px-6 py-6 text-sm leading-7 text-marketing-text-primary md:border-l md:border-t-0">
            {row.kairofit}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
