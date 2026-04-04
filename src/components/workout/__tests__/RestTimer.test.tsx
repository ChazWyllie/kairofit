/**
 * RestTimer Tests
 *
 * Verifies the RestTimer component structure and helper logic.
 */

import { describe, it, expect, vi } from 'vitest'

// Mock React hooks so the component can be called outside a render context.
// RestTimer uses useEffect which fails when invoked as a plain function.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useEffect: vi.fn(),
  }
})

import { RestTimer, formatRestTime } from '../RestTimer'

// Mock the workout store
vi.mock('@/stores/workout.store', () => ({
  useWorkoutStore: vi.fn(() => ({
    rest_timer: {
      is_running: false,
      seconds_remaining: 0,
      total_seconds: 0,
      exercise_name: null,
    },
    tickRestTimer: vi.fn(),
    stopRestTimer: vi.fn(),
  })),
}))

describe('RestTimer', () => {
  describe('component structure', () => {
    it('exports RestTimer as a React component', () => {
      expect(typeof RestTimer).toBe('function')
    })

    it('renders without error when timer is not running', () => {
      expect(() => RestTimer({})).not.toThrow()
    })
  })
})

describe('formatRestTime', () => {
  it('formats 0 seconds as "0:00"', () => {
    expect(formatRestTime(0)).toBe('0:00')
  })

  it('formats 30 seconds as "0:30"', () => {
    expect(formatRestTime(30)).toBe('0:30')
  })

  it('formats 60 seconds as "1:00"', () => {
    expect(formatRestTime(60)).toBe('1:00')
  })

  it('formats 90 seconds as "1:30"', () => {
    expect(formatRestTime(90)).toBe('1:30')
  })

  it('formats 120 seconds as "2:00"', () => {
    expect(formatRestTime(120)).toBe('2:00')
  })

  it('formats single digit seconds with leading zero', () => {
    expect(formatRestTime(65)).toBe('1:05')
  })

  it('formats 9 seconds as "0:09"', () => {
    expect(formatRestTime(9)).toBe('0:09')
  })
})
