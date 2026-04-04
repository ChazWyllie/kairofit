/**
 * Workout Session Database Query Functions
 *
 * Typed Supabase query functions for workout_sessions and workout_sets.
 * Called directly from Server Components, Server Actions, and Route Handlers.
 */

import { createServerClient } from '@/lib/db/supabase'
import type { WorkoutSession, WorkoutSet, ProgramDay } from '@/types'

/**
 * Get a single workout session with all its sets.
 * Returns null if not found or not owned by caller (RLS enforces ownership).
 */
export async function getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
      id, user_id, program_day_id, program_id, started_at, completed_at,
      duration_seconds, perceived_effort, energy_level, user_notes,
      ai_debrief, next_session_adjustments, status,
      workout_sets (
        id, session_id, exercise_id, program_exercise_id, user_id,
        set_number, reps_completed, weight_kg, rpe, is_warmup, is_dropset, logged_at
      )
    `
    )
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
    .select(
      `
      id, session_id, exercise_id, program_exercise_id, user_id,
      set_number, reps_completed, weight_kg, rpe, is_warmup, is_dropset, logged_at
    `
    )
    .eq('session_id', sessionId)
    .order('exercise_id')
    .order('set_number')

  if (error) {
    console.error('getSessionSets error:', error.message)
  }

  return (data ?? []) as unknown as WorkoutSet[]
}

/**
 * Get a completed session with all its sets and exercises, ready for the post-workout UI.
 * Returns null if session not found, not completed, or not owned by caller (RLS enforces).
 *
 * Includes muscle groups trained by inferring from exercises' primary_muscles.
 */
export async function getCompletedSessionSummary(
  sessionId: string
): Promise<{
  id: string
  completed_at: string
  duration_seconds: number | null
  sets: Array<{
    id: string
    exercise_id: string
    exercise_name: string
    set_number: number
    reps_completed: number
    weight_kg: number | null
    is_warmup: boolean
  }>
  muscles_worked: string[]
  total_sets: number
  total_volume_kg: number
} | null> {
  const supabase = await createServerClient()

  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select(
      `
      id, completed_at, duration_seconds, status,
      workout_sets (
        id, exercise_id, set_number, reps_completed, weight_kg, is_warmup,
        exercises (id, name, primary_muscles)
      )
    `
    )
    .eq('id', sessionId)
    .eq('status', 'completed')
    .single()

  if (sessionError || !session) {
    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('getCompletedSessionSummary error:', sessionError.message)
    }
    return null
  }

  // Process the session data
  const sets = (session.workout_sets as unknown as Array<{
    id: string
    exercise_id: string
    set_number: number
    reps_completed: number
    weight_kg: number | null
    is_warmup: boolean
    exercises: { id: string; name: string; primary_muscles: string[] }
  }>)
    .filter((s) => !s.is_warmup)
    .map((s) => ({
      id: s.id,
      exercise_id: s.exercise_id,
      exercise_name: s.exercises.name,
      set_number: s.set_number,
      reps_completed: s.reps_completed,
      weight_kg: s.weight_kg,
      is_warmup: s.is_warmup,
    }))

  // Collect unique muscles trained
  const musclesWorked = new Set<string>()
  for (const workout_set of session.workout_sets as unknown as Array<{
    exercises: { primary_muscles: string[] }
  }>) {
    for (const muscle of workout_set.exercises.primary_muscles) {
      musclesWorked.add(muscle)
    }
  }

  // Calculate total volume
  const totalVolume = sets.reduce((acc, s) => acc + ((s.weight_kg ?? 0) * s.reps_completed), 0)

  return {
    id: session.id,
    completed_at: session.completed_at ?? new Date().toISOString(),
    duration_seconds: session.duration_seconds,
    sets,
    muscles_worked: Array.from(musclesWorked),
    total_sets: sets.length,
    total_volume_kg: totalVolume,
  }
}

/**
 * Get the user's most recent completed sessions.
 * Used by the Kiro debrief for context and by the progress chart.
 */
export async function getSessionHistory(userId: string, limit = 10): Promise<WorkoutSession[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
      id, user_id, program_day_id, program_id, started_at, completed_at,
      duration_seconds, perceived_effort, energy_level, status
    `
    )
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
  const checking = new Date(today)

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

