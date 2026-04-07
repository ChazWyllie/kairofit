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

import { after } from 'next/server'
import { createSafeActionClient } from 'next-safe-action'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { calculateRecoveryUpdates } from '@/lib/utils/recovery-model'
import { updateMuscleRecovery } from '@/lib/db/queries/recovery'
import { trackServer } from '@/lib/utils/analytics'
import { EVENTS } from '@/lib/utils/event-names'
import {
  logSetSchema,
  startSessionSchema,
  completeSessionSchema,
  RATE_LIMIT_KEYS,
} from '@/lib/validation/schemas'
import type { MuscleGroup } from '@/types'

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

    after(() => {
      void trackServer(user.id, EVENTS.SET_LOGGED, {
        session_id: parsedInput.session_id,
        exercise_name: parsedInput.exercise_name,
        reps: parsedInput.reps_completed,
        weight_kg: parsedInput.weight_kg,
      })
    })

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

    after(() => {
      void trackServer(user.id, EVENTS.WORKOUT_STARTED, {
        session_id: data.id,
        program_id: parsedInput.program_id ?? null,
      })
    })

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

    after(() => {
      void trackServer(user.id, EVENTS.WORKOUT_COMPLETED, {
        session_id: parsedInput.session_id,
        duration_seconds: durationSeconds,
        perceived_effort: parsedInput.perceived_effort,
      })
    })

    // Update muscle recovery asynchronously after response is sent
    // This runs non-blocking: user sees the complete page before recovery updates finish
    after(async () => {
      try {
        // Fetch all sets from this session to extract muscles worked
        const { data: sets, error: setsError } = await supabase
          .from('workout_sets')
          .select(
            `
            id, exercise_id, is_warmup,
            exercises (id, primary_muscles)
          `
          )
          .eq('session_id', parsedInput.session_id)
          .eq('is_warmup', false)

        if (setsError) {
          console.error('Failed to fetch sets for recovery update:', setsError.message)
          return
        }

        // Extract muscle groups and count sets per muscle
        const muscleSetCounts = new Map<string, number>()
        for (const set of sets ?? []) {
          const primaryMuscles = (set.exercises as unknown as { primary_muscles: string[] })
            .primary_muscles
          for (const muscle of primaryMuscles) {
            muscleSetCounts.set(muscle, (muscleSetCounts.get(muscle) ?? 0) + 1)
          }
        }

        // Calculate recovery updates for each muscle
        const recoveryUpdates = calculateRecoveryUpdates(
          Array.from(muscleSetCounts.entries()).map(([muscle, setCount]) => ({
            muscle: muscle as MuscleGroup,
            sets: setCount,
          })),
          completedAt
        )

        // Upsert each muscle's recovery data
        for (const update of recoveryUpdates) {
          await updateMuscleRecovery(user.id, update.muscle_group, {
            estimated_recovery_pct: update.estimated_recovery_pct,
            last_trained_at: update.last_trained_at,
            sets_this_week: 0, // Will be calculated separately in a weekly reset
          })
        }
      } catch (err) {
        console.error('Recovery update failed (non-blocking):', err)
        // Silently fail - this runs after response, should not affect user experience
      }
    })

    return data
  })
