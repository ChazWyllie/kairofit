/**
 * SetLogger Tests
 *
 * Verifies the SetLogger component structure and default prop behavior.
 */

import { describe, it, expect, vi } from 'vitest'

// Mock React's useState so the component can be called outside a render context.
// SetLogger uses useState directly; calling it as a plain function triggers
// React's internal dispatcher (null outside render), causing a runtime error.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useState: vi.fn((initial: unknown) => [initial, vi.fn()]),
  }
})

import { SetLogger } from '../SetLogger'
import type { ProgramExercise, Exercise } from '@/types'

// Mock the workout store
vi.mock('@/stores/workout.store', () => ({
  useWorkoutStore: vi.fn(() => ({
    session_id: 'session-abc',
    addOptimisticSet: vi.fn(),
    confirmSet: vi.fn(),
    removeSet: vi.fn(),
    startRestTimer: vi.fn(),
    logged_sets: {},
  })),
}))

// Mock offline sync (SetLogger uses logSetOffline, not logSetAction)
vi.mock('@/lib/offline/sync', () => ({
  logSetOffline: vi.fn().mockResolvedValue(undefined),
}))

const MOCK_EXERCISE: Exercise = {
  id: 'exercise-1',
  name: 'Bench Press',
  slug: 'bench-press',
  alternative_names: [],
  primary_muscles: ['chest'],
  secondary_muscles: ['triceps', 'shoulders'],
  movement_pattern: 'horizontal_push',
  is_compound: true,
  equipment_required: ['barbells', 'bench'],
  difficulty: 3,
  default_sets_min: 3,
  default_sets_max: 4,
  default_reps_min: 8,
  default_reps_max: 12,
  default_rest_seconds: 120,
  description: null,
  research_rationale: 'High compound EMG activation',
  form_cues: ['keep shoulder blades retracted'],
  common_mistakes: ['bouncing the bar'],
  contraindicated_for: [],
  video_url: null,
  thumbnail_url: null,
  is_verified: true,
  evidence_quality: 'high',
}

const MOCK_PROGRAM_EXERCISE: ProgramExercise = {
  id: 'pe-1',
  program_day_id: 'day-1',
  exercise_id: MOCK_EXERCISE.id,
  user_id: 'user-1',
  exercise: MOCK_EXERCISE,
  order_index: 0,
  superset_group: null,
  sets: 3,
  reps_min: 8,
  reps_max: 12,
  rest_seconds: 120,
  rpe_target: null,
  rir_target: null,
  rationale: 'Chest hypertrophy baseline',
  progression_scheme: 'double_progression',
  modification_note: null,
  is_flagged_for_injury: false,
}

describe('SetLogger', () => {
  describe('component structure', () => {
    it('exports SetLogger as a React component', () => {
      expect(typeof SetLogger).toBe('function')
    })

    it('renders without error with a program exercise', () => {
      expect(() =>
        SetLogger({
          programExercise: MOCK_PROGRAM_EXERCISE,
          sessionId: 'session-abc',
          userId: 'user-test-id',
        })
      ).not.toThrow()
    })

    it('returns a React element', () => {
      const result = SetLogger({
        programExercise: MOCK_PROGRAM_EXERCISE,
        sessionId: 'session-abc',
        userId: 'user-test-id',
      })
      expect(result).not.toBeNull()
    })
  })

  describe('prop variations', () => {
    it('renders without error for compound exercises', () => {
      expect(() =>
        SetLogger({
          programExercise: MOCK_PROGRAM_EXERCISE,
          sessionId: 'session-abc',
          userId: 'user-test-id',
        })
      ).not.toThrow()
    })

    it('renders without error for isolation exercises', () => {
      const isolationExercise: ProgramExercise = {
        ...MOCK_PROGRAM_EXERCISE,
        sets: 4,
        reps_min: 12,
        reps_max: 15,
        rest_seconds: 60,
      }
      expect(() =>
        SetLogger({
          programExercise: isolationExercise,
          sessionId: 'session-abc',
          userId: 'user-test-id',
        })
      ).not.toThrow()
    })
  })
})
