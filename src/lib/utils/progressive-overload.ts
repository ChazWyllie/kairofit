/**
 * Progressive Overload Calculator
 *
 * ALL deterministic workout progression logic lives here.
 * Kiro (Claude API) explains these decisions - this module makes them.
 *
 * Sources: Plotkin et al. (2022), Schoenfeld (2017), Helms (3DMJ Pyramid),
 * NSCA Guidelines, Israetel MEV/MAV/MRV framework.
 *
 * No em dashes. No motivational language. Pure calculation.
 */

import type { WorkoutSet, ExperienceLevel } from '@/types'

// ============================================================
// LINEAR PROGRESSION (levels 1-2: beginners)
// ============================================================

/**
 * Next session weight/reps using linear progression.
 * Add weight every session when target reps are hit.
 * Upper body: +2.5 kg (metric) / +5 lbs (imperial)
 * Lower body: +5 kg (metric) / +10 lbs (imperial)
 */
export function calculateLinearProgression(
  previousSets: WorkoutSet[],
  targetReps: number,
  isLowerBody: boolean,
  units: 'metric' | 'imperial' = 'metric'
): ProgressionResult {
  if (previousSets.length === 0) {
    return {
      action: 'maintain',
      suggested_weight: null,
      suggested_reps: targetReps,
      reason: 'No previous data - start with a comfortable weight.',
    }
  }

  const lastWeight = previousSets[previousSets.length - 1].weight_kg ?? 0
  const allSetsHitTarget = previousSets.every((s) => s.reps_completed >= targetReps)

  if (!allSetsHitTarget) {
    const avgReps = previousSets.reduce((sum, s) => sum + s.reps_completed, 0) / previousSets.length
    return {
      action: 'maintain',
      suggested_weight: lastWeight,
      suggested_reps: Math.round(avgReps) + 1,
      reason: `Did not hit all ${targetReps} target reps. Keep weight and aim for ${Math.round(avgReps) + 1} reps.`,
    }
  }

  // All sets hit target - increase weight
  // Imperial uses lbs increments (5 upper / 10 lower), NOT the same as metric 2.5/5 kg
  const increment = isLowerBody
    ? (units === 'metric' ? 5 : 10)
    : (units === 'metric' ? 2.5 : 5)

  return {
    action: 'increase_weight',
    suggested_weight: lastWeight + increment,
    suggested_reps: Math.max(targetReps - 2, 1),
    reason: `Hit all ${targetReps} reps. Adding ${increment}${units === 'metric' ? 'kg' : 'lbs'}.`,
  }
}

// ============================================================
// DOUBLE PROGRESSION (level 3: intermediate)
// ============================================================

/**
 * Next session targets using double progression.
 *
 * Phase 1: Keep weight, increase reps until all sets hit reps_max.
 * Phase 2: When all sets hit reps_max, increase weight ~5% and reset to reps_min.
 *
 * Example with 3x8-12 at 60kg:
 * Session 1: 60kg x 8, 8, 7  -> same weight, add reps
 * Session 4: 60kg x 12, 12, 12 -> ready to increase
 * Session 5: 62.5kg x 8, 8, 8 -> weight increased, reps reset
 */
export function calculateDoubleProgression(
  previousSets: WorkoutSet[],
  targetRepsMin: number,
  targetRepsMax: number,
  isLowerBody: boolean,
  units: 'metric' | 'imperial' = 'metric'
): ProgressionResult {
  if (previousSets.length === 0) {
    return {
      action: 'maintain',
      suggested_weight: null,
      suggested_reps: targetRepsMin,
      reason: 'No previous data - start with a comfortable weight targeting the bottom of the rep range.',
    }
  }

  const lastWeight = previousSets[previousSets.length - 1].weight_kg ?? 0
  const avgRepsCompleted =
    previousSets.reduce((sum, s) => sum + s.reps_completed, 0) / previousSets.length
  const allSetsHitMax = previousSets.every((s) => s.reps_completed >= targetRepsMax)

  if (allSetsHitMax) {
    // All sets hit reps_max - increase weight by ~5%, round to nearest increment
    const rawIncrease = lastWeight * 0.05
    const roundTo = units === 'metric' ? 2.5 : 5
    const increment = isLowerBody
      ? Math.max(roundTo * 2, roundToNearest(rawIncrease, roundTo))
      : Math.max(roundTo, roundToNearest(rawIncrease, roundTo))
    const newWeight = lastWeight + increment

    return {
      action: 'increase_weight',
      suggested_weight: newWeight,
      suggested_reps: targetRepsMin,
      reason: `Hit ${targetRepsMax} reps on all sets at ${lastWeight}${units === 'metric' ? 'kg' : 'lbs'}. Increasing to ${newWeight.toFixed(1)}${units === 'metric' ? 'kg' : 'lbs'} and resetting to ${targetRepsMin} reps.`,
    }
  }

  // Still building reps - suggest 1 more than average, capped at reps_max
  const suggestedReps = Math.min(Math.ceil(avgRepsCompleted) + 1, targetRepsMax)
  return {
    action: 'increase_reps',
    suggested_weight: lastWeight,
    suggested_reps: suggestedReps,
    reason: `Averaged ${avgRepsCompleted.toFixed(1)} reps. Aim for ${suggestedReps} reps at the same weight.`,
  }
}

