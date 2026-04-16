/**
 * Server Analytics Tests
 *
 * Tests for trackServer() - the server-side PostHog helper.
 *
 * Key behaviors:
 * - No-ops gracefully when NEXT_PUBLIC_POSTHOG_KEY is absent (CI, tests)
 * - Calls client.capture with correct event name and properties
 * - Calls client.shutdown() to flush before the serverless function ends
 * - Returns void (fire-and-forget pattern - caller wraps in after())
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock posthog-node before importing the module under test
// ---------------------------------------------------------------------------

const mockCapture = vi.fn()
const mockShutdown = vi.fn().mockResolvedValue(undefined)

vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: mockCapture,
    shutdown: mockShutdown,
  })),
}))

// Import AFTER mock is registered
import { trackServer } from '../analytics'

describe('trackServer', () => {
  const ORIGINAL_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original env
    if (ORIGINAL_KEY === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = ORIGINAL_KEY
    }
  })

  it('does nothing when NEXT_PUBLIC_POSTHOG_KEY is not set', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY

    await trackServer('user-123', 'WORKOUT_STARTED', { program_id: 'abc' })

    expect(mockCapture).not.toHaveBeenCalled()
    expect(mockShutdown).not.toHaveBeenCalled()
  })

  it('calls client.capture with the correct distinctId and event', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_testkey'

    await trackServer('user-456', 'WORKOUT_COMPLETED', { total_sets: 12 })

    expect(mockCapture).toHaveBeenCalledOnce()
    expect(mockCapture).toHaveBeenCalledWith({
      distinctId: 'user-456',
      event: 'WORKOUT_COMPLETED',
      properties: { total_sets: 12 },
    })
  })

  it('calls client.shutdown() to flush the event', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_testkey'

    await trackServer('user-789', 'SET_LOGGED', { reps: 8 })

    expect(mockShutdown).toHaveBeenCalledOnce()
  })

  it('works without properties (optional arg)', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_testkey'

    await trackServer('user-abc', 'KIRO_DEBRIEF_VIEWED')

    expect(mockCapture).toHaveBeenCalledWith({
      distinctId: 'user-abc',
      event: 'KIRO_DEBRIEF_VIEWED',
    })
  })

  it('does not throw when shutdown rejects (non-blocking)', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_testkey'
    mockShutdown.mockRejectedValueOnce(new Error('flush failed'))

    await expect(trackServer('user-xyz', 'WORKOUT_STARTED')).resolves.toBeUndefined()
  })
})