/**
 * Get the next unlogged program day for the current week.
 *
 * Logic:
 * 1. Fetch all program_days for programId where week_number = currentWeek, ordered by day_number
 * 2. Fetch all completed workout_sessions for userId where program_id = programId
 *    and started_at >= start of current ISO week
 * 3. Return the first program_day whose id is NOT in the completed sessions' program_day_id set
 * 4. Return null if all days are logged or no days exist
 */
export async function getNextProgramDay(
  userId: string,
  programId: string,
  currentWeek: number
): Promise<ProgramDay | null> {
  const supabase = await createServerClient()

  // Normalize week 0 to week 1
  const week = currentWeek > 0 ? currentWeek : 1

  // Fetch all program days for this week
  const { data: programDays, error: daysError } = await supabase
    .from('program_days')
    .select(
      `
      id, program_id, day_number, week_number, name, focus_muscles,
      session_type, estimated_duration_minutes,
      program_exercises (
        id, program_day_id, exercise_id, user_id, order_index,
        superset_group, sets, reps_min, reps_max, rest_seconds,
        rpe_target, rir_target, rationale, progression_scheme,
        modification_note, is_flagged_for_injury,
        exercises (
          id, name, slug, primary_muscles, secondary_muscles,
          movement_pattern, is_compound, equipment_required,
          research_rationale, form_cues, contraindicated_for
        )
      )
    `
    )
    .eq('program_id', programId)
    .eq('week_number', week)
    .order('day_number')

  if (daysError) {
    console.error('getNextProgramDay days error:', daysError.message)
    return null
  }

  if (!programDays || programDays.length === 0) {
    return null
  }

  // Start of current ISO week (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // 0=Mon, 6=Sun
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)

  // Fetch completed sessions for this program this week
  const { data: sessions, error: sessionsError } = await supabase
    .from('workout_sessions')
    .select('id, program_day_id')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .eq('status', 'completed')
    .gte('started_at', weekStart.toISOString())

  if (sessionsError) {
    console.error('getNextProgramDay sessions error:', sessionsError.message)
    return null
  }

  // Build a set of logged program_day IDs
  const loggedDayIds = new Set((sessions ?? []).map((s) => s.program_day_id))

  // Return the first unlogged day
  for (const day of programDays) {
    if (!loggedDayIds.has(day.id)) {
      // Map response to ProgramDay type
      const mapped: ProgramDay = {
        id: day.id,
        program_id: day.program_id,
        day_number: day.day_number,
        week_number: day.week_number ?? 1,
        name: day.name,
        focus_muscles: day.focus_muscles ?? [],
        session_type: (day.session_type as ProgramDay['session_type']) ?? null,
        estimated_duration_minutes: day.estimated_duration_minutes,
        exercises: day.program_exercises as unknown as ProgramDay['exercises'],
      }
      return mapped
    }
  }

  // All days are logged
  return null
}

/**
 * Get a specific program day by ID, including its exercises.
 * Used by the workout page Server Component to load the day being logged.
 * Returns null if not found (RLS enforces ownership via program ownership).
 */
export async function getProgramDay(dayId: string): Promise<ProgramDay | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('program_days')
    .select(
      `
      id, program_id, day_number, week_number, name, focus_muscles,
      session_type, estimated_duration_minutes,
      program_exercises (
        id, program_day_id, exercise_id, user_id, order_index,
        superset_group, sets, reps_min, reps_max, rest_seconds,
        rpe_target, rir_target, rationale, progression_scheme,
        modification_note, is_flagged_for_injury,
        exercises (
          id, name, slug, primary_muscles, secondary_muscles,
          movement_pattern, is_compound, equipment_required,
          research_rationale, form_cues, contraindicated_for
        )
      )
    `
    )
    .eq('id', dayId)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getProgramDay error:', error.message)
    }
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    program_id: data.program_id,
    day_number: data.day_number,
    week_number: data.week_number ?? 1,
    name: data.name,
    focus_muscles: data.focus_muscles ?? [],
    session_type: (data.session_type as ProgramDay['session_type']) ?? null,
    estimated_duration_minutes: data.estimated_duration_minutes,
    exercises: data.program_exercises as unknown as ProgramDay['exercises'],
  }
}
