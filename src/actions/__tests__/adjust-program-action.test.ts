/**
 * adjustProgramAction Tests - TDD-first (RED phase)
 *
 * Tests:
 * 1. Zod-fail: feedback < 10 chars returns validationErrors
 * 2. rate-limit: checkRateLimit throws returns serverError (and must use AI_ADJUST key)
 * 3. safety-fail: checkInputSafety returns safe=false returns serverError
 * 4. circuit-open: canRequest returns false returns serverError
 * 5. happy path: all checks pass returns data.updatedProgram with id
 *
 * Tests 2-5 fail with the current stub because it:
 *   - Uses the wrong rate-limit key (AI_GENERATE instead of AI_ADJUST)
 *   - Never calls checkInputSafety
 *   - Never calls canRequest
 *   - Always throws instead of returning a program
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (must be declared before imports that use them - Vitest hoists vi.mock)
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  after: vi.fn(),
}))

vi.mock('@/lib/db/supabase', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  RateLimitError: class RateLimitError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'RateLimitError'
    }
  },
}))

vi.mock('@/lib/ai/safety-filter', () => ({
  checkInputSafety: vi.fn(),
}))

vi.mock('@/lib/ai/circuit-breaker', () => ({
  canRequest: vi.fn(),
  recordSuccess: vi.fn(),
  recordFailure: vi.fn(),
  CIRCUITS: {
    PROGRAM_GENERATION: 'ai:program_generation',
    DEBRIEF: 'ai:debrief',
    ADJUSTMENT: 'ai:adjustment',
    INTAKE: 'ai:intake',
  },
}))

vi.mock('@/lib/db/queries/programs', () => ({
  getActiveProgram: vi.fn(),
  getProgramById: vi.fn(),
  saveProgramToDb: vi.fn(),
}))

vi.mock('@/lib/ai/workout-generator', () => ({
  generateProgram: vi.fn(),
  adjustProgram: vi.fn(),
}))

vi.mock('@/lib/db/queries/profiles', () => ({
  getProfileForGeneration: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { checkInputSafety } from '@/lib/ai/safety-filter'
import { canRequest, recordSuccess, CIRCUITS } from '@/lib/ai/circuit-breaker'
import { getProgramById, saveProgramToDb } from '@/lib/db/queries/programs'
import { adjustProgram } from '@/lib/ai/workout-generator'
import { adjustProgramAction } from '../program.actions'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-111', email: 'user@example.com' }

const VALID_PROGRAM_ID = '00000000-0000-0000-0000-000000000001'
const VALID_FEEDBACK = 'I want to add more chest work and reduce leg volume this week'

const MOCK_PROGRAM = {
  id: VALID_PROGRAM_ID,
  user_id: MOCK_USER.id,
  name: 'Upper Lower 4x',
  is_active: true,
  current_week: 1,
  days_per_week: 4,
  program_days: [],
}

const MOCK_ADJUSTED_PROGRAM = {
  name: 'Upper Lower 4x (adjusted)',
  description: 'Updated based on feedback',
  ai_rationale: 'Added chest volume, reduced leg frequency',
  weeks_duration: 8,
  progression_scheme: 'linear',
  projected_weeks_to_goal: 12,
  projected_outcome_description: 'Hypertrophy focus',
  days: [],
}

const MOCK_SAVED_PROGRAM = {
  id: VALID_PROGRAM_ID,
  user_id: MOCK_USER.id,
  name: 'Upper Lower 4x (adjusted)',
  is_active: true,
  program_days: [],
}

function buildAuthMock() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('adjustProgramAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: auth passes
    vi.mocked(createServerClient).mockResolvedValue(buildAuthMock() as never)

    // Default: rate limit passes
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)

    // Default: safety passes
    vi.mocked(checkInputSafety).mockResolvedValue({
      safe: true,
      reason: null,
      category: 'safe',
    })

    // Default: circuit closed
    vi.mocked(canRequest).mockResolvedValue(true)
    vi.mocked(recordSuccess).mockResolvedValue(undefined)

    // Default: program found
    vi.mocked(getProgramById).mockResolvedValue(MOCK_PROGRAM as never)

    // Default: AI adjustment succeeds
    vi.mocked(adjustProgram).mockResolvedValue({
      program: MOCK_ADJUSTED_PROGRAM,
      source: 'ai_sonnet',
    } as never)

    // Default: save succeeds
    vi.mocked(saveProgramToDb).mockResolvedValue(MOCK_SAVED_PROGRAM as never)
  })

  // -------------------------------------------------------------------------
  // Test 1: Zod validation - feedback too short
  // -------------------------------------------------------------------------

  it('should return validationErrors when feedback is shorter than 10 characters', async () => {
    const result = await adjustProgramAction({
      program_id: VALID_PROGRAM_ID,
      feedback: 'short', // 5 chars, min is 10
    })

    expect(result?.validationErrors).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Test 2: Rate limiting - must use AI_ADJUST key, not AI_GENERATE
  // -------------------------------------------------------------------------

  it('should return serverError when rate limit is exceeded and must use AI_ADJUST key', async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('Too Many Requests'))

    const result = await adjustProgramAction({
      program_id: VALID_PROGRAM_ID,
      feedback: VALID_FEEDBACK,
    })

    expect(result?.serverError).toBeDefined()

    // Verify the CORRECT rate limit key is used (AI_ADJUST, not AI_GENERATE)
    // The current stub uses RATE_LIMIT_KEYS.AI_GENERATE - this assertion catches that bug
    expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith(MOCK_USER.id, 'ai:adjust')
  })

  // -------------------------------------------------------------------------
  // Test 3: Safety filter - feedback is flagged as unsafe
  // -------------------------------------------------------------------------

  it('should return serverError when safety filter rejects the feedback', async () => {
    vi.mocked(checkInputSafety).mockResolvedValue({
      safe: false,
      reason: 'Out of scope request',
      category: 'out_of_scope',
    })

    const result = await adjustProgramAction({
      program_id: VALID_PROGRAM_ID,
      feedback: VALID_FEEDBACK,
    })

    expect(result?.serverError).toBeDefined()

    // Verify safety filter was called with the user's feedback
    expect(vi.mocked(checkInputSafety)).toHaveBeenCalledWith(VALID_FEEDBACK)
  })

  // -------------------------------------------------------------------------
  // Test 4: Circuit breaker - circuit is open, request should be blocked
  // -------------------------------------------------------------------------

  it('should return serverError when circuit breaker is open', async () => {
    vi.mocked(canRequest).mockResolvedValue(false)

    const result = await adjustProgramAction({
      program_id: VALID_PROGRAM_ID,
      feedback: VALID_FEEDBACK,
    })

    expect(result?.serverError).toBeDefined()

    // Verify circuit breaker was checked for the ADJUSTMENT circuit
    expect(vi.mocked(canRequest)).toHaveBeenCalledWith(CIRCUITS.ADJUSTMENT)
  })

  // -------------------------------------------------------------------------
  // Test 5: Happy path - returns updatedProgram with id
  // -------------------------------------------------------------------------

  it('should return updatedProgram with id on success', async () => {
    const result = await adjustProgramAction({
      program_id: VALID_PROGRAM_ID,
      feedback: VALID_FEEDBACK,
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.updatedProgram).toBeDefined()
    expect(result?.data?.updatedProgram?.id).toBe(VALID_PROGRAM_ID)
  })
})
