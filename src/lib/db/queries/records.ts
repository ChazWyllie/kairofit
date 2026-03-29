/**
 * Personal Records Database Query Functions
 *
 * Typed Supabase query functions for the personal_records table.
 *
 * Schema note: personal_records deliberately has NO unique constraint on
 * (user_id, exercise_id, record_type). Each PR is preserved as a history row.
 * To get the CURRENT record, always query ORDER BY achieved_at DESC LIMIT 1.
 * See 001_initial_schema.sql for the rationale.
 */

import { createServerClient } from '@/lib/db/supabase'

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_id: string
  set_id: string | null
  record_type: '1rm_estimated' | '3rm' | '5rm' | 'max_reps' | 'max_volume'
  value: number
  achieved_at: string
}

/**
 * Get the most recent personal record for a specific exercise and record type.
 * Returns null if no record exists yet.
 *
 * Used by logSetAction to check whether a newly logged set is a PR.
 */
export async function getCurrentPersonalRecord(
  userId: string,
  exerciseId: string,
  recordType: PersonalRecord['record_type']
): Promise<PersonalRecord | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('personal_records')
    .select('id, user_id, exercise_id, set_id, record_type, value, achieved_at')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('record_type', recordType)
    .order('achieved_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getCurrentPersonalRecord error:', error.message)
  }

  return data as PersonalRecord | null
}

/**
 * Get all personal records for a user, optionally filtered by exercise.
 * Returns the most recent record per (exercise, record_type) pair.
 *
 * Note: Because there is no unique constraint, this fetches all rows and
 * the caller deduplicates. For the PRs page this is fine (bounded by exercise count).
 * If this becomes a performance issue, add a DB view that pre-deduplicates.
 */
export async function getPersonalRecords(
  userId: string,
  exerciseId?: string
): Promise<PersonalRecord[]> {
  const supabase = await createServerClient()

  let query = supabase
    .from('personal_records')
    .select('id, user_id, exercise_id, set_id, record_type, value, achieved_at')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })

  if (exerciseId) {
    query = query.eq('exercise_id', exerciseId)
  }

  const { data, error } = await query

  if (error) {
    console.error('getPersonalRecords error:', error.message)
  }

  return (data ?? []) as PersonalRecord[]
}

/**
 * Insert a new personal record row.
 * Always inserts - never upserts. See schema note above.
 *
 * Called by logSetAction when a new best is detected.
 */
export async function insertPersonalRecord(
  record: Omit<PersonalRecord, 'id'>
): Promise<PersonalRecord> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('personal_records')
    .insert(record)
    .select('id, user_id, exercise_id, set_id, record_type, value, achieved_at')
    .single()

  if (error || !data) {
    console.error('insertPersonalRecord error:', error?.message)
    throw new Error(`Failed to insert personal record: ${error?.message}`)
  }

  return data as PersonalRecord
}
