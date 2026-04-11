/**
 * swapExerciseAction Tests - TDD-first (RED phase)
 *
 * Tests:
 * 1. Zod-fail: invalid UUID returns validationErrors
 * 2. rate-limit: checkRateLimit throws returns serverError (must use AI_SWAP key)
 * 3. no-candidates: getSwapCandidates returns [] returns { success: false } without calling Claude
 * 4. safety-fail: checkInputSafety returns safe=false returns serverError
 * 5. circuit-open: canRequest returns false returns serverError
 * 6. happy path: all checks pass returns { success: true, newExerciseId }
 *
 * Tests 2-6 fail with the current stub because it:
 *   - Uses RATE_LIMIT_KEYS.GENERAL instead of AI_SWAP
 *   - Never fetches program exercise context or swap candidates
 *   - Never calls checkInputSafety
 *   - Never calls canRequest
 *   - Always throws instead of returning a result
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
    EXERCISE_SWAP: 'ai:exercise_swap',
  },
}))

vi.mock('@/lib/db/queries/programs', () => ({
  getActiveProgram: vi.fn(),
  getProgramById: vi.fn(),
  saveProgramToDb: vi.fn(),
  getProgramExerciseWithContext: vi.fn(),
  getSwapCandidates: vi.fn(),
  updateProgramExercise: vi.fn(),
}))

vi.mock('@/lib/ai/workout-generator', () => ({
  generateProgram: vi.fn(),
  adjustProgram: vi.fn(),
  swapExercise: vi.fn(),
}))

vi.mock('@/lib/db/queries/profiles', () => ({
  getProfileForGeneration: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { checkInputSafety } from '@/lib/ai/safety-filter'
import { canRequest, recordSuccess, CIRCUITS } from '@/lib/ai/circuit-breaker'
import {
  getProgramExerciseWithContext,
  getSwapCandidates,
  updateProgramExercise,
} from '@/lib/db/queries/programs'
import { swapExercise } from '@/lib/ai/workout-generator'
import { swapExerciseAction } from '../program.actions'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-222', email: 'user@example.com' }

const VALID_PROGRAM_EXERCISE_ID = '00000000-0000-0000-0000-000000000010'
const VALID_NEW_EXERCISE_ID = '00000000-0000-0000-0000-000000000099'
const VALID_REASON = 'Knee pain makes squats uncomfortable right now'

const MOCK_PROGRAM_EXERCISE_CONTEXT = {
  program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
  exercise_id: '00000000-0000-0000-0000-000000000011',
  exercise_name: 'Barbell Back Squat',
  primary_muscles: ['quads', 'glutes'],
  equipment_required: ['barbell', 'rack'],
  user_equipment: ['barbell', 'rack', 'dumbbells'],
  user_injuries: [],
}

const MOCK_CANDIDATES = [
  {
    id: VALID_NEW_EXERCISE_ID,
    name: 'Leg Press',
    primary_muscles: ['quads', 'glutes'],
    equipment_required: ['leg_press_machine'],
    contraindicated_for: [],
  },
  {
    id: '00000000-0000-0000-0000-000000000098',
    name: 'Hack Squat',
    primary_muscles: ['quads'],
    equipment_required: ['hack_squat_machine'],
    contraindicated_for: [],
  },
]

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

describe('swapExerciseAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: auth passes
    vi.mocked(createServerClient).mockResolvedValue(buildAuthMock() as never)

    // Default: rate limit passes
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)

    // Default: exercise context found
    vi.mocked(getProgramExerciseWithContext).mockResolvedValue(
      MOCK_PROGRAM_EXERCISE_CONTEXT as never
    )

    // Default: candidates found
    vi.mocked(getSwapCandidates).mockResolvedValue(MOCK_CANDIDATES as never)

    // Default: safety passes
    vi.mocked(checkInputSafety).mockResolvedValue({
      safe: true,
      reason: null,
      category: 'safe',
    })

    // Default: circuit closed
    vi.mocked(canRequest).mockResolvedValue(true)
    vi.mocked(recordSuccess).mockResolvedValue(undefined)

    // Default: AI picks replacement
    vi.mocked(swapExercise).mockResolvedValue(VALID_NEW_EXERCISE_ID)

    // Default: update succeeds
    vi.mocked(updateProgramExercise).mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // Test 1: Zod validation - invalid UUID
  // -------------------------------------------------------------------------

  it('should return validationErrors when program_exercise_id is not a valid UUID', async () => {
    const result = await swapExerciseAction({
      program_exercise_id: 'not-a-uuid',
    })

    expect(result?.validationErrors).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Test 2: Rate limiting - must use AI_SWAP key
  // -------------------------------------------------------------------------

  it('should return serverError when rate limit is exceeded and must use AI_SWAP key', async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('Too Many Requests'))

    const result = await swapExerciseAction({
      program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
    })

    expect(result?.serverError).toBeDefined()

    // Verify the correct rate limit key is used (AI_SWAP, not GENERAL)
    expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith(MOCK_USER.id, 'ai:swap')
  })

  // -------------------------------------------------------------------------
  // Test 3: No valid candidates - return success:false WITHOUT calling Claude
  // -------------------------------------------------------------------------

  it('should return { success: false } without calling Claude when no candidates exist', async () => {
    vi.mocked(getSwapCandidates).mockResolvedValue([] as never)

    const result = await swapExerciseAction({
      program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
    })

    expect(result?.data).toEqual({ success: false })

    // Claude must NOT be called when there are no candidates
    expect(vi.mocked(swapExercise)).not.toHaveBeenCalled()
    expect(vi.mocked(canRequest)).not.toHaveBeenCalled()
    expect(vi.mocked(checkInputSafety)).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 4: Safety filter - reason is flagged as unsafe
  // -------------------------------------------------------------------------

  it('should return serverError when safety filter rejects the reason', async () => {
    vi.mocked(checkInputSafety).mockResolvedValue({
      safe: false,
      reason: 'Out of scope request',
      category: 'out_of_scope',
    })

    const result = await swapExerciseAction({
      program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
      reason: VALID_REASON,
    })

    expect(result?.serverError).toBeDefined()

    // Verify safety filter was called with the user's reason
    expect(vi.mocked(checkInputSafety)).toHaveBeenCalledWith(VALID_REASON)

    // Claude must NOT be called when safety fails
    expect(vi.mocked(swapExercise)).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 5: Circuit breaker - circuit is open
  // -------------------------------------------------------------------------

  it('should return serverError when circuit breaker is open', async () => {
    vi.mocked(canRequest).mockResolvedValue(false)

    const result = await swapExerciseAction({
      program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
    })

    expect(result?.serverError).toBeDefined()

    // Verify circuit breaker was checked for the EXERCISE_SWAP circuit
    expect(vi.mocked(canRequest)).toHaveBeenCalledWith(CIRCUITS.EXERCISE_SWAP)
  })

  // -------------------------------------------------------------------------
  // Test 6: Happy path - returns { success: true, newExerciseId }
  // -------------------------------------------------------------------------

  it('should return { success: true, newExerciseId } on successful swap', async () => {
    const result = await swapExerciseAction({
      program_exercise_id: VALID_PROGRAM_EXERCISE_ID,
      reason: VALID_REASON,
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.success).toBe(true)
    expect(result?.data?.newExerciseId).toBe(VALID_NEW_EXERCISE_ID)

    // Verify the program exercise was updated with the new exercise
    expect(vi.mocked(updateProgramExercise)).toHaveBeenCalledWith(
      VALID_PROGRAM_EXERCISE_ID,
      VALID_NEW_EXERCISE_ID,
      MOCK_USER.id,
      expect.any(String)
    )

    // Verify circuit was recorded as success
    expect(vi.mocked(recordSuccess)).toHaveBeenCalledWith(CIRCUITS.EXERCISE_SWAP)
  })
})
