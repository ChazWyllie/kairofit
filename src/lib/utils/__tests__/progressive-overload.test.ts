/**
 * Progressive Overload Tests
 *
 * These functions are pure and deterministic - no mocks needed.
 * They encode KairoFit's core programming science rules.
 * If these break, users get wrong weight/rep suggestions.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateLinearProgression,
  calculateDoubleProgression,
  calculateRPEProgression,
  recommendSplit,
  shouldDeload,
} from '../progressive-overload'
import type { WorkoutSet } from '@/types'
import type { ExperienceLevel } from '@/types'

// ============================================================
// LINEAR PROGRESSION
// ============================================================

describe('calculateLinearProgression', () => {
  it('returns maintain with null weight when no previous sets', () => {
    const result = calculateLinearProgression([], 8, false)
    expect(result.action).toBe('maintain')
    expect(result.suggested_weight).toBeNull()
  })

  it('increases upper body weight by 2.5 kg when all reps hit (metric)', () => {
    const sets = [
      {
        id: '1',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 1,
        reps_completed: 8,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
      {
        id: '2',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 2,
        reps_completed: 8,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
      {
        id: '3',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 3,
        reps_completed: 8,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
    ]
    const result = calculateLinearProgression(sets, 8, false, 'metric')
    expect(result.action).toBe('increase_weight')
    expect(result.suggested_weight).toBe(62.5)
  })

  it('increases lower body weight by 5 kg when all reps hit (metric)', () => {
    const sets = [
      {
        id: '1',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 1,
        reps_completed: 5,
        weight_kg: 100,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
    ]
    const result = calculateLinearProgression(sets, 5, true, 'metric')
    expect(result.action).toBe('increase_weight')
    expect(result.suggested_weight).toBe(105)
  })

  it('increases upper body weight by 5 lbs (not 2.5 kg) when in imperial', () => {
    const sets = [
      {
        id: '1',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 1,
        reps_completed: 8,
        weight_kg: 135,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
    ]
    const result = calculateLinearProgression(sets, 8, false, 'imperial')
    expect(result.action).toBe('increase_weight')
    expect(result.suggested_weight).toBe(140) // 135 + 5 lbs, not 137.5
  })

  it('maintains weight when not all sets hit target reps', () => {
    const sets = [
      {
        id: '1',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 1,
        reps_completed: 8,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
      {
        id: '2',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 2,
        reps_completed: 6,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      }, // missed
    ]
    const result = calculateLinearProgression(sets, 8, false)
    expect(result.action).toBe('maintain')
    expect(result.suggested_weight).toBe(60)
  })
})

// ============================================================
// DOUBLE PROGRESSION
// ============================================================

describe('calculateDoubleProgression', () => {
  it('suggests more reps when below reps_max', () => {
    const sets = [
      {
        id: '1',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 1,
        reps_completed: 8,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
      {
        id: '2',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 2,
        reps_completed: 9,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
    ]
    const result = calculateDoubleProgression(sets, 8, 12, false)
    expect(result.action).toBe('increase_reps')
    expect(result.suggested_weight).toBe(60)
    expect(result.suggested_reps).toBeLessThanOrEqual(12)
    expect(result.suggested_reps).toBeGreaterThan(9)
  })

  it('increases weight when all sets hit reps_max (metric upper)', () => {
    const sets = [
      {
        id: '1',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 1,
        reps_completed: 12,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
      {
        id: '2',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 2,
        reps_completed: 12,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
      {
        id: '3',
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: 3,
        reps_completed: 12,
        weight_kg: 60,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      },
    ]
    const result = calculateDoubleProgression(sets, 8, 12, false, 'metric')
    expect(result.action).toBe('increase_weight')
    expect(result.suggested_weight).toBeGreaterThan(60)
    // Should increase by ~5% = 3kg, rounded to nearest 2.5kg = 62.5
    expect(result.suggested_weight).toBe(62.5)
    // Reps reset to bottom of range
    expect(result.suggested_reps).toBe(8)
  })

  it('resets reps to reps_min after weight increase', () => {
    const sets = Array(3)
      .fill(null)
      .map((_, i) => ({
        id: String(i),
        session_id: 's',
        exercise_id: 'e',
        program_exercise_id: null,
        user_id: 'u',
        set_number: i + 1,
        reps_completed: 12,
        weight_kg: 80,
        rpe: null,
        is_warmup: false,
        is_dropset: false,
        logged_at: '',
      }))
    const result = calculateDoubleProgression(sets, 6, 12, false)
    expect(result.action).toBe('increase_weight')
    expect(result.suggested_reps).toBe(6)
  })

  it('returns maintain with null weight on no previous data', () => {
    const result = calculateDoubleProgression([], 8, 12, false)
    expect(result.action).toBe('maintain')
    expect(result.suggested_weight).toBeNull()
  })
})

// ============================================================
// SPLIT RECOMMENDATION
// ============================================================

describe('recommendSplit', () => {
  it('recommends Full Body x2 for 2 days', () => {
    const result = recommendSplit(2)
    expect(result.split_type).toContain('Full Body')
    expect(result.day_structure).toHaveLength(2)
  })

  it('recommends Upper/Lower for 4 days', () => {
    const result = recommendSplit(4)
    expect(result.split_type).toContain('Upper')
    expect(result.day_structure).toHaveLength(4)
  })

  it('recommends PPL x2 for 6 days', () => {
    const result = recommendSplit(6)
    expect(result.split_type).toContain('PPL')
    expect(result.day_structure).toHaveLength(6)
  })

  it('returns a fallback for unusual day counts', () => {
    const result = recommendSplit(7)
    expect(result).toBeDefined()
    expect(result.split_type).toBeTruthy()
  })

  it('every recommendation includes muscle frequency info', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const result = recommendSplit(days)
      expect(result.muscle_frequency).toContain('week')
    }
  })
})

// ============================================================
// DELOAD DETECTION
// ============================================================

describe('shouldDeload', () => {
  it('never triggers deload at week 0', () => {
    // Week 0 guard: program has not started yet
    const result = shouldDeload(0, 3, [])
    expect(result.needed).toBe(false)
  })

  it('never triggers deload at negative week numbers', () => {
    const result = shouldDeload(-1, 3, [])
    expect(result.needed).toBe(false)
  })

  it('triggers scheduled deload at week 5 for intermediate (level 3)', () => {
    const result = shouldDeload(5, 3 as ExperienceLevel, [])
    expect(result.needed).toBe(true)
    expect(result.trigger).toBe('scheduled')
  })

  it('triggers scheduled deload at week 6 for beginner (level 1)', () => {
    const result = shouldDeload(6, 1 as ExperienceLevel, [])
    expect(result.needed).toBe(true)
    expect(result.trigger).toBe('scheduled')
  })

  it('does NOT trigger deload at week 4 for intermediate', () => {
    const result = shouldDeload(4, 3 as ExperienceLevel, [])
    expect(result.needed).toBe(false)
  })

  it('triggers performance deload when 2+ exercises show stagnation', () => {
    const stagnantData = [
      {
        exercise_id: '1',
        exercise_name: 'Squat',
        sessions_below_baseline: 2,
        baseline_weight: 100,
        current_weight: 95,
      },
      {
        exercise_id: '2',
        exercise_name: 'Bench',
        sessions_below_baseline: 2,
        baseline_weight: 80,
        current_weight: 77,
      },
    ]
    const result = shouldDeload(2, 3 as ExperienceLevel, stagnantData)
    expect(result.needed).toBe(true)
    expect(result.trigger).toBe('performance')
  })

  it('does not trigger performance deload with only 1 stagnant exercise', () => {
    const data = [
      {
        exercise_id: '1',
        exercise_name: 'Squat',
        sessions_below_baseline: 2,
        baseline_weight: 100,
        current_weight: 95,
      },
    ]
    const result = shouldDeload(2, 3 as ExperienceLevel, data)
    expect(result.needed).toBe(false)
  })
})

// ============================================================
// RPE PROGRESSION
// ============================================================

describe('calculateRPEProgression', () => {
  function makeWorkingSet(rpe: number, weight_kg: number, reps_completed = 8): WorkoutSet {
    return {
      id: '1',
      session_id: 's',
      exercise_id: 'e',
      program_exercise_id: null,
      user_id: 'u',
      set_number: 1,
      reps_completed,
      weight_kg,
      rpe,
      is_warmup: false,
      is_dropset: false,
      logged_at: '',
    }
  }

  it('returns maintain with null weight when no previous sets', () => {
    const result = calculateRPEProgression([], 8, 12)
    expect(result.action).toBe('maintain')
    expect(result.suggested_weight).toBeNull()
  })

  it('excludes warmup sets from RPE averaging', () => {
    const sets = [
      { ...makeWorkingSet(10, 100), is_warmup: true }, // warmup - should be excluded
      makeWorkingSet(8, 100), // working set
    ]
    const result = calculateRPEProgression(sets, 8, 12)
    // Only the working set RPE (8) should count - in target zone
    expect(result.action).toBe('maintain')
  })

  it('returns maintain when no working sets have RPE data', () => {
    const sets = [{ ...makeWorkingSet(8, 60), rpe: null }]
    const result = calculateRPEProgression(sets, 8, 12)
    expect(result.action).toBe('maintain')
    expect(result.suggested_weight).toBeNull()
  })

  it('increases weight when average RPE is below 7', () => {
    const sets = [makeWorkingSet(6, 60), makeWorkingSet(6, 60)]
    const result = calculateRPEProgression(sets, 8, 12, 'metric')
    expect(result.action).toBe('increase_weight')
    expect(result.suggested_weight).toBeGreaterThan(60)
  })

  it('maintains weight when average RPE is in target zone (7-9)', () => {
    const sets = [makeWorkingSet(7, 80), makeWorkingSet(8, 80), makeWorkingSet(8, 80)]
    const result = calculateRPEProgression(sets, 6, 10, 'metric')
    expect(result.action).toBe('maintain')
    expect(result.suggested_weight).toBe(80)
  })

  it('decreases weight when average RPE exceeds 9', () => {
    const sets = [makeWorkingSet(10, 100), makeWorkingSet(10, 100)]
    const result = calculateRPEProgression(sets, 4, 6, 'metric')
    expect(result.action).toBe('decrease_weight')
    expect(result.suggested_weight).toBeLessThan(100)
  })

  it('rounds metric increase to nearest 2.5 kg', () => {
    const sets = [makeWorkingSet(6, 100)] // 100 * 2.5% = 2.5 kg
    const result = calculateRPEProgression(sets, 8, 12, 'metric')
    expect(result.action).toBe('increase_weight')
    // 100 + 2.5 = 102.5
    expect(result.suggested_weight).toBe(102.5)
  })

  it('rounds imperial increase to nearest 5 lbs, not 2.5 kg', () => {
    const sets = [makeWorkingSet(6, 135)] // 135 * 2.5% = 3.375 lbs -> rounds to 5
    const result = calculateRPEProgression(sets, 8, 12, 'imperial')
    expect(result.action).toBe('increase_weight')
    // Should be 135 + 5 = 140 (not 137.5 which would be metric rounding)
    expect(result.suggested_weight).toBe(140)
  })
})
