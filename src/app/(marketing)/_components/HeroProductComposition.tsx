'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ProductScreen, type ScreenName } from './ProductScreens'

const screens = ['today', 'log', 'chat', 'insights'] as const

export function HeroProductComposition() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const activeScreen: ScreenName = screens[index] ?? screens[0]

  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % screens.length)
    }, 4000)

    return () => window.clearInterval(timer)
  }, [reduceMotion])

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(202,255,76,0.12),transparent_62%)] blur-3xl" />
      <motion.div
        className="absolute -left-10 bottom-20 hidden rounded-lg border border-marketing-border-strong bg-marketing-bg-elevated/90 px-4 py-3 shadow-surface lg:block"
        {...(!reduceMotion ? { animate: { y: [0, -8, 0] } } : {})}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-marketing-text-muted">
          Kiro note
        </p>
        <p className="mt-2 max-w-[220px] text-sm leading-6 text-marketing-text-primary">
          You are 22g short on protein from yesterday. Today&apos;s meals adjusted.
        </p>
      </motion.div>
      <motion.div
        className="absolute -right-8 top-16 hidden rounded-lg border border-marketing-border-strong bg-marketing-bg-elevated/90 px-4 py-3 shadow-surface lg:block"
        {...(!reduceMotion ? { animate: { y: [0, 10, 0] } } : {})}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-marketing-text-muted">
          Streak
        </p>
        <p className="mt-2 font-mono text-2xl text-marketing-accent">11 day streak</p>
      </motion.div>
      <motion.div
        className="absolute right-0 top-1/2 hidden translate-x-1/3 rounded-lg border border-marketing-border-strong bg-marketing-bg-elevated/90 px-4 py-3 shadow-surface xl:block"
        {...(!reduceMotion ? { animate: { y: [0, -12, 0] } } : {})}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-marketing-text-muted">
          Progress
        </p>
        <p className="mt-2 text-sm text-marketing-text-primary">Workouts 4/5 this week</p>
      </motion.div>
      <div className="relative z-10">
        <ProductScreen screen={activeScreen} />
      </div>
    </div>
  )
}
