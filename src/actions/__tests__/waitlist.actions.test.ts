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
})
