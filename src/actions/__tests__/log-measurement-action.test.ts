/**
 * logMeasurementAction Tests - TDD-first (RED phase)
 *
 * Tests:
 * 1. Zod-fail: weight_kg below minimum (< 20) returns validationErrors
 * 2. rate-limit: checkRateLimit throws returns serverError
 * 3. rpc-error: supabase.rpc returns error returns serverError
 * 4. happy path: all checks pass returns { success: true, measurement_id: uuid }
 *
 * Tests 2-4 fail with the current stub because it always throws
 * 'Measurement logging not yet implemented - pending encryption utility'
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (must be declared before imports that use them - Vitest hoists vi.mock)
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  after: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

vi.mock('@/lib/utils/analytics', () => ({
  trackServer: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { logMeasurementAction } from '../profile.actions'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-333', email: 'user@example.com' }
const MOCK_MEASUREMENT_ID = 'meas-uuid-001'

function buildAuthMock(rpcError: null | { message: string } = null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    },
    rpc: vi.fn().mockResolvedValue({
      data: rpcError ? null : MOCK_MEASUREMENT_ID,
      error: rpcError,
    }),
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('logMeasurementAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: auth passes, RPC succeeds
    vi.mocked(createServerClient).mockResolvedValue(buildAuthMock() as never)

    // Default: rate limit passes
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // Test 1: Zod validation - weight_kg must be >= 20
  // -------------------------------------------------------------------------

  it('should return validationErrors when weight_kg is below minimum', async () => {
    const result = await logMeasurementAction({ weight_kg: 5 })

    expect(result?.validationErrors).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Test 2: Rate limiting
  // -------------------------------------------------------------------------

  it('should return serverError when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('Too Many Requests'))

    const result = await logMeasurementAction({ weight_kg: 80 })

    expect(result?.serverError).toBeDefined()
    expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith(MOCK_USER.id, 'general')
  })

  // -------------------------------------------------------------------------
  // Test 3: RPC error
  // -------------------------------------------------------------------------

  it('should return serverError when the RPC call fails', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      buildAuthMock({ message: 'Vault key not found' }) as never
    )

    const result = await logMeasurementAction({ weight_kg: 80 })

    expect(result?.serverError).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Test 4: Happy path
  // -------------------------------------------------------------------------

  it('should return success and measurement_id on successful log', async () => {
    const result = await logMeasurementAction({
      weight_kg: 80,
      body_fat_pct: 18,
      notes: 'Morning measurement',
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.success).toBe(true)
    expect(result?.data?.measurement_id).toBe(MOCK_MEASUREMENT_ID)

    // Verify RPC was called with the correct user and values
    const clientMock = await vi.mocked(createServerClient)()
    expect(clientMock.rpc).toHaveBeenCalledWith(
      'log_body_measurement',
      expect.objectContaining({
        p_user_id: MOCK_USER.id,
        p_weight_kg: '80',
        p_body_fat_pct: '18',
      })
    )
  })
})
