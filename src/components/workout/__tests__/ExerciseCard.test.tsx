/**
 * ExerciseCard Tests
 *
 * Verifies the ExerciseCard component structure and prop handling.
 */

import { describe, it, expect, vi } from 'vitest'
import { ExerciseCard } from '../ExerciseCard'
import type { ProgramExercise, Exercise } from '@/types'

// Mock the workout store
vi.mock('@/stores/workout.store', () => ({
  useWorkoutStore: vi.fn(() => ({
    session_id: 'session-abc',
    logged_sets: {},
  })),
}))

// Mock next-safe-action hooks (needed by SetLogger child)
vi.mock('next-safe-action/hooks', () => ({
  useAction: vi.fn(() => ({
    execute: vi.fn(),
    isPending: false,
    result: {},
  })),
}))

vi.mock('@/actions/workout.actions', () => ({
  logSetAction: vi.fn(),
}))

const MOCK_EXERCISE: Exercise = {
  id: 'exercise-1',
  name: 'Deadlift',
  slug: 'deadlift',
  alternative_names: [],
  primary_muscles: ['hamstrings', 'glutes', 'lower_back'],
  secondary_muscles: ['traps', 'forearms'],
  movement_pattern: 'hinge',
  is_compound: true,
  equipment_required: ['barbells'],
  difficulty: 4,
  default_sets_min: 3,
  default_sets_max: 5,
  default_reps_min: 3,
  default_reps_max: 6,
  default_rest_seconds: 180,
  description: null,
  research_rationale: 'Full posterior chain activation',
  form_cues: ['neutral spine', 'push through the floor'],
  common_mistakes: ['rounding lower back'],
  contraindicated_for: ['lower_back'],
  video_url: null,
  thumbnail_url: null,
  is_verified: true,
  evidence_quality: 'high',
}

const MOCK_PROGRAM_EXERCISE: ProgramExercise = {
  id: 'pe-2',
  program_day_id: 'day-1',
  exercise_id: MOCK_EXERCISE.id,
  user_id: 'user-1',
  exercise: MOCK_EXERCISE,
  order_index: 0,
  superset_group: null,
  sets: 4,
  reps_min: 4,
  reps_max: 6,
  rest_seconds: 180,
  rpe_target: 8,
  rir_target: null,
  rationale: 'Posterior chain strength baseline',
  progression_scheme: 'linear',
  modification_note: null,
  is_flagged_for_injury: false,
}

describe('ExerciseCard', () => {
  describe('component structure', () => {
    it('exports ExerciseCard as a React component', () => {
      expect(typeof ExerciseCard).toBe('function')
    })

    it('renders without error with a valid program exercise', () => {
      expect(() =>
        ExerciseCard({
          programExercise: MOCK_PROGRAM_EXERCISE,
          sessionId: 'session-abc',
          isActive: true,
        })
      ).not.toThrow()
    })

    it('renders without error when not active', () => {
      expect(() =>
        ExerciseCard({
          programExercise: MOCK_PROGRAM_EXERCISE,
          sessionId: 'session-abc',
          isActive: false,
        })
      ).not.toThrow()
    })

    it('returns a React element', () => {
      const result = ExerciseCard({
        programExercise: MOCK_PROGRAM_EXERCISE,
        sessionId: 'session-abc',
        isActive: true,
      })
      expect(result).not.toBeNull()
    })
  })

  describe('injury flag handling', () => {
    it('renders without error when exercise is flagged for injury', () => {
      const flagged: ProgramExercise = { ...MOCK_PROGRAM_EXERCISE, is_flagged_for_injury: true }
      expect(() =>
        ExerciseCard({ programExercise: flagged, sessionId: 'session-abc', isActive: true })
      ).not.toThrow()
    })
  })

  describe('rationale display', () => {
    it('renders without error when rationale is null', () => {
      const noRationale: ProgramExercise = { ...MOCK_PROGRAM_EXERCISE, rationale: null }
      expect(() =>
        ExerciseCard({ programExercise: noRationale, sessionId: 'session-abc', isActive: true })
      ).not.toThrow()
    })

    it('renders without error with a long rationale', () => {
      const longRationale: ProgramExercise = {
        ...MOCK_PROGRAM_EXERCISE,
        rationale: 'A'.repeat(300),
      }
      expect(() =>
        ExerciseCard({ programExercise: longRationale, sessionId: 'session-abc', isActive: true })
      ).not.toThrow()
    })
  })
})