// ============================================================
// RPE-BASED AUTOREGULATION (levels 4-5: advanced)
// ============================================================

/**
 * Next session targets using RPE autoregulation.
 *
 * Target zone: RPE 7-9 (1-3 reps in reserve)
 * RPE < 7: increase weight ~2.5%
 * RPE 7-9: maintain
 * RPE > 9: decrease weight ~5%
 *
 * Warmup sets are excluded from RPE averaging.
 * The imperial branch rounds to nearest 5 lbs, not 2.5 kg.
 */
export function calculateRPEProgression(
  previousSets: WorkoutSet[],
  targetRepsMin: number,
  targetRepsMax: number,
  units: 'metric' | 'imperial' = 'metric'
): ProgressionResult {
  const workingSets = previousSets.filter((s) => !s.is_warmup && s.rpe !== null)

  if (workingSets.length === 0) {
    return {
      action: 'maintain',
      suggested_weight: null,
      suggested_reps: Math.round((targetRepsMin + targetRepsMax) / 2),
      reason: 'No RPE data. Focus on the middle of your rep range with good form first.',
    }
  }

  const avgRPE = workingSets.reduce((sum, s) => sum + (s.rpe ?? 7), 0) / workingSets.length
  const lastWeight = workingSets[workingSets.length - 1].weight_kg ?? 0
  const targetReps = Math.round((targetRepsMin + targetRepsMax) / 2)

  if (avgRPE < 7) {
    // Too easy - increase weight ~2.5%
    // Imperial rounds to nearest 5 lbs (NOT 2.5 kg - different rounding unit)
    const rawIncrease = lastWeight * 0.025
    const roundTo = units === 'metric' ? 2.5 : 5
    const increase = Math.max(roundTo, roundToNearest(rawIncrease, roundTo))
    return {
      action: 'increase_weight',
      suggested_weight: lastWeight + increase,
      suggested_reps: targetReps,
      reason: `Average RPE ${avgRPE.toFixed(1)} is below target zone (7-9). Adding ~2.5% load.`,
    }
  }

  if (avgRPE > 9) {
    // Too hard - reduce weight ~5%
    const rawDecrease = lastWeight * 0.05
    const roundTo = units === 'metric' ? 2.5 : 5
    const decrease = Math.max(roundTo, roundToNearest(rawDecrease, roundTo))
    return {
      action: 'decrease_weight',
      suggested_weight: Math.max(lastWeight - decrease, 0),
      suggested_reps: targetRepsMin,
      reason: `Average RPE ${avgRPE.toFixed(1)} exceeds target zone. Reducing load ~5%. Consider a deload if this persists.`,
    }
  }

  return {
    action: 'maintain',
    suggested_weight: lastWeight,
    suggested_reps: targetReps,
    reason: `Average RPE ${avgRPE.toFixed(1)} is in the target zone (7-9). Maintain current load.`,
  }
}

// ============================================================
// SPLIT RECOMMENDATION
// ============================================================

/**
 * Recommend a training split based on days per week.
 * Research: no significant difference between splits when volume is equated.
 * Split is a scheduling preference, not a training ideology.
 */
