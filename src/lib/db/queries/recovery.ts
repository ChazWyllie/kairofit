/**
 * Muscle Recovery Database Query Functions
 *
 * Typed Supabase query functions for the muscle_recovery table.
 * The auth trigger in 001_initial_schema.sql seeds all 13 muscle groups
 * at 100% on signup, so getMuscleRecovery will always return 13 rows
 * for any authenticated user who has completed signup.
 */

import { createServerClient } from '@/lib/db/supabase'
import type { MuscleGroup, MuscleRecovery } from '@/types'

/**
 * Get all muscle recovery rows for a user.
 * Returns 13 rows (one per muscle group) seeded at signup.
 * Ordered by estimated_recovery_pct ascending so the most fatigued muscles
 * appear first - useful for the dashboard heatmap sort order.
 */
export async function getMuscleRecovery(userId: string): Promise<MuscleRecovery[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('muscle_recovery')
    .select(
      'user_id, muscle_group, last_trained_at, estimated_recovery_pct, sets_this_week, updated_at'
    )
    .eq('user_id', userId)
    .order('estimated_recovery_pct', { ascending: true })

  if (error) {
    console.error('getMuscleRecovery error:', error.message)
  }

  return (data ?? []) as unknown as MuscleRecovery[]
}

/**
 * Update recovery percentage and sets-this-week for a single muscle group.
 * Called by completeSessionAction via the after() API (non-blocking post-response update).
 *
 * Uses upsert to handle the case where a row might not exist (defensive coding).
 * In practice, the auth trigger seeds all 13 rows on signup.
 */
export async function updateMuscleRecovery(
  userId: string,
  muscleGroup: MuscleGroup,
  updates: {
    estimated_recovery_pct: number
    sets_this_week: number
    last_trained_at: string
  }
): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.from('muscle_recovery').upsert(
    {
      user_id: userId,
      muscle_group: muscleGroup,
      ...updates,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,muscle_group' }
  )

  if (error) {
    console.error('updateMuscleRecovery error:', error.message)
    // Not throwing - this runs after() response delivery and a failure
    // should not surface as a user-visible error
  }
}

/**
 * Reset sets_this_week to 0 for all muscle groups for a user.
 * Called at the start of each new training week.
 * In practice this is handled by the weekly cron or lazily on first session of the week.
 */
export async function resetWeeklySets(userId: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('muscle_recovery')
    .update({ sets_this_week: 0 })
    .eq('user_id', userId)

  if (error) {
    console.error('resetWeeklySets error:', error.message)
  }
}
