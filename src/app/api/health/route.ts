/**
 * Health Check Endpoint
 *
 * GET /api/health - returns 200 if the app, Supabase, and Redis are reachable.
 * Used by uptime monitors (Vercel, Better Uptime, Checkly, etc.).
 *
 * Does not require authentication - middleware already passes /api/* through.
 * Kept lightweight: no heavy imports, no auth, no rate limiting.
 */

import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ServiceStatus {
  status: 'ok' | 'error'
  latency_ms: number
  error?: string
}

export async function GET() {
  const timestamp = new Date().toISOString()
  const services: Record<string, ServiceStatus> = {}

  // Check Supabase connectivity via the REST API (lightweight ping)
  const supabaseStart = Date.now()
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured')

    const res = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      },
      signal: AbortSignal.timeout(5000),
    })

    services.supabase = {
      status: res.ok ? 'ok' : 'error',
      latency_ms: Date.now() - supabaseStart,
      ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
    }
  } catch (err) {
    services.supabase = {
      status: 'error',
      latency_ms: Date.now() - supabaseStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }

  // Check Redis connectivity
  const redisStart = Date.now()
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!redisUrl || !redisToken) throw new Error('Redis env vars not configured')

    const redis = new Redis({ url: redisUrl, token: redisToken })
    await redis.ping()

    services.redis = {
      status: 'ok',
      latency_ms: Date.now() - redisStart,
    }
  } catch (err) {
    services.redis = {
      status: 'error',
      latency_ms: Date.now() - redisStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }

  const allHealthy = Object.values(services).every((s) => s.status === 'ok')

  return NextResponse.json(
    {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp,
      services,
    },
    { status: allHealthy ? 200 : 503 }
  )
}
