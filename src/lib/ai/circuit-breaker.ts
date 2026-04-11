/**
 * AI Circuit Breaker (Redis-backed for serverless)
 *
 * Vercel serverless functions are ephemeral - module-level singletons reset on
 * every cold start. A memory-only circuit breaker provides zero protection in
 * production: after 5 failures the circuit "opens", then the next request arrives
 * as a cold start with a reset counter and tries again anyway.
 *
 * Solution: store failure counts and opened_at timestamps in Upstash Redis,
 * which persists across all serverless instances and cold starts.
 *
 * State machine per circuit key:
 *   closed    -> open:      after FAILURE_THRESHOLD failures within WINDOW_SECONDS
 *   open      -> half-open: after RECOVERY_SECONDS have elapsed
 *   half-open -> closed:    on next successful request
 *   half-open -> open:      on next failed request
 */

import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

const FAILURE_THRESHOLD = 5
const WINDOW_SECONDS = 60 // rolling window for counting failures
const RECOVERY_SECONDS = 300 // 5 minutes before retrying after circuit opens

type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitStatus {
  state: CircuitState
  failures: number
  secondsUntilRetry: number | null
}

function failureKey(circuit: string) {
  return `cb:failures:${circuit}`
}
function openedAtKey(circuit: string) {
  return `cb:opened_at:${circuit}`
}

/**
 * Check whether a request should be allowed through.
 * Returns false when the circuit is open and recovery time has not elapsed.
 */
export async function canRequest(circuit: string): Promise<boolean> {
  const r = getRedis()
  const openedAt = await r.get<number>(openedAtKey(circuit))

  if (openedAt === null) return true // closed - allow

  const secondsSinceOpen = Date.now() / 1000 - openedAt
  if (secondsSinceOpen > RECOVERY_SECONDS) return true // half-open probe

  return false // still open
}

/**
 * Record a successful request - close the circuit and reset failure count.
 */
export async function recordSuccess(circuit: string): Promise<void> {
  const r = getRedis()
  await Promise.all([r.del(failureKey(circuit)), r.del(openedAtKey(circuit))])
}

/**
 * Record a failed request. Opens the circuit when threshold is reached.
 */
export async function recordFailure(circuit: string): Promise<void> {
  const r = getRedis()

  const failures = await r.incr(failureKey(circuit))
  if (failures === 1) {
    // Set expiry on first failure in this window
    await r.expire(failureKey(circuit), WINDOW_SECONDS)
  }

  if (failures >= FAILURE_THRESHOLD) {
    const nowSec = Math.floor(Date.now() / 1000)
    await r.set(openedAtKey(circuit), nowSec, { ex: RECOVERY_SECONDS * 2 })
    console.error(`[circuit-breaker] OPENED: ${circuit} after ${failures} failures`)
  }
}

/**
 * Get full circuit status for observability.
 */
export async function getCircuitStatus(circuit: string): Promise<CircuitStatus> {
  const r = getRedis()
  const [failuresRaw, openedAt] = await Promise.all([
    r.get<number>(failureKey(circuit)),
    r.get<number>(openedAtKey(circuit)),
  ])

  const failures = failuresRaw ?? 0

  if (openedAt === null) {
    return { state: 'closed', failures, secondsUntilRetry: null }
  }

  const secondsSinceOpen = Date.now() / 1000 - openedAt
  if (secondsSinceOpen > RECOVERY_SECONDS) {
    return { state: 'half-open', failures, secondsUntilRetry: 0 }
  }

  return {
    state: 'open',
    failures,
    secondsUntilRetry: Math.ceil(RECOVERY_SECONDS - secondsSinceOpen),
  }
}

// ============================================================
// CIRCUIT KEYS - one per AI task type
// ============================================================

export const CIRCUITS = {
  PROGRAM_GENERATION: 'ai:program_generation',
  DEBRIEF: 'ai:debrief',
  ADJUSTMENT: 'ai:adjustment',
  INTAKE: 'ai:intake',
  EXERCISE_SWAP: 'ai:exercise_swap',
} as const

// classifyEquipmentBucket moved to src/lib/utils/equipment.ts per CLAUDE.md architecture rules
export { classifyEquipmentBucket } from '@/lib/utils/equipment'
