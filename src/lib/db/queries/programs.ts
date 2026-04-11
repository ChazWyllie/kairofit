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
import type { Program, GeneratedProgram } from '@/types'

/**
 * Get the user's currently active program with all days and exercises.
 * Uses the programs.is_active partial unique index for performance.
 */
/**
 * Get the user's active program.
 * When currentWeek is provided, only loads program_days for that week,
 * avoiding a full 32-row join on an 8-week 4-day program.
 */
export async function getActiveProgram(
  userId: string,
  currentWeek?: number
): Promise<Program | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('programs')
    .select(
      `
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
    `
    )
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

/**
 * Deactivate all existing programs for a user and save a newly generated one.
 * Called by generateProgramAction after workout-generator.ts returns a validated program.
 *
 * The one_active_program_per_user partial unique index in the DB enforces
 * that only one program can have is_active=true per user. We deactivate
 * existing programs first to avoid a unique constraint violation on insert.
 */
export async function saveProgramToDb(
  userId: string,
  generated: GeneratedProgram,
  meta: {
    generation_model: string
    generation_prompt_version: string
    experience_level_target: number
  }
): Promise<Program> {
  const supabase = await createServerClient()

  // Step 1: deactivate any existing active program
  const { error: deactivateError } = await supabase
    .from('programs')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (deactivateError) {
    console.error('saveProgramToDb deactivate error:', deactivateError.message)
    throw new Error(`Failed to deactivate old program: ${deactivateError.message}`)
  }

  // Step 2: insert the new program
  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      name: generated.name,
      description: generated.description,
      ai_rationale: generated.ai_rationale,
      weeks_duration: generated.weeks_duration,
      progression_scheme: generated.progression_scheme,
      projected_weeks_to_goal: generated.projected_weeks_to_goal,
      projected_outcome_description: generated.projected_outcome_description,
      is_active: true,
      is_ai_generated: true,
      generation_model: meta.generation_model,
      generation_prompt_version: meta.generation_prompt_version,
      experience_level_target: meta.experience_level_target,
      current_week: 1,
    })
    .select(
      'id, user_id, name, current_week, weeks_duration, days_per_week, goal, split_type, is_active'
    )
    .single()

  if (programError || !program) {
    console.error('saveProgramToDb insert error:', programError?.message)
    throw new Error(`Failed to insert program: ${programError?.message}`)
  }

  // Step 3: insert all program days and exercises
  for (const day of generated.days) {
    const { data: programDay, error: dayError } = await supabase
      .from('program_days')
      .insert({
        program_id: program.id,
        day_number: day.day_number,
        week_number: 1, // Initial week - progressive overload expands this over time
        name: day.name,
        focus_muscles: day.focus_muscles,
        session_type: day.session_type,
        estimated_duration_minutes: day.estimated_duration_minutes,
      })
      .select('id')
      .single()

    if (dayError || !programDay) {
      console.error('saveProgramToDb day insert error:', dayError?.message)
      throw new Error(`Failed to insert program day: ${dayError?.message}`)
    }

    // Batch resolve exercise names to IDs for this day (one query per day, not per exercise)
    if (day.exercises.length > 0) {
      const orFilter = day.exercises.map((ex) => `name.ilike.${ex.exercise_name}`).join(',')
      const { data: exerciseRows } = await supabase
        .from('exercises')
        .select('id, name')
        .or(orFilter)

      // Case-insensitive name -> id map
      const exerciseMap = new Map<string, string>(
        (exerciseRows ?? []).map((row: { id: string; name: string }) => [
          row.name.toLowerCase(),
          row.id,
        ])
      )

      for (const [i, ex] of day.exercises.entries()) {
        const exerciseId = exerciseMap.get(ex.exercise_name.toLowerCase())

        if (!exerciseId) {
          // Skip exercises the AI invented that don't exist in the library
          // workout-validator.ts should have caught this, but be defensive
          console.error(`saveProgramToDb: exercise not found: ${ex.exercise_name}`)
          continue
        }

        const { error: exError } = await supabase.from('program_exercises').insert({
          program_day_id: programDay.id,
          exercise_id: exerciseId,
          user_id: userId,
          order_index: i,
          sets: ex.sets,
          reps_min: ex.reps_min,
          reps_max: ex.reps_max,
          rest_seconds: ex.rest_seconds,
          rpe_target: ex.rpe_target,
          rationale: ex.rationale,
          progression_scheme: ex.progression_scheme,
          modification_note: ex.modification_note,
        })

        if (exError) {
          console.error('saveProgramToDb exercise insert error:', exError.message)
          // Continue on individual exercise failure - partial program is better than none
        }
      }
    }
  }

  // Return the full program with days loaded
  const saved = await getActiveProgram(userId, 1)
  if (!saved) throw new Error('Program saved but could not be retrieved')
  return saved
}

/**
 * Load a specific program by ID, scoped to the user for RLS safety.
 * Returns null when the program does not exist or belongs to another user.
 */
export async function getProgramById(programId: string, userId: string): Promise<Program | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('programs')
    .select(
      `
      id, user_id, created_at, name, description, ai_rationale,
      weeks_duration, days_per_week, goal, split_type, current_week,
      progression_scheme, is_active, projected_weeks_to_goal,
      projected_outcome_description,
      program_days (
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
    `
    )
    .eq('id', programId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getProgramById error:', error.message)
  }

  return data as unknown as Program | null
}
