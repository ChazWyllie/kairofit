/**
 * Recovery Model - SRA Curve Implementation
 *
 * Models per-muscle recovery using the Stimulus-Recovery-Adaptation framework.
 * Used by: dashboard recovery heatmap, workout scheduling, deload detection.
 *
 * SRA curve recovery windows by muscle type:
 * - Small muscles (biceps, triceps, calves, side delts): 24-48 hours
 * - Medium muscles (chest, lats, front/rear delts): 48-72 hours
 * - Large muscles (quads, hamstrings, glutes): 72 hours
 * - Heavy compound pattern (deadlift SRA): 96-120 hours
 *
 * TODO: Implement full recovery calculation
 * This is a typed stub. All types and constants are correct.
 */

import type { MuscleGroup, MuscleRecovery } from '@/types'

// ============================================================
// RECOVERY WINDOWS BY MUSCLE
// ============================================================

// Hours until a muscle is fully recovered from a hard training session
const RECOVERY_HOURS: Record<MuscleGroup, number> = {
  // Small muscles with short SRA curves
  biceps: 48,
  triceps: 48,
  calves: 48,
  forearms: 36,

  // Medium muscles
  chest: 72,
  shoulders: 72,
  back: 72,
  traps: 72,
  abs: 48,

  // Large muscles with long SRA curves
  quads: 72,
  hamstrings: 72,
  glutes: 72,
  lower_back: 96,  // Also has CNS component similar to deadlift
}

// ============================================================
// MAIN RECOVERY CALCULATION
// ============================================================

/**
 * Calculate the estimated recovery percentage for a muscle group.
 *
 * Returns 0-100 where:
 * - 100 = fully recovered, ready for another hard session
 * - 50 = partially recovered, can train but at reduced capacity
 * - 0 = just trained, do not train this muscle again today
 *
 * TODO: Implement this function
 */
export function calculateRecoveryPct(
  muscleGroup: MuscleGroup,
  lastTrainedAt: Date | null,
  _setsTrainedInSession: number
): number {
  if (!lastTrainedAt) return 100  // Never trained = fully recovered

  const hoursSinceTraining = (Date.now() - lastTrainedAt.getTime()) / (1000 * 60 * 60)
  const fullRecoveryHours = RECOVERY_HOURS[muscleGroup]

  // TODO: Implement non-linear recovery curve
  // Simple linear model for now - replace with sigmoid or exponential
  const linearRecovery = Math.min(hoursSinceTraining / fullRecoveryHours, 1)
  return Math.round(linearRecovery * 100)
}

/**
 * Update muscle recovery state after a completed workout session.
 * Called after every session completion.
 *
 * Returns the updates to apply to the muscle_recovery table.
 *
 * TODO: Implement this function
 */
export function calculateRecoveryUpdates(
  completedSessionMuscles: Array<{ muscle: MuscleGroup; sets: number }>,
  completedAt: Date
): Array<{ muscle_group: MuscleGroup; last_trained_at: string; estimated_recovery_pct: number }> {
  // TODO: Implement
  return completedSessionMuscles.map(({ muscle }) => ({
    muscle_group: muscle,
    last_trained_at: completedAt.toISOString(),
    estimated_recovery_pct: 0,  // Just trained = 0% recovery
  }))
}

/**
 * Check if a muscle is ready to be trained (above minimum recovery threshold).
 * Used to enforce recovery windows in program scheduling.
 *
 * Minimum threshold: 50% recovery before training again.
 * Hard minimum: do not train the same primary muscle within 48 hours regardless of threshold.
 */
export function isMuscleReadyToTrain(
  recovery: MuscleRecovery,
  minimumPct: number = 50
): boolean {
  if (recovery.last_trained_at) {
    const hoursSince =
      (Date.now() - new Date(recovery.last_trained_at).getTime()) / (1000 * 60 * 60)

    // Use the muscle's actual recovery window, not a flat 48-hour floor.
    // lower_back needs 96 hours; quads need 72; biceps need 48.
    // A user who deadlifted 60 hours ago should NOT be cleared to train lower back again.
    const muscleRecoveryHours = RECOVERY_HOURS[recovery.muscle_group as MuscleGroup] ?? 48
    if (hoursSince < muscleRecoveryHours * 0.5) return false
  }

  return recovery.estimated_recovery_pct >= minimumPct
}

/**
 * Convert sleep range label to a numeric hours value for recovery modeling.
 * Converts the string range stored in profiles.sleep_hours_range to a number.
 */
export function sleepRangeToHours(sleepRange: string): number {
  const conversions: Record<string, number> = {
    '<5': 4.5,
    '5-6': 5.5,
    '7-8': 7.5,
    '>8': 8.5,
  }
  return conversions[sleepRange] ?? 7.5
}

/**
 * Calculate a recovery modifier based on sleep quality.
 * Poor sleep slows the SRA curve.
 *
 * Returns a multiplier: 1.0 = normal, <1.0 = slower recovery.
 */
export function getSleepRecoveryModifier(sleepHours: number): number {
  if (sleepHours >= 8) return 1.1   // Excellent sleep - slightly faster recovery
  if (sleepHours >= 7) return 1.0   // Good sleep - normal recovery
  if (sleepHours >= 6) return 0.85  // Adequate sleep - 15% slower
  if (sleepHours >= 5) return 0.7   // Poor sleep - 30% slower
  return 0.5                         // Very poor sleep - 50% slower
}
