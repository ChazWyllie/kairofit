/**
 * Progression Suggestion Query
 *
 * Orchestrates per-exercise progression for a single program day.
 * Deterministic - no AI involved. Kiro explains these decisions; this module makes them.
 *
 * Returns: Record<exerciseId, ProgressionResult>
 *
 * Architecture note: sessions.ts is already at the file-size limit, so orchestration
 * logic that combines multiple queries lives here in its own module.
 */

import { getProgramDay, getRecentPerformance } from './sessions'
import { getProfileForGeneration } from './profiles'
import {
  calculateLinearProgression,
  calculateDoubleProgression,
  calculateRPEProgression,
  type ProgressionResult,
} from '@/lib/utils/progressive-overload'
import type { ProgramExercise } from '@/types'

// Lower-body muscles - used to select the correct weight increment.
// Source: NSCA classification of lower extremity musculature.
const LOWER_BODY_MUSCLES = new Set([
  'quads',
  'quadriceps',
  'hamstrings',
  'glutes',
  'gluteus_maximus',
  'calves',
  'adductors',
  'abductors',
  'hip_flexors',
])

/**
 * True when any primary muscle of this exercise is a lower-body muscle.
 * Used to select the heavier weight increment for squats, RDLs, etc.
 */
export function isLowerBodyExercise(exercise: ProgramExercise['exercise']): boolean {
  if (!exercise?.primary_muscles) return false
  return exercise.primary_muscles.some((m) => LOWER_BODY_MUSCLES.has(m.toLowerCase()))
}

/**
 * Compute next-session weight and rep targets for every exercise in a program day.
 *
 * Returns an empty object when:
 * - The program day does not exist (wrong dayId or RLS denied)
 * - The user profile cannot be loaded
 *
 * Per exercise, the result is 'maintain' with suggested_weight=null when there is
 * no prior performance data (first time doing the exercise).
 */
export async function getProgressionSuggestionsForDay(
  userId: string,
  programDayId: string
): Promise<Record<string, ProgressionResult>> {
  const [programDay, profile] = await Promise.all([
    getProgramDay(programDayId),
    getProfileForGeneration(userId),
  ])

  if (!programDay || !profile) return {}

  const units = profile.preferred_units ?? 'metric'

  const results = await Promise.all(
    programDay.exercises.map(async (pe: ProgramExercise) => {
      const exerciseId = pe.exercise_id
      const recentSets = await getRecentPerformance(userId, exerciseId)
      const isLower = isLowerBodyExercise(pe.exercise)

      const suggestion = computeSuggestion(pe, recentSets, isLower, units)

      return [exerciseId, suggestion] as const
    })
  )

  return Object.fromEntries(results)
}

// ============================================================
// Internal helpers
// ============================================================

type Units = 'metric' | 'imperial'

function computeSuggestion(
  pe: ProgramExercise,
  recentSets: Awaited<ReturnType<typeof getRecentPerformance>>,
  isLower: boolean,
  units: Units
): ProgressionResult {
  const scheme = pe.progression_scheme
  const repsMin = pe.reps_min ?? 8
  const repsMax = pe.reps_max ?? 12

  switch (scheme) {
    case 'linear':
      // Linear uses a single fixed target rep count.
      // For fixed-rep exercises reps_min === reps_max; if they differ use reps_min.
      return calculateLinearProgression(recentSets, repsMin, isLower, units)

    case 'rpe_based':
      return calculateRPEProgression(recentSets, repsMin, repsMax, units)

    case 'double_progression':
    case 'dup':
    case 'block':
    default:
      return calculateDoubleProgression(recentSets, repsMin, repsMax, isLower, units)
  }
}
