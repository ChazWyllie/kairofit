/**
 * Profile Database Query Functions
 *
 * Typed Supabase query functions for the profiles table.
 * Called directly from Server Components, Server Actions, and Route Handlers.
 *
 * Rules:
 * - Always specify columns explicitly (never select('*'))
 * - Always handle the error case
 * - Never put business logic here - this is a data access layer only
 */

import { createServerClient } from '@/lib/db/supabase'
import type { UserProfile } from '@/types'
import type { OnboardingState } from '@/types'

// All profile columns we ever need in the UI or AI layer.
// Stored as a constant so it's easy to audit what we're fetching.
const PROFILE_COLUMNS = `
  id, created_at, updated_at, display_name, avatar_url, preferred_units,
  goal, experience_level, training_recency_months, age_range, gender,
  days_per_week, session_duration_preference, work_schedule, activity_level,
  obstacles, injuries, why_now, psych_scores, archetype,
  equipment, split_preference, workout_time_preference, other_training,
  sleep_hours_range, kiro_persona_enabled, stripe_customer_id,
  subscription_status, trial_ends_at, subscription_period_end,
  onboarding_completed_at, onboarding_step
`

/**
 * Get a user's full profile.
 * Returns null if no profile row exists (should not happen after auth trigger).
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getProfile error:', error.message)
  }

  return data as unknown as UserProfile | null
}

/**
 * Get the minimal profile fields needed to generate a workout program.
 * Used by workout-generator.ts. Excludes subscription and display fields
 * to keep the payload small.
 */
export async function getProfileForGeneration(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id, goal, experience_level, training_recency_months, age_range, gender,
      days_per_week, session_duration_preference, work_schedule, activity_level,
      obstacles, injuries, why_now, psych_scores, archetype,
      equipment, split_preference, workout_time_preference, other_training,
      sleep_hours_range, kiro_persona_enabled, preferred_units
    `
    )
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getProfileForGeneration error:', error.message)
  }

  return data as unknown as UserProfile | null
}

/**
 * Save all onboarding data to the profiles table in one upsert.
 * Called after screen 22 confirms auth is ready and program generation begins.
 *
 * Note: height, weight, body_fat are collected during onboarding but stored
 * in body_measurements (not profiles) to support the measurements log.
 * See Phase 10 for the measurements insert logic.
 */
export async function saveOnboardingData(userId: string, state: OnboardingState): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      goal: state.goal,
      experience_level: state.experience_level,
      training_recency_months: state.training_recency_months,
      age_range: state.age_range,
      gender: state.gender,
      days_per_week: state.days_per_week,
      session_duration_preference: state.session_duration_preference,
      work_schedule: state.work_schedule,
      activity_level: state.activity_level,
      obstacles: state.obstacle ? [state.obstacle] : [],
      injuries: state.injuries,
      why_now: state.why_now,
      psych_scores: state.psych_scores,
      archetype: state.archetype,
      equipment: state.equipment,
      split_preference: state.split_preference,
      workout_time_preference: state.workout_time_preference,
      other_training: state.other_training,
      sleep_hours_range: state.sleep_hours_range,
      preferred_units: state.units,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('saveOnboardingData error:', error.message)
    throw new Error(`Failed to save onboarding data: ${error.message}`)
  }
}

// Explicit type instead of Partial<Pick<UserProfile>> to be compatible with
// exactOptionalPropertyTypes and Zod-inferred schemas (which use `| undefined`).
type ProfileSettingsUpdates = {
  display_name?: string | null
  avatar_url?: string | null
  preferred_units?: 'metric' | 'imperial'
  kiro_persona_enabled?: boolean
  workout_time_preference?: 'morning' | 'midday' | 'afternoon' | 'evening' | 'no_preference' | null
}

/**
 * Update arbitrary profile fields.
 * Used by the profile settings page for unit preference, Kiro persona toggle, etc.
 */
export async function updateProfile(
  userId: string,
  updates: ProfileSettingsUpdates
): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)

  if (error) {
    console.error('updateProfile error:', error.message)
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}
