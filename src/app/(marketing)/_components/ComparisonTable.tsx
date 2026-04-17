'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { comparisonRows } from '../_content'

export function ComparisonTable() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#1F1F23] bg-[#111113]">
      <div className="grid border-b border-[#1F1F23] bg-[#0D0D10] md:grid-cols-2">
        <div className="px-6 py-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6B68]">FitBod</p>
          <p className="mt-2 text-lg font-medium text-[#F5F5F4]">Rigid generator</p>
        </div>
        <div className="border-t border-[#1F1F23] bg-[#CAFF4C14] px-6 py-5 md:border-l md:border-t-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#CAFF4C]">
            KairoFit
          </p>
          <p className="mt-2 text-lg font-medium text-[#F5F5F4]">Adaptive AI coaching</p>
        </div>
      </div>
      {comparisonRows.map((row, index) => (
        <motion.div
          key={row.fitbod}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
          className="grid border-t border-[#1F1F23] md:grid-cols-2"
        >
          <div className="px-6 py-6 text-sm leading-7 text-[#A1A19E]">{row.fitbod}</div>
          <div className="border-t border-[#1F1F23] bg-[#CAFF4C12] px-6 py-6 text-sm leading-7 text-[#F5F5F4] md:border-l md:border-t-0">
            {row.kairofit}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