export function recommendSplit(daysPerWeek: number): SplitRecommendation {
  const splits: Record<number, SplitRecommendation> = {
    2: {
      split_type: 'Full Body x2',
      description: '2 full body sessions per week',
      muscle_frequency: '2x/week per muscle group',
      rationale: 'Full body twice weekly ensures minimum effective frequency for every muscle with maximum recovery between sessions.',
      day_structure: [
        { day: 1, focus: 'Full Body A', emphasis: 'Compound-heavy, all movement patterns' },
        { day: 2, focus: 'Full Body B', emphasis: 'Compound-heavy, variation of Day 1' },
      ],
    },
    3: {
      split_type: 'Full Body x3',
      description: '3 full body sessions per week',
      muscle_frequency: '3x/week per muscle group',
      rationale: 'Full body 3x/week maximizes frequency for beginners and intermediates.',
      day_structure: [
        { day: 1, focus: 'Full Body A', emphasis: 'Squat pattern emphasis' },
        { day: 2, focus: 'Full Body B', emphasis: 'Hip hinge emphasis' },
        { day: 3, focus: 'Full Body C', emphasis: 'Upper body emphasis' },
      ],
    },
    4: {
      split_type: 'Upper/Lower x2',
      description: '2 upper and 2 lower body days',
      muscle_frequency: '2x/week per muscle group',
      rationale: 'Upper/Lower is the most efficient 4-day structure. Trains every muscle twice weekly while keeping sessions focused.',
      day_structure: [
        { day: 1, focus: 'Upper A', emphasis: 'Horizontal push and pull primary' },
        { day: 2, focus: 'Lower A', emphasis: 'Quad dominant primary' },
        { day: 3, focus: 'Upper B', emphasis: 'Vertical push and pull primary' },
        { day: 4, focus: 'Lower B', emphasis: 'Hip dominant primary' },
      ],
    },
    5: {
      split_type: 'PPLUL Hybrid',
      description: 'Push/Pull/Legs + Upper/Lower',
      muscle_frequency: '2-3x/week per muscle group',
      rationale: '5-day training works best as a 3+2 hybrid - three focused sessions and two full body sessions.',
      day_structure: [
        { day: 1, focus: 'Push', emphasis: 'Chest, shoulders, triceps' },
        { day: 2, focus: 'Pull', emphasis: 'Back, biceps' },
        { day: 3, focus: 'Legs', emphasis: 'Quads, hamstrings, glutes' },
        { day: 4, focus: 'Upper', emphasis: 'Full upper body, lighter' },
        { day: 5, focus: 'Lower', emphasis: 'Full lower body, lighter' },
      ],
    },
    6: {
      split_type: 'PPL x2',
      description: 'Push/Pull/Legs twice through',
      muscle_frequency: '2x/week per muscle group',
      rationale: 'PPL x2 trains each muscle twice weekly with enough recovery between similar sessions.',
      day_structure: [
        { day: 1, focus: 'Push A', emphasis: 'Chest primary, shoulders secondary' },
        { day: 2, focus: 'Pull A', emphasis: 'Back primary, biceps secondary' },
        { day: 3, focus: 'Legs A', emphasis: 'Quad dominant' },
        { day: 4, focus: 'Push B', emphasis: 'Shoulders primary, chest secondary' },
        { day: 5, focus: 'Pull B', emphasis: 'Back primary, biceps secondary' },
        { day: 6, focus: 'Legs B', emphasis: 'Hip dominant' },
      ],
    },
  }

  return splits[daysPerWeek] ?? splits[4]
}

// ============================================================
// DELOAD DETECTION
// ============================================================

/**
 * Determine if a deload is needed.
 *
 * This is the canonical implementation. The duplicate in workout-validator.ts
 * has been removed - import from here.
 *
 * Scheduled frequency (documented decisions, not ranges):
 * - Level 1-2: every 6 weeks
 * - Level 3: every 5 weeks
 * - Level 4-5: every 4 weeks
 *
 * Week-0 guard: a deload cannot trigger before any training has occurred.
 */
export function shouldDeload(
  weekNumber: number,
  experienceLevel: ExperienceLevel,
  recentPerformanceData: PerformanceTrend[]
): DeloadDecision {
  // Guard: week 0 (or negative) means the program has not started
  if (weekNumber <= 0) {
    return { needed: false, trigger: null, reason: null }
  }

  const deloadFrequency = experienceLevel <= 2 ? 6 : experienceLevel <= 3 ? 5 : 4

  if (weekNumber % deloadFrequency === 0) {
    return {
      needed: true,
      trigger: 'scheduled',
      reason: `Week ${weekNumber}: scheduled deload every ${deloadFrequency} weeks for level ${experienceLevel}.`,
    }
  }

  const stagnantExercises = recentPerformanceData.filter((d) => d.sessions_below_baseline >= 2)
  if (stagnantExercises.length >= 2) {
    return {
      needed: true,
      trigger: 'performance',
      reason: `${stagnantExercises.length} main lifts declined for 2+ sessions. Accumulated fatigue detected.`,
    }
  }

  return { needed: false, trigger: null, reason: null }
}

// ============================================================
// TYPES
// ============================================================

export interface ProgressionResult {
  action: 'increase_weight' | 'increase_reps' | 'decrease_weight' | 'maintain'
  suggested_weight: number | null
  suggested_reps: number
  reason: string
}

export interface SplitRecommendation {
  split_type: string
  description: string
  muscle_frequency: string
  rationale: string
  day_structure: Array<{ day: number; focus: string; emphasis: string }>
}

export interface DeloadDecision {
  needed: boolean
  trigger: 'scheduled' | 'performance' | null
  reason: string | null
}

export interface PerformanceTrend {
  exercise_id: string
  exercise_name: string
  sessions_below_baseline: number
  baseline_weight: number
  current_weight: number
}

// ============================================================
// HELPERS
// ============================================================

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest
}
