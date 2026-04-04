/**
 * StartWorkoutButton Tests
 *
 * Verifies the component exports, prop types, and key behavior:
 * - Accepts programDayId and programId props
 * - Renders without error in various prop combinations
 */

import { describe, it, expect, vi } from 'vitest'
import { StartWorkoutButton } from '../StartWorkoutButton'

// Mock next/navigation - needed for useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

// Mock the workout store
vi.mock('@/stores/workout.store', () => ({
  useWorkoutStore: vi.fn(() => ({
    startWorkout: vi.fn(),
    is_active: false,
    session_id: null,
  })),
}))

// Mock next-safe-action hooks
vi.mock('next-safe-action/hooks', () => ({
  useAction: vi.fn(() => ({
    execute: vi.fn(),
    isPending: false,
    result: {},
  })),
}))

// Mock the action
vi.mock('@/actions/workout.actions', () => ({
  startSessionAction: vi.fn(),
}))

describe('StartWorkoutButton', () => {
  const VALID_PROGRAM_DAY_ID = '00000000-0000-0000-0000-000000000001'
  const VALID_PROGRAM_ID = '00000000-0000-0000-0000-000000000002'

  describe('component structure', () => {
    it('exports StartWorkoutButton as a React component', () => {
      expect(typeof StartWorkoutButton).toBe('function')
    })

    it('renders without error with both IDs', () => {
      expect(() =>
        StartWorkoutButton({ programDayId: VALID_PROGRAM_DAY_ID, programId: VALID_PROGRAM_ID })
      ).not.toThrow()
    })

    it('renders without error with null IDs (freeform mode)', () => {
      expect(() =>
        StartWorkoutButton({ programDayId: null, programId: null })
      ).not.toThrow()
    })

    it('renders without error with only programDayId', () => {
      expect(() =>
        StartWorkoutButton({ programDayId: VALID_PROGRAM_DAY_ID, programId: null })
      ).not.toThrow()
    })
  })

  describe('return value', () => {
    it('returns a React element (not null)', () => {
      const result = StartWorkoutButton({ programDayId: VALID_PROGRAM_DAY_ID, programId: VALID_PROGRAM_ID })
      expect(result).not.toBeNull()
    })
  })
})
