/**
 * Exercise Library Database Query Functions
 *
 * Typed Supabase query functions for the exercises table.
 * Called directly from Server Components and Server Actions.
 */

import { createServerClient } from '@/lib/db/supabase'
import type { Exercise } from '@/types'

// Columns needed for exercise cards in the workout logger and exercise library
const EXERCISE_COLUMNS = `
  id, name, slug, alternative_names, primary_muscles, secondary_muscles,
  movement_pattern, is_compound, equipment_required, difficulty,
  default_sets_min, default_sets_max, default_reps_min, default_reps_max,
  default_rest_seconds, description, research_rationale, form_cues,
  common_mistakes, contraindicated_for, video_url, thumbnail_url,
  is_verified, evidence_quality
`

export interface ExerciseFilters {
  muscle_group?: string
  equipment?: string
  movement_pattern?: string
  search?: string
  limit?: number
  offset?: number
}

/**
 * Get a single exercise by its UUID.
 * Used by the workout generator when resolving exercise names to IDs.
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_COLUMNS)
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getExerciseById error:', error.message)
  }

  return data as unknown as Exercise | null
}

/**
 * Get a single exercise by its URL slug.
 * Used by the exercise detail page (/exercises/[slug]).
 */
export async function getExerciseBySlug(slug: string): Promise<Exercise | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_COLUMNS)
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getExerciseBySlug error:', error.message)
  }

  return data as unknown as Exercise | null
}

/**
 * Search and filter exercises for the exercise library page.
 * All filters are optional - with no filters, returns the first `limit` exercises.
 */
export async function searchExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
  const supabase = await createServerClient()
  const { muscle_group, equipment, movement_pattern, search, limit = 50, offset = 0 } = filters

  let query = supabase
    .from('exercises')
    .select(EXERCISE_COLUMNS)
    .order('name')
    .range(offset, offset + limit - 1)

  if (muscle_group) {
    // primary_muscles is a text array - use the contains operator
    query = query.contains('primary_muscles', [muscle_group])
  }

  if (equipment) {
    query = query.contains('equipment_required', [equipment])
  }

  if (movement_pattern) {
    query = query.eq('movement_pattern', movement_pattern)
  }

  if (search) {
    // Full-text search on name and description
    // The fts index in 001_initial_schema.sql covers these columns
    query = query.textSearch('name', search, { type: 'websearch' })
  }

  const { data, error } = await query

  if (error) {
    console.error('searchExercises error:', error.message)
  }

  return (data ?? []) as unknown as Exercise[]
}

/**
 * Get substitutes for an exercise, ordered by priority.
 * Used by the workout logger "swap exercise" flow.
 */
export async function getExerciseSubstitutes(exerciseId: string): Promise<Exercise[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('exercise_substitutes')
    .select(
      `
      priority,
      substitute:substitute_id (
        ${EXERCISE_COLUMNS}
      )
    `
    )
    .eq('exercise_id', exerciseId)
    .order('priority')
    .limit(5)

  if (error) {
    console.error('getExerciseSubstitutes error:', error.message)
  }

  // The join returns { priority, substitute: Exercise } - extract the exercise
  return (data ?? []).map((row) => row.substitute).filter(Boolean) as unknown as Exercise[]
}
