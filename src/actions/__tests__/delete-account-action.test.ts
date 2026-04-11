/**
 * deleteAccountAction Tests - TDD-first (RED phase)
 *
 * Tests:
 * 1. Zod-fail: confirmation !== 'DELETE' returns validationErrors
 * 2. rate-limit: checkRateLimit throws returns serverError
 * 3. admin-delete-fails: auth.admin.deleteUser returns error returns serverError
 * 4. happy path: all checks pass returns { success: true, revoke_sessions: true }
 *
 * Tests 2-4 fail with the current stub because it:
 *   - Uses a dynamic import schema instead of deleteAccountSchema
 *   - Always throws 'Account deletion not yet implemented'
 *   - Never calls auth.admin.deleteUser
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
  createAdminClient: vi.fn(),
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

import { createServerClient, createAdminClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { deleteAccountAction } from '../profile.actions'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-222', email: 'user@example.com' }

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

function buildAdminMock(deleteError: null | { message: string } = null) {
  return {
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: deleteError }),
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('deleteAccountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: auth passes
    vi.mocked(createServerClient).mockResolvedValue(buildAuthMock() as never)

    // Default: admin client - delete succeeds
    vi.mocked(createAdminClient).mockReturnValue(buildAdminMock() as never)

    // Default: rate limit passes
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // Test 1: Zod validation - confirmation must be exactly 'DELETE'
  // -------------------------------------------------------------------------

  it('should return validationErrors when confirmation is not DELETE', async () => {
    const result = await deleteAccountAction({
      confirmation: 'delete' as 'DELETE', // wrong case
    })

    expect(result?.validationErrors).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Test 2: Rate limiting
  // -------------------------------------------------------------------------

  it('should return serverError when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('Too Many Requests'))

    const result = await deleteAccountAction({ confirmation: 'DELETE' })

    expect(result?.serverError).toBeDefined()
    expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith(MOCK_USER.id, 'general')
  })

  // -------------------------------------------------------------------------
  // Test 3: Admin delete fails
  // -------------------------------------------------------------------------

  it('should return serverError when auth.admin.deleteUser returns an error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildAdminMock({ message: 'User not found' }) as never
    )

    const result = await deleteAccountAction({ confirmation: 'DELETE' })

    expect(result?.serverError).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Test 4: Happy path
  // -------------------------------------------------------------------------

  it('should return success and revoke_sessions on successful account deletion', async () => {
    const result = await deleteAccountAction({ confirmation: 'DELETE' })

    expect(result?.data).toBeDefined()
    expect(result?.data?.success).toBe(true)
    expect(result?.data?.revoke_sessions).toBe(true)

    // Verify admin.deleteUser was called with the authenticated user's ID
    const adminMock = vi.mocked(createAdminClient)()
    expect(adminMock.auth.admin.deleteUser).toHaveBeenCalledWith(MOCK_USER.id)
  })
})
