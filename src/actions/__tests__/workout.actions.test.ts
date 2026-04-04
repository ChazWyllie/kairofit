/**
 * Workout Actions Tests
 *
 * Tests for:
 * - startSessionAction: creates a workout_sessions row
 * - logSetAction: inserts a workout_sets row with ownership check
 * - completeSessionAction: marks session complete, calculates duration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (must be declared before imports that use them)
// ---------------------------------------------------------------------------

vi.mock('@/lib/db/supabase', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { startSessionAction, logSetAction, completeSessionAction } from '../workout.actions'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-111', email: 'user@example.com' }

const VALID_SESSION_ID = '00000000-0000-0000-0000-000000000001'
const VALID_PROGRAM_DAY_ID = '00000000-0000-0000-0000-000000000002'
const VALID_PROGRAM_ID = '00000000-0000-0000-0000-000000000003'
const VALID_EXERCISE_ID = '00000000-0000-0000-0000-000000000004'
const VALID_PROGRAM_EXERCISE_ID = '00000000-0000-0000-0000-000000000005'

const MOCK_SESSION_ROW = {
  id: VALID_SESSION_ID,
  started_at: new Date(Date.now() - 3600_000).toISOString(), // 1 hour ago
  status: 'in_progress',
}

const MOCK_SET_ROW = {
  id: '00000000-0000-0000-0000-000000000099',
  set_number: 1,
  reps_completed: 10,
  weight_kg: 80,
  rpe: null,
  logged_at: new Date().toISOString(),
}

/**
 * Build a chainable Supabase mock for workout action tests.
 * Supports insert, update, select, eq, single - the exact chain each action uses.
 */
function buildSupabaseMock({
  sessionOwnershipRow = { id: VALID_SESSION_ID } as Record<string, unknown> | null,
  sessionOwnershipError = null as { message: string } | null,
  insertSessionData = { id: VALID_SESSION_ID, started_at: new Date().toISOString(), status: 'in_progress' } as Record<string, unknown> | null,
  insertSessionError = null as { message: string } | null,
  insertSetData = MOCK_SET_ROW as Record<string, unknown> | null,
  insertSetError = null as { message: string } | null,
  fetchSessionData = MOCK_SESSION_ROW as Record<string, unknown> | null,
  fetchSessionError = null as { message: string } | null,
  updateSessionData = { id: VALID_SESSION_ID, completed_at: new Date().toISOString(), duration_seconds: 3600, status: 'completed' } as Record<string, unknown> | null,
  updateSessionError = null as { message: string } | null,
} = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'workout_sessions') {
        const insertChain = {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: insertSessionData, error: insertSessionError }),
        }

        // ownership check chain: .select('id').eq(...).eq(...).single()
        const selectOwnershipChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: sessionOwnershipRow, error: sessionOwnershipError }),
        }

        // complete session: .select(...).eq(...).eq(...).single()
        const fetchSessionChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: fetchSessionData, error: fetchSessionError }),
        }

        // update chain: .update({...}).eq(...).select(...).single()
        const updateChain = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: updateSessionData, error: updateSessionError }),
        }

        // The from('workout_sessions') return value needs to support all operations.
        // We use a single builder that has all methods and tracks call count
        // to differentiate ownership check vs complete fetch vs update.
        let callCount = 0
        const builder: Record<string, unknown> = {}

        builder.insert = vi.fn((data: unknown) => {
          void data
          return Object.assign({}, insertChain, {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: insertSessionData, error: insertSessionError }),
          })
        })

        builder.select = vi.fn(() => {
          callCount++
          if (callCount === 1) return selectOwnershipChain
          return fetchSessionChain
        })

        builder.update = vi.fn(() => updateChain)

        return builder
      }

      if (table === 'workout_sets') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: insertSetData, error: insertSetError }),
            }),
          }),
        }
      }

      throw new Error(`Unexpected table in test: ${table}`)
    }),
  }
}

// ---------------------------------------------------------------------------
// startSessionAction
// ---------------------------------------------------------------------------

