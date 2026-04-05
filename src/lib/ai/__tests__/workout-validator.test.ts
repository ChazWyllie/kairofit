/**
 * Workout Validator Tests
 *
 * The validator is the safety net between AI output and the user.
 * Every rule here maps directly to a research-backed constraint.
 * These tests are the specification for what "valid program" means.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateWorkoutProgram } from '../workout-validator'
import type { GeneratedProgram, ExperienceLevel, InjuryZone } from '@/types'
import { CONTRAINDICATIONS } from '@/lib/utils/contraindications'
import validProgram from './fixtures/valid-program.json'

// ============================================================
// TEST HELPERS
// ============================================================

function makeProgram(overrides: Partial<GeneratedProgram> = {}): GeneratedProgram {
  return { ...(validProgram as GeneratedProgram), ...overrides }
}

function makeExercise(overrides = {}) {
  return {
    exercise_name: 'Dumbbell Row',
    sets: 3,
    reps_min: 8,
    reps_max: 12,
    rest_seconds: 90,
    rpe_target: null,
    rationale: 'Primary horizontal pull. Builds back thickness.',
    progression_scheme: 'double_progression' as const,
    modification_note: null,
    ...overrides,
  }
}

function makeDay(exercises = [makeExercise()]) {
  return {
    day_number: 1,
    name: 'Upper A',
    focus_muscles: ['chest', 'back'],
    session_type: 'hypertrophy' as const,
    estimated_duration_minutes: 50,
    exercises,
  }
}

// ============================================================
// VALID PROGRAM BASELINE
// ============================================================

describe('validateWorkoutProgram - valid program', () => {
  it('accepts the valid fixture program with no errors', () => {
    const result = validateWorkoutProgram(
      validProgram as GeneratedProgram,
      3,
      [],
      ['dumbbells', 'barbells', 'bench', 'cables_machines', 'pull_up_bar']
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

// ============================================================
// COMPOUND REST MINIMUM (120 seconds)
// ============================================================

describe('compound rest period enforcement', () => {
  it('rejects bench press with less than 120 seconds rest', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ exercise_name: 'Barbell Bench Press', rest_seconds: 90 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], ['barbells', 'bench'])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'compound_rest_minimum')).toBe(true)
  })

  it('rejects barbell squat with less than 120 seconds rest', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ exercise_name: 'Barbell Squat', rest_seconds: 60 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], ['barbells', 'squat_rack'])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'compound_rest_minimum')).toBe(true)
  })

  it('accepts bench press with exactly 120 seconds rest', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ exercise_name: 'Barbell Bench Press', rest_seconds: 120 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], ['barbells', 'bench'])
    const compoundRestErrors = result.errors.filter((e) => e.rule === 'compound_rest_minimum')
    expect(compoundRestErrors).toHaveLength(0)
  })

  it('accepts dumbbell row with 90 seconds rest (not heavy compound)', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ exercise_name: 'Dumbbell Row', rest_seconds: 90 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], ['dumbbells'])
    const restErrors = result.errors.filter((e) => e.rule === 'compound_rest_minimum')
    expect(restErrors).toHaveLength(0)
  })
})

// ============================================================
// DANGEROUS SAME-DAY PAIRINGS
// ============================================================

describe('dangerous pairing detection', () => {
  it('rejects barbell squat + conventional deadlift on same day', () => {
    const program = makeProgram({
      days: [
        makeDay([
          makeExercise({ exercise_name: 'Barbell Squat', rest_seconds: 180 }),
          makeExercise({ exercise_name: 'Conventional Deadlift', rest_seconds: 180 }),
        ]),
      ],
    })
    const result = validateWorkoutProgram(program, 3, [], ['barbells', 'squat_rack'])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'dangerous_pairing')).toBe(true)
  })

  it('rejects barbell bench press + overhead press on same day', () => {
    const program = makeProgram({
      days: [
        makeDay([
          makeExercise({ exercise_name: 'Barbell Bench Press', rest_seconds: 180 }),
          makeExercise({ exercise_name: 'Barbell Overhead Press', rest_seconds: 180 }),
        ]),
      ],
    })
    const result = validateWorkoutProgram(program, 3, [], ['barbells', 'bench'])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'dangerous_pairing')).toBe(true)
  })

  it('allows squat on one day and deadlift on a different day', () => {
    const program = makeProgram({
      days: [
        {
          ...makeDay([makeExercise({ exercise_name: 'Barbell Squat', rest_seconds: 180 })]),
          day_number: 1,
        },
        {
          ...makeDay([makeExercise({ exercise_name: 'Conventional Deadlift', rest_seconds: 180 })]),
          day_number: 2,
        },
      ],
    })
    const result = validateWorkoutProgram(program, 3, [], ['barbells', 'squat_rack'])
    const pairingErrors = result.errors.filter((e) => e.rule === 'dangerous_pairing')
    expect(pairingErrors).toHaveLength(0)
  })
})

// ============================================================
// INJURY CONTRAINDICATIONS
// ============================================================

describe('injury contraindication enforcement', () => {
  it('rejects good morning for a user with lower back injury', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ exercise_name: 'Good Morning', rest_seconds: 120 })])],
    })
    const result = validateWorkoutProgram(program, 3, ['lower_back'], ['barbells'])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'injury_contraindication')).toBe(true)
  })

  it('rejects behind-neck press for a user with shoulder injury', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ exercise_name: 'Behind-Neck Press', rest_seconds: 120 })])],
    })
    const result = validateWorkoutProgram(program, 3, ['shoulders'], ['barbells'])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'injury_contraindication')).toBe(true)
  })

  it('warns about missing modification note for caution exercises', () => {
    const program = makeProgram({
      days: [
        makeDay([
          makeExercise({
            exercise_name: 'Barbell Squat',
            rest_seconds: 180,
            modification_note: null, // caution exercise needs a note
          }),
        ]),
      ],
    })
    const result = validateWorkoutProgram(program, 3, ['knees'], ['barbells', 'squat_rack'])
    expect(result.warnings.some((w) => w.field.includes('modification_note'))).toBe(true)
  })

  it('accepts a caution exercise when modification note is provided', () => {
    const program = makeProgram({
      days: [
        makeDay([
          makeExercise({
            exercise_name: 'Barbell Squat',
            rest_seconds: 180,
            modification_note: 'Limit depth to 90 degrees. Ensure knees track over toes.',
          }),
        ]),
      ],
    })
    const result = validateWorkoutProgram(program, 3, ['knees'], ['barbells', 'squat_rack'])
    const modNoteWarnings = result.warnings.filter((w) => w.field.includes('modification_note'))
    expect(modNoteWarnings).toHaveLength(0)
  })
})

// ============================================================
// REP RANGE VALIDATION
// ============================================================

describe('rep range validation', () => {
  it('rejects reps_min of 0', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ reps_min: 0, reps_max: 8 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], [])
    expect(result.valid).toBe(false)
  })

  it('rejects reps_max above 50', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ reps_min: 20, reps_max: 60 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], [])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'reps_range')).toBe(true)
  })

  it('rejects reps_min greater than reps_max', () => {
    const program = makeProgram({
      days: [makeDay([makeExercise({ reps_min: 12, reps_max: 8 })])],
    })
    const result = validateWorkoutProgram(program, 3, [], [])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.rule === 'reps_min_max')).toBe(true)
  })
})

// ============================================================
// VOLUME HARD CAPS (level-specific)
// ============================================================

describe('volume hard cap enforcement', () => {
  it('rejects programs that exceed the beginner hard cap of 16 sets for a muscle', () => {
    // 17 sets for chest in one week (cap for level 1-2 is 16)
    const chestExercises = Array(17)
      .fill(null)
      .map((_, i) =>
        makeExercise({ exercise_name: `Barbell Bench Press ${i}`, sets: 1, rest_seconds: 120 })
      )
    const program = makeProgram({ days: [makeDay(chestExercises)] })
    const result = validateWorkoutProgram(program, 1, [], ['barbells', 'bench'])
    expect(result.errors.some((e) => e.rule === 'volume_hard_cap')).toBe(true)
  })

  it('accepts 16 sets for a muscle for a beginner (at the cap, not over)', () => {
    const chestExercises = Array(16)
      .fill(null)
      .map((_, i) =>
        makeExercise({ exercise_name: `Barbell Bench Press ${i}`, sets: 1, rest_seconds: 120 })
      )
    const program = makeProgram({ days: [makeDay(chestExercises)] })
    const result = validateWorkoutProgram(program, 1, [], ['barbells', 'bench'])
    const capErrors = result.errors.filter((e) => e.rule === 'volume_hard_cap')
    expect(capErrors).toHaveLength(0)
  })
})

// ============================================================
// PROPERTY-BASED TESTS (Layer 2)
// Requires: npm install --save-dev fast-check
// These tests fuzz random inputs to verify universal invariants.
// ============================================================

// Level-specific hard caps from CLAUDE.md and VOLUME_LIMITS in workout-validator.ts
const HARD_CAPS: Record<number, number> = { 1: 16, 2: 16, 3: 20, 4: 24, 5: 25 }

// All injury zones that have at least one exclusion
const ALL_ZONES_WITH_EXCLUSIONS: InjuryZone[] = [
  'lower_back',
  'knees',
  'shoulders',
  'wrists',
  'hips',
  'neck',
]

// Flat list of [injuryZone, excludedExerciseName] pairs used by fc.constantFrom
const INJURY_EXCLUSION_PAIRS: [InjuryZone, string][] = ALL_ZONES_WITH_EXCLUSIONS.flatMap(
  (zone) => CONTRAINDICATIONS[zone].exclude.map((ex): [InjuryZone, string] => [zone, ex])
).filter(([, ex]) => ex.trim().length > 0)

describe('property-based invariants (Layer 2)', () => {
  it('volume cap: always rejects programs exceeding level-specific hard cap', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // experience level
        fc.integer({ min: 1, max: 5 }), // sets per exercise (1-5)
        fc.integer({ min: 1, max: 8 }), // exercises per day (max 8)
        (level, setsEach, exPerDay) => {
          const cap = HARD_CAPS[level]!
          // Build enough days so total chest sets strictly exceed the cap
          const setsPerDay = exPerDay * setsEach
          const numDaysNeeded = Math.ceil(cap / setsPerDay) + 1

          const days = Array.from({ length: numDaysNeeded }, (_, dayIdx) => ({
            day_number: dayIdx + 1,
            name: `Day ${dayIdx + 1}`,
            focus_muscles: ['chest'],
            session_type: 'hypertrophy' as const,
            estimated_duration_minutes: 50,
            exercises: Array.from({ length: exPerDay }, (_, exIdx) =>
              makeExercise({
                exercise_name: `Barbell Bench Press ${dayIdx}x${exIdx}`,
                sets: setsEach,
                rest_seconds: 120,
              })
            ),
          }))

          const program = makeProgram({ days })
          const result = validateWorkoutProgram(
            program,
            level as ExperienceLevel,
            [],
            ['barbells', 'bench']
          )

          return result.errors.some((e) => e.rule === 'volume_hard_cap')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('contraindication: always rejects excluded exercises for every injury zone', () => {
    fc.assert(
      fc.property(fc.constantFrom(...INJURY_EXCLUSION_PAIRS), ([zone, excludedExercise]) => {
        const program = makeProgram({
          days: [makeDay([makeExercise({ exercise_name: excludedExercise, rest_seconds: 120 })])],
        })
        const result = validateWorkoutProgram(program, 3, [zone], [])

        return result.errors.some((e) => e.rule === 'injury_contraindication')
      }),
      { numRuns: 50 }
    )
  })

  it('rest bounds: always rejects rest_seconds below 30', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 29 }), (restSeconds) => {
        const program = makeProgram({
          days: [makeDay([makeExercise({ rest_seconds: restSeconds })])],
        })
        const result = validateWorkoutProgram(program, 3, [], [])

        return result.errors.some((e) => e.rule === 'rest_range')
      }),
      { numRuns: 100 }
    )
  })

  it('rest bounds: always rejects rest_seconds above 300', () => {
    fc.assert(
      fc.property(fc.integer({ min: 301, max: 600 }), (restSeconds) => {
        const program = makeProgram({
          days: [makeDay([makeExercise({ rest_seconds: restSeconds })])],
        })
        const result = validateWorkoutProgram(program, 3, [], [])

        return result.errors.some((e) => e.rule === 'rest_range')
      }),
      { numRuns: 100 }
    )
  })

  it('rest bounds: accepts any rest_seconds in [30, 300] for non-heavy-compound exercises', () => {
    fc.assert(
      fc.property(fc.integer({ min: 30, max: 300 }), (restSeconds) => {
        const program = makeProgram({
          days: [makeDay([makeExercise({ rest_seconds: restSeconds })])],
        })
        const result = validateWorkoutProgram(program, 3, [], [])
        const restRangeErrors = result.errors.filter((e) => e.rule === 'rest_range')

        return restRangeErrors.length === 0
      }),
      { numRuns: 100 }
    )
  })
})
