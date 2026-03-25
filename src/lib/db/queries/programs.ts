/**
 * Program Database Query Functions
 *
 * Typed Supabase query functions for programs.
 * Called directly from Server Components and Server Actions.
 * Client Components will use TanStack Query hooks when needed - add them to src/lib/db/queries/ with a separate hook file alongside the query function.
 *
 * Rules:
 * - Always specify columns explicitly (never select('*'))
 * - Always handle the error case
 * - Never put business logic here - this is a data access layer only
 *
 * TODO: Implement these functions as features are built.
 */

import { createServerClient } from '@/lib/db/supabase'
import type { Program } from '@/types'

/**
 * Get the user's currently active program with all days and exercises.
 * Uses the programs.is_active partial unique index for performance.
 */
/**
 * Get the user's active program.
 * When currentWeek is provided, only loads program_days for that week,
 * avoiding a full 32-row join on an 8-week 4-day program.
 */
export async function getActiveProgram(userId: string, currentWeek?: number): Promise<Program | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('programs')
    .select(`
      id, user_id, created_at, name, description, ai_rationale,
      weeks_duration, days_per_week, goal, split_type, current_week,
      progression_scheme, is_active, projected_weeks_to_goal,
      projected_outcome_description,
      program_days!inner (
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
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    // Filter program_days to current week only when specified.
    // For an 8-week 4-day program this avoids loading 32 rows (all weeks)
    // when only 4 rows (current week's days) are needed for the dashboard.
    .eq('program_days.week_number', currentWeek ?? 1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "no rows returned" - not an error
    console.error('getActiveProgram error:', error.message)
  }

  return data as unknown as Program | null
}