describe('startSessionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
  })

  it('returns serverError when user is not authenticated', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('No session'),
        }),
      },
    } as never)

    const result = await startSessionAction({
      program_day_id: VALID_PROGRAM_DAY_ID,
      program_id: VALID_PROGRAM_ID,
    })

    expect(result?.serverError).toBeDefined()
  })

  it('creates a session with program_day_id and program_id', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await startSessionAction({
      program_day_id: VALID_PROGRAM_DAY_ID,
      program_id: VALID_PROGRAM_ID,
    })

    expect(result?.data).toMatchObject({
      id: VALID_SESSION_ID,
      status: 'in_progress',
    })
  })

  it('creates a session without optional fields (freeform workout)', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await startSessionAction({})

    expect(result?.data).toMatchObject({ status: 'in_progress' })
  })

  it('returns serverError when Supabase insert fails', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildSupabaseMock({ insertSessionData: null, insertSessionError: { message: 'DB error' } }) as never
    )

    const result = await startSessionAction({ program_day_id: VALID_PROGRAM_DAY_ID })

    expect(result?.serverError).toBeDefined()
  })

  it('returns validationErrors for invalid UUID', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await startSessionAction({ program_day_id: 'not-a-uuid' })

    expect(result?.validationErrors).toBeDefined()
  })

  it('returns serverError when rate limit is exceeded', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('Too Many Requests'))

    const result = await startSessionAction({})

    expect(result?.serverError).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// logSetAction
// ---------------------------------------------------------------------------

describe('logSetAction', () => {
  const VALID_INPUT = {
    session_id: VALID_SESSION_ID,
    exercise_id: VALID_EXERCISE_ID,
    program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
    set_number: 1,
    reps_completed: 10,
    weight_kg: 80,
    is_warmup: false,
    is_dropset: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
  })

  it('returns serverError when user is not authenticated', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('No session'),
        }),
      },
    } as never)

    const result = await logSetAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })

  it('returns serverError when session does not belong to user', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildSupabaseMock({ sessionOwnershipRow: null }) as never
    )

    const result = await logSetAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })

  it('logs a set and returns the inserted row', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await logSetAction(VALID_INPUT)

    expect(result?.data).toMatchObject({
      set_number: 1,
      reps_completed: 10,
      weight_kg: 80,
    })
  })

  it('returns serverError when Supabase insert fails', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildSupabaseMock({ insertSetData: null, insertSetError: { message: 'insert failed' } }) as never
    )

    const result = await logSetAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })

  it('returns validationErrors for out-of-range reps', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await logSetAction({ ...VALID_INPUT, reps_completed: 999 })

    expect(result?.validationErrors).toBeDefined()
  })

  it('returns validationErrors for out-of-range set_number', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await logSetAction({ ...VALID_INPUT, set_number: 0 })

    expect(result?.validationErrors).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// completeSessionAction
// ---------------------------------------------------------------------------

describe('completeSessionAction', () => {
  const VALID_INPUT = {
    session_id: VALID_SESSION_ID,
    perceived_effort: 7,
    energy_level: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
  })

  it('returns serverError when user is not authenticated', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('No session'),
        }),
      },
    } as never)

    const result = await completeSessionAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })

  it('returns serverError when session is not found', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildSupabaseMock({ sessionOwnershipRow: null }) as never
    )

    const result = await completeSessionAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })

  it('returns serverError when session is already completed', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildSupabaseMock({
        sessionOwnershipRow: { ...MOCK_SESSION_ROW, status: 'completed' },
      }) as never
    )

    const result = await completeSessionAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })

  it('completes the session and returns completed status', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await completeSessionAction(VALID_INPUT)

    expect(result?.data).toMatchObject({
      id: VALID_SESSION_ID,
      status: 'completed',
    })
  })

  it('returns validationErrors for invalid session_id', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await completeSessionAction({ session_id: 'not-a-uuid' })

    expect(result?.validationErrors).toBeDefined()
  })

  it('returns validationErrors for out-of-range perceived_effort', async () => {
    vi.mocked(createServerClient).mockResolvedValue(buildSupabaseMock() as never)

    const result = await completeSessionAction({
      session_id: VALID_SESSION_ID,
      perceived_effort: 11,
    })

    expect(result?.validationErrors).toBeDefined()
  })

  it('returns serverError when update fails', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildSupabaseMock({
        updateSessionData: null,
        updateSessionError: { message: 'update failed' },
      }) as never
    )

    const result = await completeSessionAction(VALID_INPUT)

    expect(result?.serverError).toBeDefined()
  })
})
