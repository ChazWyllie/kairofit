/**
 * Rate Limiting
 *
 * Upstash Redis-backed rate limiting for all Server Actions and API routes.
 * AI endpoints use stricter limits than general mutations.
 *
 * Call checkRateLimit() at the start of any Server Action that calls Claude.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize once at module level
let redis: Redis | null = null
let limiters: Record<string, Ratelimit> | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

function getLimiters(): Record<string, Ratelimit> {
  if (!limiters) {
    const r = getRedis()
    limiters = {
      // AI generation: expensive, limit tightly
      'ai:generate': new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(3, '5 m'),
        prefix: 'rl:ai:gen',
      }),
      // AI debrief: cheaper, slightly more generous
      'ai:debrief': new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'rl:ai:debrief',
      }),
      // AI adjustment: limit to prevent abuse
      'ai:adjust': new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(5, '5 m'),
        prefix: 'rl:ai:adjust',
      }),
      // AI intake: allow multi-turn conversation
      'ai:intake': new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(30, '5 m'),
        prefix: 'rl:ai:intake',
      }),
      // Auth: prevent brute force
      'auth': new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(10, '5 m'),
        prefix: 'rl:auth',
      }),
      // General mutations: per-user
      'general': new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        prefix: 'rl:general',
      }),
    }
  }
  return limiters
}

/**
 * Check rate limit and throw if exceeded.
 * Use user ID for authenticated requests, IP for unauthenticated.
 *
 * Usage:
 * await checkRateLimit(userId, 'ai:generate')
 */
export async function checkRateLimit(
  identifier: string,
  key: string = 'general'
): Promise<void> {
  const limiters = getLimiters()
  const limiter = limiters[key] ?? limiters['general']

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  if (!success) {
    const resetIn = Math.ceil((reset - Date.now()) / 1000)
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${resetIn} seconds.`,
      { limit, remaining: 0, reset }
    )
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly info: { limit: number; remaining: number; reset: number }
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}
