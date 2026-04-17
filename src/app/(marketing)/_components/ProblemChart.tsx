'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function ProblemChart() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="rounded-[32px] border border-[#1F1F23] bg-[#111113] p-6">
      <div className="mb-6 flex items-center justify-between text-[12px] font-medium uppercase tracking-[0.14em]">
        <span className="text-[#6B6B68]">Rigid programs</span>
        <span className="text-[#CAFF4C]">KairoFit</span>
      </div>
      <svg viewBox="0 0 520 280" className="w-full">
        <defs>
          <linearGradient id="problem-chart-accent" x1="0" x2="1">
            <stop offset="0%" stopColor="#CAFF4C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#CAFF4C" stopOpacity="1" />
          </linearGradient>
        </defs>
        {Array.from({ length: 6 }).map((_, index) => (
          <line
            key={`grid-y-${index}`}
            x1="0"
            x2="520"
            y1={40 + index * 40}
            y2={40 + index * 40}
            stroke="#1F1F23"
          />
        ))}
        <motion.path
          d="M20 70 C110 68, 170 72, 230 74 C250 74, 268 78, 286 92 C300 105, 314 150, 328 220 C350 224, 402 226, 500 226"
          fill="none"
          stroke="#52525B"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.path
          d="M20 210 C86 194, 126 182, 178 186 C242 192, 270 154, 314 158 C370 164, 412 114, 500 84"
          fill="none"
          stroke="url(#problem-chart-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 1.3, delay: 0.1, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}
