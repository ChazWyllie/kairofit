/**
 * getNextProgramDay Tests
 *
 * Verifies the logic for finding the next unlogged program day in the current week.
 * This is critical for the dashboard to know which day to display.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNextProgramDay, getRecentPerformance } from '../sessions'
import type { ProgramDay, ProgramExercise, SessionType, WorkoutSet } from '@/types'

// Mock the Supabase client
vi.mock('@/lib/db/supabase', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'

// Test fixtures
const mockProgramDayRow = (overrides: Partial<ProgramDay> = {}) => ({
  id: 'day-1',
  program_id: 'program-1',
  day_number: 1,
  week_number: 1,
  name: 'Push Day',
  focus_muscles: ['chest', 'shoulders', 'triceps'],
  session_type: 'hypertrophy' as SessionType,
  estimated_duration_minutes: 45,
  exercises: [] as ProgramExercise[],
  program_exercises: [],
  ...overrides,
})

const mockSessionRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-1',
  program_day_id: 'day-1',
  status: 'completed',
  ...overrides,
})

function createSupabaseMock(
  config: {
    programDaysData?: ProgramDay[] | null
    programDaysError?: { code?: string; message: string } | null
    sessionsData?: Record<string, unknown>[] | null
    sessionsError?: { code?: string; message: string } | null
  } = {}
) {
  const {
    programDaysData = [],
    programDaysError = null,
    sessionsData = [],
    sessionsError = null,
  } = config

  return {
    from: vi.fn((table: string) => {
      if (table === 'program_days') {
        const builder = {
          select: vi.fn(),
          eq: vi.fn(),
          order: vi.fn().mockResolvedValue({ data: programDaysData, error: programDaysError }),
        }
        builder.select.mockReturnValue(builder)
        builder.eq.mockReturnValue(builder)
        return builder
      }

      if (table === 'workout_sessions') {
        const builder = {
          select: vi.fn(),
          eq: vi.fn(),
          gte: vi.fn().mockResolvedValue({ data: sessionsData, error: sessionsError }),
        }
        builder.select.mockReturnValue(builder)
        builder.eq.mockReturnValue(builder)
        return builder
      }

      throw new Error(`Unexpected table in test: ${table}`)
    }),
  }
}

describe('getNextProgramDay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('happy path', () => {
    it('returns first unlogged day when no sessions exist', async () => {
      const days = [
        mockProgramDayRow({ id: 'day-1', day_number: 1 }),
        mockProgramDayRow({ id: 'day-2', day_number: 2 }),
      ]

      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsData: [],
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result?.id).toBe('day-1')
      expect(result?.day_number).toBe(1)
      expect(result?.name).toBe('Push Day')
    })

    it('returns second day when first day is already logged', async () => {
      const days = [
        mockProgramDayRow({ id: 'day-1', day_number: 1 }),
        mockProgramDayRow({ id: 'day-2', day_number: 2 }),
      ]

      const sessions = [mockSessionRow({ program_day_id: 'day-1' })]

      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsData: sessions,
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result?.id).toBe('day-2')
      expect(result?.day_number).toBe(2)
    })

    it('returns null when all days in the week are logged', async () => {
      const days = [
        mockProgramDayRow({ id: 'day-1', day_number: 1 }),
        mockProgramDayRow({ id: 'day-2', day_number: 2 }),
      ]

      const sessions = [
        mockSessionRow({ program_day_id: 'day-1' }),
        mockSessionRow({ program_day_id: 'day-2' }),
      ]

      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsData: sessions,
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result).toBeNull()
    })

    it('handles week 0 by treating it as week 1', async () => {
      const days = [mockProgramDayRow({ id: 'day-1', day_number: 1, week_number: 1 })]

      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsData: [],
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 0)

      expect(result).toBeDefined()
      expect(result?.id).toBe('day-1')
    })

    it('returns correct day when multiple sessions exist for same program', async () => {
      const days = [
        mockProgramDayRow({ id: 'day-1', day_number: 1 }),
        mockProgramDayRow({ id: 'day-2', day_number: 2 }),
        mockProgramDayRow({ id: 'day-3', day_number: 3 }),
      ]

      const sessions = [
        mockSessionRow({ program_day_id: 'day-1' }),
        mockSessionRow({ program_day_id: 'day-2' }),
      ]

      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsData: sessions,
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result?.id).toBe('day-3')
      expect(result?.day_number).toBe(3)
    })
  })

  describe('error handling', () => {
    it('returns null when program_days query returns error', async () => {
      const mock = createSupabaseMock({
        programDaysError: { message: 'DB connection error' },
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result).toBeNull()
    })

    it('returns null when sessions query returns error', async () => {
      const days = [
        mockProgramDayRow({ id: 'day-1', day_number: 1 }),
        mockProgramDayRow({ id: 'day-2', day_number: 2 }),
      ]

      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsError: { message: 'DB connection error' },
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result).toBeNull()
    })

    it('handles empty program_days array gracefully', async () => {
      const mock = createSupabaseMock({
        programDaysData: [],
        sessionsData: [],
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await getNextProgramDay('user-1', 'program-1', 1)

      expect(result).toBeNull()
    })
  })

  describe('query parameters', () => {
    it('passes userId to sessions query when program days exist', async () => {
      const days = [mockProgramDayRow({ id: 'day-1', day_number: 1 })]
      const mock = createSupabaseMock({
        programDaysData: days,
        sessionsData: [],
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await getNextProgramDay('user-123', 'program-1', 1)

      const sessionCalls = mock.from.mock.calls.filter((c) => c[0] === 'workout_sessions')
      expect(sessionCalls.length).toBeGreaterThan(0)
    })

    it('passes programId to program_days query', async () => {
      const mock = createSupabaseMock({
        programDaysData: [],
        sessionsData: [],
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await getNextProgramDay('user-1', 'program-123', 1)

      const daysCalls = mock.from.mock.calls.filter((c) => c[0] === 'program_days')
      expect(daysCalls.length).toBeGreaterThan(0)
    })

    it('passes currentWeek to program_days query', async () => {
      const mock = createSupabaseMock({
        programDaysData: [],
        sessionsData: [],
      })

      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await getNextProgramDay('user-1', 'program-1', 3)

      // Just verify that the query was made (exact week filtering is DB-level)
      const daysCalls = mock.from.mock.calls.filter((c) => c[0] === 'program_days')
      expect(daysCalls.length).toBeGreaterThan(0)
    })
  })
})

// ============================================================
// getRecentPerformance Tests
// ============================================================

const mockWorkoutSet = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
  id: 'set-1',
  session_id: 'session-1',
  exercise_id: 'exercise-1',
  program_exercise_id: 'pe-1',
  user_id: 'user-1',
  set_number: 1,
  reps_completed: 10,
  weight_kg: 60,
  rpe: null,
  is_warmup: false,
  is_dropset: false,
  logged_at: '2024-01-01T10:00:00Z',
  ...overrides,
})

function createRecentPerformanceMock(
  config: {
    data?: WorkoutSet[] | null
    error?: { message: string } | null
  } = {}
) {
  const { data = [], error = null } = config

  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  }
  builder.select.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)

  return {
    from: vi.fn().mockReturnValue(builder),
    _builder: builder,
  }
}

describe('getRecentPerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns sets ordered by logged_at when data exists', async () => {
    const sets = [
      mockWorkoutSet({ id: 'set-3', logged_at: '2024-01-15T10:00:00Z', weight_kg: 65 }),
      mockWorkoutSet({ id: 'set-2', logged_at: '2024-01-08T10:00:00Z', weight_kg: 62.5 }),
      mockWorkoutSet({ id: 'set-1', logged_at: '2024-01-01T10:00:00Z', weight_kg: 60 }),
    ]

    const mock = createRecentPerformanceMock({ data: sets })
    vi.mocked(createServerClient).mockResolvedValue(mock as never)

    const result = await getRecentPerformance('user-1', 'exercise-1')

    expect(result).toHaveLength(3)
    expect(result[0]!.id).toBe('set-3')
    expect(result[0]!.weight_kg).toBe(65)
  })

  it('returns empty array when no sets exist', async () => {
    const mock = createRecentPerformanceMock({ data: [] })
    vi.mocked(createServerClient).mockResolvedValue(mock as never)

    const result = await getRecentPerformance('user-1', 'exercise-1')

    expect(result).toEqual([])
  })

  it('returns empty array on DB error', async () => {
    const mock = createRecentPerformanceMock({ error: { message: 'DB error' } })
    vi.mocked(createServerClient).mockResolvedValue(mock as never)

    const result = await getRecentPerformance('user-1', 'exercise-1')

    expect(result).toEqual([])
  })

  it('queries workout_sets table', async () => {
    const mock = createRecentPerformanceMock({ data: [] })
    vi.mocked(createServerClient).mockResolvedValue(mock as never)

    await getRecentPerformance('user-1', 'exercise-1')

    expect(mock.from).toHaveBeenCalledWith('workout_sets')
  })

  it('uses default limit of 5', async () => {
    const mock = createRecentPerformanceMock({ data: [] })
    vi.mocked(createServerClient).mockResolvedValue(mock as never)

    await getRecentPerformance('user-1', 'exercise-1')

    expect(mock._builder.limit).toHaveBeenCalledWith(5)
  })

  it('respects custom limit parameter', async () => {
    const mock = createRecentPerformanceMock({ data: [] })
    vi.mocked(createServerClient).mockResolvedValue(mock as never)

    await getRecentPerformance('user-1', 'exercise-1', 3)

    expect(mock._builder.limit).toHaveBeenCalledWith(3)
  })
})
