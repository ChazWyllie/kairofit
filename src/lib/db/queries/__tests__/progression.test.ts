/**
 * getProgressionSuggestionsForDay Tests
 *
 * Verifies that the correct progression calculator is applied per experience
 * level and that edge cases (no data, missing profile) are handled gracefully.
 *
 * Uses function-level mocks to isolate from DB - the sub-functions are tested
 * independently in their own test files.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProgressionSuggestionsForDay } from '../progression'
import type { ProgramDay, ProgramExercise, UserProfile, WorkoutSet, Exercise } from '@/types'

// Mock all sub-functions so this test is pure orchestration logic
vi.mock('../sessions', () => ({
  getProgramDay: vi.fn(),
  getRecentPerformance: vi.fn(),
}))

vi.mock('../profiles', () => ({
  getProfileForGeneration: vi.fn(),
}))

import { getProgramDay, getRecentPerformance } from '../sessions'
import { getProfileForGeneration } from '../profiles'

// ============================================================
// Fixtures
// ============================================================

const mockExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 'exercise-1',
  name: 'Bench Press',
  slug: 'bench-press',
  alternative_names: [],
  primary_muscles: ['chest', 'shoulders', 'triceps'],
  secondary_muscles: [],
  movement_pattern: 'horizontal_push',
  is_compound: true,
  equipment_required: ['barbells'],
  difficulty: 3,
  default_sets_min: 3,
  default_sets_max: 4,
  default_reps_min: 8,
  default_reps_max: 12,
  default_rest_seconds: 120,
  description: null,
  research_rationale: null,
  form_cues: [],
  common_mistakes: [],
  contraindicated_for: [],
  video_url: null,
  thumbnail_url: null,
  is_verified: true,
  evidence_quality: 'high',
  ...overrides,
})

const mockProgramExercise = (overrides: Partial<ProgramExercise> = {}): ProgramExercise => ({
  id: 'pe-1',
  program_day_id: 'day-1',
  exercise_id: 'exercise-1',
  user_id: 'user-1',
  exercise: mockExercise(),
  order_index: 0,
  superset_group: null,
  sets: 3,
  reps_min: 8,
  reps_max: 12,
  rest_seconds: 120,
  rpe_target: null,
  rir_target: null,
  rationale: 'Primary horizontal push pattern.',
  progression_scheme: 'double_progression',
  modification_note: null,
  is_flagged_for_injury: false,
  ...overrides,
})

const mockProgramDay = (overrides: Partial<ProgramDay> = {}): ProgramDay => ({
  id: 'day-1',
  program_id: 'program-1',
  day_number: 1,
  week_number: 1,
  name: 'Push Day',
  focus_muscles: ['chest', 'shoulders', 'triceps'],
  session_type: 'hypertrophy',
  estimated_duration_minutes: 45,
  exercises: [mockProgramExercise()],
  ...overrides,
})

const mockProfile = (overrides: Partial<UserProfile> = {}): UserProfile =>
  ({
    id: 'user-1',
    experience_level: 3,
    preferred_units: 'metric',
    ...overrides,
  }) as UserProfile

const mockWorkoutSet = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
  id: 'set-1',
  session_id: 'session-1',
  exercise_id: 'exercise-1',
  program_exercise_id: 'pe-1',
  user_id: 'user-1',
  set_number: 1,
  reps_completed: 12,
  weight_kg: 60,
  rpe: null,
  is_warmup: false,
  is_dropset: false,
  logged_at: '2024-01-01T10:00:00Z',
  ...overrides,
})

// ============================================================
// Tests
// ============================================================

describe('getProgressionSuggestionsForDay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty object when program day not found', async () => {
    vi.mocked(getProgramDay).mockResolvedValue(null)
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile())

    const result = await getProgressionSuggestionsForDay('user-1', 'day-missing')

    expect(result).toEqual({})
  })

  it('returns empty object when profile not found', async () => {
    vi.mocked(getProgramDay).mockResolvedValue(mockProgramDay())
    vi.mocked(getProfileForGeneration).mockResolvedValue(null)

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result).toEqual({})
  })

  it('returns maintain suggestion when no recent sets exist', async () => {
    vi.mocked(getProgramDay).mockResolvedValue(mockProgramDay())
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile({ experience_level: 3 }))
    vi.mocked(getRecentPerformance).mockResolvedValue([])

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result['exercise-1']).toBeDefined()
    expect(result['exercise-1']!.action).toBe('maintain')
    expect(result['exercise-1']!.suggested_weight).toBeNull()
  })

  it('applies double_progression for level 3 when all sets hit reps_max', async () => {
    vi.mocked(getProgramDay).mockResolvedValue(mockProgramDay())
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile({ experience_level: 3 }))
    // 3 sets all hitting reps_max (12)
    vi.mocked(getRecentPerformance).mockResolvedValue([
      mockWorkoutSet({ id: 's1', reps_completed: 12, weight_kg: 60 }),
      mockWorkoutSet({ id: 's2', reps_completed: 12, weight_kg: 60 }),
      mockWorkoutSet({ id: 's3', reps_completed: 12, weight_kg: 60 }),
    ])

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result['exercise-1']!.action).toBe('increase_weight')
    expect(result['exercise-1']!.suggested_weight).toBeGreaterThan(60)
    expect(result['exercise-1']!.suggested_reps).toBe(8) // reset to reps_min
  })

  it('applies linear_progression for level 1', async () => {
    const upperBodyExercise = mockProgramExercise({
      progression_scheme: 'linear',
      reps_min: 8,
      reps_max: 8,
      exercise: mockExercise({ primary_muscles: ['chest', 'triceps'] }),
    })
    vi.mocked(getProgramDay).mockResolvedValue(
      mockProgramDay({ exercises: [upperBodyExercise] })
    )
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile({ experience_level: 1 }))
    vi.mocked(getRecentPerformance).mockResolvedValue([
      mockWorkoutSet({ reps_completed: 8, weight_kg: 40 }),
    ])

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result['exercise-1']!.action).toBe('increase_weight')
    // Upper body linear: +2.5 kg
    expect(result['exercise-1']!.suggested_weight).toBe(42.5)
  })

  it('applies rpe_based progression for level 4 when rpe is in target zone', async () => {
    const rpeExercise = mockProgramExercise({
      progression_scheme: 'rpe_based',
      reps_min: 4,
      reps_max: 6,
    })
    vi.mocked(getProgramDay).mockResolvedValue(
      mockProgramDay({ exercises: [rpeExercise] })
    )
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile({ experience_level: 4 }))
    vi.mocked(getRecentPerformance).mockResolvedValue([
      mockWorkoutSet({ reps_completed: 5, weight_kg: 100, rpe: 8 }),
      mockWorkoutSet({ reps_completed: 5, weight_kg: 100, rpe: 8 }),
    ])

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    // RPE 8 is in target zone (7-9) -> maintain
    expect(result['exercise-1']!.action).toBe('maintain')
    expect(result['exercise-1']!.suggested_weight).toBe(100)
  })

  it('applies linear_progression for level 2 (lower body) with larger increment', async () => {
    const squatExercise = mockProgramExercise({
      progression_scheme: 'linear',
      reps_min: 5,
      reps_max: 5,
      exercise: mockExercise({ primary_muscles: ['quads', 'glutes', 'hamstrings'] }),
    })
    vi.mocked(getProgramDay).mockResolvedValue(
      mockProgramDay({ exercises: [squatExercise] })
    )
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile({ experience_level: 2 }))
    vi.mocked(getRecentPerformance).mockResolvedValue([
      mockWorkoutSet({ reps_completed: 5, weight_kg: 80 }),
    ])

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result['exercise-1']!.action).toBe('increase_weight')
    // Lower body linear: +5 kg
    expect(result['exercise-1']!.suggested_weight).toBe(85)
  })

  it('handles multiple exercises in a day', async () => {
    const exercise2 = mockProgramExercise({
      id: 'pe-2',
      exercise_id: 'exercise-2',
      exercise: mockExercise({ id: 'exercise-2', name: 'Squat' }),
      progression_scheme: 'double_progression',
      reps_min: 5,
      reps_max: 8,
    })
    vi.mocked(getProgramDay).mockResolvedValue(
      mockProgramDay({ exercises: [mockProgramExercise(), exercise2] })
    )
    vi.mocked(getProfileForGeneration).mockResolvedValue(mockProfile({ experience_level: 3 }))
    vi.mocked(getRecentPerformance)
      .mockResolvedValueOnce([]) // exercise-1: no data
      .mockResolvedValueOnce([mockWorkoutSet({ exercise_id: 'exercise-2', weight_kg: 100, reps_completed: 8 })]) // exercise-2: data

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result['exercise-1']).toBeDefined()
    expect(result['exercise-2']).toBeDefined()
    expect(result['exercise-1']!.action).toBe('maintain')
  })

  it('uses imperial increments when preferred_units is imperial', async () => {
    const upperBodyExercise = mockProgramExercise({
      progression_scheme: 'linear',
      reps_min: 8,
      reps_max: 8,
    })
    vi.mocked(getProgramDay).mockResolvedValue(
      mockProgramDay({ exercises: [upperBodyExercise] })
    )
    vi.mocked(getProfileForGeneration).mockResolvedValue(
      mockProfile({ experience_level: 1, preferred_units: 'imperial' })
    )
    vi.mocked(getRecentPerformance).mockResolvedValue([
      mockWorkoutSet({ reps_completed: 8, weight_kg: 100 }),
    ])

    const result = await getProgressionSuggestionsForDay('user-1', 'day-1')

    expect(result['exercise-1']!.action).toBe('increase_weight')
    // Upper body imperial: +5 lbs (not 2.5 kg)
    expect(result['exercise-1']!.suggested_weight).toBe(105)
  })
})
