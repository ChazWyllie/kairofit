'use client'

/**
 * StreakMilestone
 *
 * Animated streak counter and milestone animation.
 * Shows current streak, celebrates milestones (every 7 days, 30 days, 100 days).
 *
 * Uses framer-motion for entrance animation.
 * Orange accent (#F97316) for streak numbers.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface StreakMilestoneProps {
  streak: number
  isMilestone: boolean
}

const MILESTONES = [7, 14, 30, 50, 100, 365]

function getMilestoneMessage(streak: number): string | null {
  if (!MILESTONES.includes(streak)) return null

  const messages: Record<number, string> = {
    7: 'One week of consistency!',
    14: 'Two weeks strong!',
    30: 'A full month of training!',
    50: 'Fifty days - you are unstoppable!',
    100: 'Century streak - legendary!',
    365: 'A full year of commitment!',
  }

  return messages[streak] ?? null
}

export function StreakMilestone({ streak, isMilestone }: StreakMilestoneProps) {
  const [showMilestone, setShowMilestone] = useState(false)
  const milestoneMessage = getMilestoneMessage(streak)

  useEffect(() => {
    if (isMilestone && milestoneMessage) {
      setShowMilestone(true)
      const timer = setTimeout(() => setShowMilestone(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [isMilestone, milestoneMessage])

  return (
    <div className="rounded-xl border border-[#1A1A1F] bg-[#111113] p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B68]">
          Training Streak
        </p>

        <motion.div
          className="mt-3 text-5xl font-bold text-[#F97316]"
          animate={showMilestone ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {streak}
        </motion.div>

        <p className="mt-1 text-sm text-[#A1A19E]">{streak === 1 ? 'day' : 'days'}</p>

        {/* Milestone celebration */}
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 rounded-lg bg-[#1A1A1F] p-3"
          >
            <p className="text-base font-semibold text-[#F97316]">{milestoneMessage}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
