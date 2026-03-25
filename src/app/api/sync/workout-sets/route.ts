/**
 * Background Sync Route Handler
 *
 * Called by the Serwist service worker when connectivity returns after
 * an offline workout session. Reads pending sets from the request body
 * (assembled by the service worker from IndexedDB) and writes them to Supabase.
 *
 * Auth: service worker requests carry the browser's cookie automatically,
 * so the standard Supabase SSR auth works here. The middleware passes
 * /api/sync/* through without redirecting.
 *
 * Why a Route Handler (not a Server Action):
 * Service workers cannot call Server Actions - they use fetch() with POST.
 * Route Handlers are the correct pattern for service worker endpoints.
 *
 * Flow:
 * 1. Service worker collects pending LocalWorkoutSet[] from IndexedDB
 * 2. POSTs them here as JSON
 * 3. This route validates, deduplicates, and inserts to Supabase
 * 4. Returns { synced: string[], failed: string[] } with set IDs
 * 5. Service worker marks synced IDs in IndexedDB
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { z } from 'zod'
import { RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

// Schema for the sets the service worker sends
const SyncSetSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  user_id: z.string().uuid(),
  set_number: z.number().int().min(1).max(20),
  reps_completed: z.number().int().min(1).max(100),
  weight_kg: z.number().min(0).max(500).nullable(),
  rpe: z.number().int().min(1).max(10).nullable(),
  is_warmup: z.boolean(),
  is_dropset: z.boolean(),
  logged_at: z.string().datetime(),
})

const SyncRequestSchema = z.object({
  sets: z.array(SyncSetSchema).min(1).max(500),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verify auth - service worker carries browser cookie automatically
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 10 requests per 5 minutes per user
    // Background sync fires at most once per connectivity-return event
    // so this is generous enough for normal use but blocks abuse loops
    try {
      await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)
    } catch {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Parse and validate the request body
    const body = await request.json()
    const parsed = SyncRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { sets } = parsed.data

    // Security: ensure all sets belong to the authenticated user
    // (never trust user_id from the client)
    const invalidSets = sets.filter((s) => s.user_id !== user.id)
    if (invalidSets.length > 0) {
      return NextResponse.json(
        { error: 'Sets contain user_id values that do not match authenticated user' },
        { status: 403 }
      )
    }

    const synced: string[] = []
    const failed: string[] = []

    // Insert in batches to avoid hitting Supabase row limits
    const BATCH_SIZE = 50
    for (let i = 0; i < sets.length; i += BATCH_SIZE) {
      const batch = sets.slice(i, i + BATCH_SIZE)

      const { data, error } = await supabase
        .from('workout_sets')
        .upsert(
          // Map from LocalWorkoutSet shape to DB shape
          batch.map(({ id, session_id, exercise_id, user_id, set_number,
            reps_completed, weight_kg, rpe, is_warmup, is_dropset, logged_at }) => ({
            id, session_id, exercise_id, user_id, set_number,
            reps_completed, weight_kg, rpe, is_warmup, is_dropset, logged_at,
          })),
          {
            onConflict: 'id',  // idempotent: re-syncing a set is safe
            ignoreDuplicates: false,  // update if already exists (handles partial syncs)
          }
        )
        .select('id')

      if (error) {
        console.error(`Sync batch ${i}-${i + BATCH_SIZE} failed:`, error.message)
        batch.forEach((s) => failed.push(s.id))
      } else {
        data?.forEach((row) => synced.push(row.id))
      }
    }

    return NextResponse.json({ synced, failed }, { status: 200 })

  } catch (err) {
    console.error('Sync route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
