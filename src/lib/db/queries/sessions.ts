/**
 * Workout Session Database Query Functions
 *
 * Typed Supabase query functions for workout_sessions and workout_sets.
 * Called directly from Server Components, Server Actions, and Route Handlers.
 */

import { createServerClient } from '@/lib/db/supabase'
import type { WorkoutSession, WorkoutSet } from '@/types'

/**
 * Get a single workout session with all its sets.
 * Returns null if not found or not owned by caller (RLS enforces ownership).
 */
export async function getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id, user_id, program_day_id, program_id, started_at, completed_at,
      duration_seconds, perceived_effort, energy_level, user_notes,
      ai_debrief, next_session_adjustments, status,
      workout_sets (
        id, session_id, exercise_id, program_exercise_id, user_id,
        set_number, reps_completed, weight_kg, rpe, is_warmup, is_dropset, logged_at
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getWorkoutSession error:', error.message)
  }

  return data as unknown as WorkoutSession | null
}

/**
 * Get all sets for a session, ordered by exercise then set number.
 * Used by the workout logger to display logged sets per exercise.
 */
export async function getSessionSets(sessionId: string): Promise<WorkoutSet[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workout_sets')
    .select(`
      id, session_id, exercise_id, program_exercise_id, user_id,
      set_number, reps_completed, weight_kg, rpe, is_warmup, is_dropset, logged_at
    `)
    .eq('session_id', sessionId)
    .order('exercise_id')
    .order('set_number')

  if (error) {
    console.error('getSessionSets error:', error.message)
  }

  return (data ?? []) as unknown as WorkoutSet[]
}

/**
 * Get the user's most recent completed sessions.
 * Used by the Kiro debrief for context and by the progress chart.
 */
export async function getSessionHistory(
  userId: string,
  limit = 10
): Promise<WorkoutSession[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id, user_id, program_day_id, program_id, started_at, completed_at,
      duration_seconds, perceived_effort, energy_level, status
    `)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getSessionHistory error:', error.message)
  }

  return (data ?? []) as unknown as WorkoutSession[]
}

/**
 * Calculate the current training streak in consecutive days.
 * A streak counts the number of calendar days running back from today
 * where at least one session was completed.
 *
 * Returns 0 if no sessions exist.
 */
export async function getStreakCount(userId: string): Promise<number> {
  const supabase = await createServerClient()

  // Fetch dates of completed sessions, most recent first
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(90) // 90 days is a reasonable upper bound for streak counting

  if (error) {
    console.error('getStreakCount error:', error.message)
    return 0
  }

  if (!data || data.length === 0) return 0

  // Deduplicate to one training day per calendar date
  const trainingDays = new Set(
    data.map((row) => {
      const date = new Date(row.completed_at!)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    })
  )

  const today = new Date()
  let streak = 0
  let checking = new Date(today)

  while (true) {
    const key = `${checking.getFullYear()}-${checking.getMonth()}-${checking.getDate()}`
    if (trainingDays.has(key)) {
      streak++
      checking.setDate(checking.getDate() - 1)
    } else {
      // Allow one rest day gap at today (e.g. user hasn't trained yet today)
      if (streak === 0) {
        checking.setDate(checking.getDate() - 1)
        const yesterdayKey = `${checking.getFullYear()}-${checking.getMonth()}-${checking.getDate()}`
        if (trainingDays.has(yesterdayKey)) {
          // Start counting from yesterday
          continue
        }
      }
      break
    }
  }

  return streak
}

/**
 * Total training volume (kg lifted) for the current ISO week.
 * Volume = sum of weight_kg * reps_completed across all non-warmup sets.
 *
 * Returns 0 if no sets this week.
 */
export async function getWeeklyVolume(userId: string): Promise<number> {
  const supabase = await createServerClient()

  // Start of current ISO week (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // 0=Mon, 6=Sun
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('workout_sets')
    .select('weight_kg, reps_completed')
    .eq('user_id', userId)
    .eq('is_warmup', false)
    .gte('logged_at', weekStart.toISOString())
    .not('weight_kg', 'is', null)

  if (error) {
    console.error('getWeeklyVolume error:', error.message)
    return 0
  }

  return (data ?? []).reduce((total, set) => {
    return total + (set.weight_kg ?? 0) * set.reps_completed
  }, 0)
}
