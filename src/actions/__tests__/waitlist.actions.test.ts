import { describe, expect, it, beforeEach, vi } from 'vitest'

vi.mock('next/server', () => ({
  after: vi.fn(() => Promise.resolve()),
}))

const insertMock = vi.fn()
const fromMock = vi.fn(() => ({ insert: insertMock }))
const createServerClientMock = vi.fn(async () => ({ from: fromMock }))
const checkRateLimitMock = vi.fn(async () => undefined)
const trackServerMock = vi.fn(async () => undefined)

vi.mock('@/lib/db/supabase', () => ({
  createServerClient: createServerClientMock,
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
}))

vi.mock('@/lib/utils/analytics', () => ({
  trackServer: trackServerMock,
}))

describe('joinWaitlistAction', () => {
  beforeEach(() => {
    vi.resetModules()
    insertMock.mockReset()
    fromMock.mockClear()
    createServerClientMock.mockClear()
    checkRateLimitMock.mockClear()
    trackServerMock.mockClear()
  })

  it('inserts a normalized waitlist row', async () => {
    insertMock.mockResolvedValue({ error: null })
    const { joinWaitlistAction } = await import('../waitlist.actions')

    const result = await joinWaitlistAction({
      email: 'TEST@EXAMPLE.COM',
      source: 'marketing_homepage',
      utm_source: 'x',
    })

    expect(result?.data?.success).toBe(true)
    expect(checkRateLimitMock).toHaveBeenCalled()
    expect(fromMock).toHaveBeenCalledWith('waitlist')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        source: 'marketing_homepage',
        utm_source: 'x',
      })
    )
  })

  it('returns a server error when Supabase insert fails', async () => {
    insertMock.mockResolvedValue({
      error: { message: 'duplicate key value violates unique constraint' },
    })
    const { joinWaitlistAction } = await import('../waitlist.actions')

    const result = await joinWaitlistAction({
      email: 'test@example.com',
      source: 'marketing_homepage',
    })

    expect(result?.serverError).toContain('already on the waitlist')
  })

  it('surfaces a generic server error for non-duplicate Supabase failures', async () => {
    insertMock.mockResolvedValue({
      error: { message: 'connection reset' },
    })
    const { joinWaitlistAction } = await import('../waitlist.actions')

    const result = await joinWaitlistAction({
      email: 'test@example.com',
      source: 'marketing_homepage',
    })

    expect(result?.serverError).toContain('Unable to join the waitlist')
    expect(result?.serverError).not.toContain('already on the waitlist')
  })

  it('returns the rate-limit error message when the limiter throws', async () => {
    checkRateLimitMock.mockRejectedValueOnce(
      new Error('Rate limit exceeded. Try again in 120 seconds.')
    )
    const { joinWaitlistAction } = await import('../waitlist.actions')

    const result = await joinWaitlistAction({
      email: 'test@example.com',
      source: 'marketing_homepage',
    })

    expect(result?.serverError).toContain('Rate limit exceeded')
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('rejects invalid email input via Zod without hitting downstream services', async () => {
    const { joinWaitlistAction } = await import('../waitlist.actions')

    const result = await joinWaitlistAction({
      email: 'not-an-email',
      source: 'marketing_homepage',
    })

    expect(result?.validationErrors?.email).toBeDefined()
    expect(checkRateLimitMock).not.toHaveBeenCalled()
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('uses the waitlist rate-limit key keyed by email', async () => {
    insertMock.mockResolvedValue({ error: null })
    const { joinWaitlistAction } = await import('../waitlist.actions')

    await joinWaitlistAction({
      email: 'Keyed@Example.com',
      source: 'marketing_homepage',
    })

    expect(checkRateLimitMock).toHaveBeenCalledWith('Keyed@Example.com', 'waitlist')
  })
})
