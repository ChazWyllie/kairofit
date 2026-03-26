/**
 * Workout Server Actions
 *
 * All mutations for workout sessions and set logging.
 * Uses next-safe-action v7 with auth + rate limit middleware.
 * See skills/server-action-builder/SKILL.md for the canonical pattern.
 *
 * Every action: auth check -> Zod validation -> rate limit -> DB operation
 */

'use server'

import { createSafeActionClient } from 'next-safe-action'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import {
  logSetSchema,
  startSessionSchema,
  completeSessionSchema,
  RATE_LIMIT_KEYS,
} from '@/lib/validation/schemas'

// ============================================================
// AUTHENTICATED ACTION CLIENT WITH MIDDLEWARE
// Auth check runs before EVERY action in this file.
// ============================================================

const action = createSafeActionClient().use(async ({ next }) => {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Authentication required')
  return next({ ctx: { user, supabase } })
})

// ============================================================
// LOG SET
// ============================================================

export const logSetAction = action
  .schema(logSetSchema)
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    // Verify session ownership (RLS also enforces, but fail fast with clear error)
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('id', parsedInput.session_id)
      .eq('user_id', user.id)
      .single()

    if (!session) throw new Error('Session not found or does not belong to this user')

    const { data, error } = await supabase
      .from('workout_sets')
      .insert({
        session_id: parsedInput.session_id,
        exercise_id: parsedInput.exercise_id,
        program_exercise_id: parsedInput.program_exercise_id ?? null,
        set_number: parsedInput.set_number,
        reps_completed: parsedInput.reps_completed,
        weight_kg: parsedInput.weight_kg ?? null,
        rpe: parsedInput.rpe ?? null,
        is_warmup: parsedInput.is_warmup,
        is_dropset: parsedInput.is_dropset,
        user_id: user.id, // always server-resolved user_id
      })
      .select('id, set_number, reps_completed, weight_kg, rpe, logged_at')
      .single()

    if (error) throw new Error(`Failed to log set: ${error.message}`)

    // TODO: Check for new PR and update personal_records
    return data
  })

// ============================================================
// START SESSION
// ============================================================

export const startSessionAction = action
  .schema(startSessionSchema)
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        program_day_id: parsedInput.program_day_id ?? null,
        program_id: parsedInput.program_id ?? null,
        started_at: new Date().toISOString(),
        status: 'in_progress',
      })
      .select('id, started_at, status')
      .single()

    if (error) throw new Error(`Failed to start session: ${error.message}`)
    return data
  })

// ============================================================
// COMPLETE SESSION
// ============================================================

export const completeSessionAction = action
  .schema(completeSessionSchema)
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    const { data: session } = await supabase
      .from('workout_sessions')
      .select('id, started_at, status')
      .eq('id', parsedInput.session_id)
      .eq('user_id', user.id)
      .single()

    if (!session) throw new Error('Session not found')
    if (session.status === 'completed') throw new Error('Session already completed')

    const completedAt = new Date()
    const startedAt = session.started_at ? new Date(session.started_at) : completedAt
    const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        status: 'completed',
        completed_at: completedAt.toISOString(),
        duration_seconds: durationSeconds,
        perceived_effort: parsedInput.perceived_effort ?? null,
        energy_level: parsedInput.energy_level ?? null,
        user_notes: parsedInput.user_notes ?? null,
      })
      .eq('id', parsedInput.session_id)
      .select('id, completed_at, duration_seconds, status')
      .single()

    if (error) throw new Error(`Failed to complete session: ${error.message}`)

    // TODO: Use after() API for non-blocking post-completion work:
    // import { after } from 'next/server'
    // after(async () => {
    //   await updateMuscleRecovery(session.id, user.id)
    //   await checkForNewPRs(session.id, user.id)
    // })

    return data
  })
