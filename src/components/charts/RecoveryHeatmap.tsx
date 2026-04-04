'use client'

/**
 * RecoveryHeatmap
 *
 * Displays muscle recovery status as a visual heatmap.
 * Color coding:
 * - Green (#10B981): 80-100% recovered
 * - Yellow (#F59E0B): 50-80% recovered
 * - Red (#EF4444): 0-50% (fatigued)
 *
 * Shows all 13 muscle groups from the recovery table.
 */

import { motion } from 'framer-motion'
import type { MuscleRecovery } from '@/types'

interface RecoveryHeatmapProps {
  recoveryData: MuscleRecovery[]
}

// Order muscles for visual layout (4 columns)
const MUSCLE_DISPLAY_ORDER: Array<MuscleRecovery['muscle_group']> = [
  'chest',
  'back',
  'shoulders',
  'traps',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'lower_back',
]

function getRecoveryColor(pct: number): string {
  if (pct >= 80) return '#10B981' // Emerald - fully recovered
  if (pct >= 50) return '#F59E0B' // Amber - partially recovered
  return '#EF4444' // Red - fatigued
}

function getRecoveryLabel(pct: number): string {
  if (pct >= 80) return 'Ready'
  if (pct >= 50) return 'Recovering'
  return 'Fatigued'
}

export function RecoveryHeatmap({ recoveryData }: RecoveryHeatmapProps) {
  // Map recovery data by muscle group for easy lookup
  const recoveryMap = new Map(recoveryData.map((r) => [r.muscle_group, r]))

  // Get ordered recovery data, missing muscles default to 100%
  const orderedRecovery = MUSCLE_DISPLAY_ORDER.map(
    (muscle) =>
      recoveryMap.get(muscle) ?? {
        user_id: '',
        muscle_group: muscle,
        last_trained_at: null,
        estimated_recovery_pct: 100,
        sets_this_week: 0,
        updated_at: new Date().toISOString(),
      }
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="rounded-xl border border-[#1A1A1F] bg-[#111113] p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F5F5F4]">Muscle Recovery</h3>
        <p className="mt-0.5 text-xs text-[#6B6B68]">
          How recovered each muscle group is from today&apos;s training
        </p>
      </div>

      <motion.div
        className="grid grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {orderedRecovery.map((recovery) => {
          const color = getRecoveryColor(recovery.estimated_recovery_pct)
          const label = getRecoveryLabel(recovery.estimated_recovery_pct)

          return (
            <motion.div
              key={recovery.muscle_group}
              variants={itemVariants}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: color }}
              >
                <span className="text-xs font-bold text-white">
                  {Math.round(recovery.estimated_recovery_pct)}%
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-[#F5F5F4] capitalize">
                  {recovery.muscle_group.replace('_', ' ')}
                </p>
                <p className="text-xs text-[#6B6B68]">{label}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Legend */}
      <div className="mt-6 flex gap-4 border-t border-[#1A1A1F] pt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#10B981' }} />
          <span className="text-xs text-[#A1A19E]">80%+ Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#F59E0B' }} />
          <span className="text-xs text-[#A1A19E]">50-80% Recovering</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#EF4444' }} />
          <span className="text-xs text-[#A1A19E]">0-50% Fatigued</span>
        </div>
      </div>
    </div>
  )
}
