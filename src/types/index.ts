/**
 * KairoFit TypeScript Types
 *
 * Single source of truth for all types.
 * Import from here, never directly from supabase.generated.ts.
 *
 * No em dashes anywhere in this file.
 */

// ============================================================
// USER AND PROFILE
// ============================================================

export type FitnessGoal = 'muscle' | 'fat_loss' | 'strength' | 'fitness' | 'recomposition'

export type ExperienceLevel = 1 | 2 | 3 | 4 | 5

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  1: 'Just starting out',
  2: 'Getting comfortable',
  3: 'Intermediate',
  4: 'Experienced',
  5: 'Advanced',
}

export const EXPERIENCE_DESCRIPTIONS: Record<ExperienceLevel, string> = {
  1: "I'm new to strength training",
  2: "I've trained on and off, not consistently",
  3: 'I train regularly and know the basics well',
  4: "I've been training consistently for 2+ years",
  5: 'I follow structured programs and track performance closely',
}

export type Gender = 'male' | 'female' | 'nonbinary' | 'prefer_not'
export type AgeRange = '18-23' | '24-29' | '30s' | '40s' | '50+'
export type WorkSchedule = '9-5' | 'shift' | 'flexible' | 'retired'
export type ActivityLevel = 'sedentary' | 'active' | 'mixed' | 'variable'
// Range labels match the database CHECK constraint and onboarding screen options
export type SessionDurationPreference = '15-20' | '20-30' | '30-45' | '45-60' | '60+'
// Range labels stored as strings to preserve "< 5 hrs" vs bare number distinction
export type SleepRange = '<5' | '5-6' | '7-8' | '>8'
export type Units = 'metric' | 'imperial'

export type InjuryZone = 'lower_back' | 'knees' | 'shoulders' | 'wrists' | 'hips' | 'neck' | 'other'

export type Equipment =
  | 'dumbbells'
  | 'kettlebells'
  | 'barbells'
  | 'cables_machines'
  | 'pull_up_bar'
  | 'resistance_bands'
  | 'bench'
  | 'squat_rack'
  | 'bodyweight'

export type WorkoutTimePreference = 'morning' | 'midday' | 'afternoon' | 'evening' | 'no_preference'

export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due' | 'unpaid'

export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  display_name: string | null
  avatar_url: string | null
  preferred_units: Units

  goal: FitnessGoal | null
  experience_level: ExperienceLevel | null
  // Months since last consistent training - distinct from experience level
  // A level-3 user who has not trained in 8 months needs a comeback-kid program
  training_recency_months: number | null
  age_range: AgeRange | null
  gender: Gender | null
  days_per_week: number | null
  session_duration_preference: SessionDurationPreference | null

  work_schedule: WorkSchedule | null
  activity_level: ActivityLevel | null
  obstacles: string[]
  // injuries is encrypted in the DB - application layer handles decryption
  // Do not access injuries_encrypted directly from components
  injuries: InjuryZone[] // decrypted by server-side query functions only
  why_now: string | null

  psych_scores: number[]
  archetype: KairoArchetype | null

  equipment: Equipment[]
  split_preference: string | null
  workout_time_preference: WorkoutTimePreference | null
  other_training: string[]
  sleep_hours_range: SleepRange | null

  // Per-user AI persona toggle - NOT a global env flag
  kiro_persona_enabled: boolean

  stripe_customer_id: string | null
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null

  onboarding_completed_at: string | null
  onboarding_step: number
}

// ============================================================
// ARCHETYPES (8 total - all must be implemented)
// ============================================================

// All 8 archetypes must be in this union type.
// Logic lives in src/lib/onboarding/archetypes.ts (not in kiro-voice.ts).
// FLOW.md defines all 8 with descriptions and program emphasis.
export type KairoArchetype =
  | 'system_builder'
  | 'milestone_chaser'
  | 'explorer'
  | 'pragmatist'
  | 'comeback_kid'
  | 'optimizer'
  | 'challenger'
  | 'understander'

export interface ArchetypeDefinition {
  id: KairoArchetype
  name: string
  emoji: string
  headline: string
  description: string
  program_emphasis: string
  // Advanced users and "understander" type get science notes open by default
  default_science_depth: 'collapsed' | 'expanded'
}

// ============================================================
// EXERCISE LIBRARY
// ============================================================

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'carry'
  | 'core'
  | 'isolation_push'
  | 'isolation_pull'
  | 'cardio'

export type EvidenceQuality = 'high' | 'medium' | 'low'

export interface Exercise {
  id: string
  name: string
  slug: string
  alternative_names: string[]
  primary_muscles: string[]
  secondary_muscles: string[]
  movement_pattern: MovementPattern
  is_compound: boolean
  equipment_required: Equipment[]
  difficulty: 1 | 2 | 3 | 4 | 5
  default_sets_min: number
  default_sets_max: number
  default_reps_min: number
  default_reps_max: number
  default_rest_seconds: number
  description: string | null
  research_rationale: string | null
  form_cues: string[]
  common_mistakes: string[]
  contraindicated_for: InjuryZone[]
  video_url: string | null
  thumbnail_url: string | null
  is_verified: boolean
  evidence_quality: EvidenceQuality
}

// ============================================================
// PROGRAMS
// ============================================================

export type ProgressionScheme = 'linear' | 'double_progression' | 'rpe_based' | 'dup' | 'block'

export type SessionType = 'strength' | 'hypertrophy' | 'volume' | 'full_body' | 'deload'

export interface Program {
  id: string
  user_id: string
  created_at: string
  name: string
  description: string | null
  ai_rationale: string | null
  weeks_duration: number
  days_per_week: number | null
  goal: FitnessGoal | null
  split_type: string | null
  current_week: number
  progression_scheme: ProgressionScheme
  is_active: boolean
  projected_weeks_to_goal: number | null
  projected_outcome_description: string | null
  days: ProgramDay[]
}

export interface ProgramDay {
  id: string
  program_id: string
  day_number: number // 1-6 (not 1-7, max split is 6 days)
  week_number: number
  name: string
  focus_muscles: string[]
  session_type: SessionType | null
  estimated_duration_minutes: number | null
  exercises: ProgramExercise[]
}

export interface ProgramExercise {
  id: string
  program_day_id: string
  exercise_id: string
  user_id: string // denormalized for RLS performance
  exercise: Exercise
  order_index: number
  superset_group: number | null
  sets: number
  reps_min: number
  reps_max: number
  // Heavy compounds: minimum 120s. Isolations: 60-90s. Hard min: 30s.
  rest_seconds: number
  rpe_target: number | null
  rir_target: number | null
  rationale: string | null
  progression_scheme: ProgressionScheme
  modification_note: string | null
  is_flagged_for_injury: boolean
}

// ============================================================
// WORKOUT SESSIONS AND SETS
// ============================================================

export type SessionStatus = 'in_progress' | 'completed' | 'skipped'

export interface WorkoutSession {
  id: string
  user_id: string
  program_day_id: string | null
  program_id: string | null
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  perceived_effort: number | null
  energy_level: number | null
  user_notes: string | null
  ai_debrief: string | null
  next_session_adjustments: NextSessionAdjustments | null
  status: SessionStatus
  sets: WorkoutSet[]
}

export interface WorkoutSet {
  id: string
  session_id: string
  exercise_id: string
  program_exercise_id: string | null
  user_id: string // denormalized for RLS performance
  set_number: number
  reps_completed: number
  weight_kg: number | null
  rpe: number | null
  is_warmup: boolean
  is_dropset: boolean
  logged_at: string
}

// Client-only extension for optimistic UI. Never pass to Supabase insert.
// Use this type in the workout store; use WorkoutSet for all DB operations.
export interface OptimisticWorkoutSet extends WorkoutSet {
  isPending: boolean
}

export interface NextSessionAdjustments {
  adjustments: Array<{
    exercise_id: string
    exercise_name: string
    suggested_weight_kg: number | null
    suggested_reps_min: number
    suggested_reps_max: number
    reason: string
  }>
}

// ============================================================
// MUSCLE RECOVERY
// ============================================================

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'traps'
  | 'lower_back'

export interface MuscleRecovery {
  user_id: string
  muscle_group: MuscleGroup
  last_trained_at: string | null
  estimated_recovery_pct: number // 0-100
  sets_this_week: number
  updated_at: string
}

// ============================================================
// ONBOARDING STATE (Zustand store)
// ============================================================

export interface OnboardingState {
  current_step: number
  // Use number not a literal type - A/B tests may change step count
  total_steps: number

  // Phase 1
  goal: FitnessGoal | null
  experience_level: ExperienceLevel | null
  // Months since last consistent training - distinct from experience level
  // A level-3 user who has not trained in 8 months needs a comeback-kid program
  training_recency_months: number | null
  age_range: AgeRange | null
  gender: Gender | null
  days_per_week: number | null
  session_duration_preference: SessionDurationPreference | null

  // Phase 2
  obstacle: string | null
  work_schedule: WorkSchedule | null
  activity_level: ActivityLevel | null
  injuries: InjuryZone[]
  height_cm: number | null
  weight_kg: number | null
  body_fat_pct: number | null
  why_now: string | null

  // Phase 3 (psychographic)
  // 4 agree/disagree scores
  psych_scores: [number, number, number, number]
  archetype: KairoArchetype | null

  // Email gate (screen 16)
  // Note: clear this from store after auth is established - do not hold PII in memory past auth
  email: string | null
  auth_ready: boolean // true once Supabase session is confirmed after screen 16

  // Phase 5
  equipment: Equipment[]
  split_preference: string | null
  workout_time_preference: WorkoutTimePreference | null
  other_training: string[]
  // Store as range label string, not bare integer
  // Matches SleepRange type and DB CHECK constraint
  sleep_hours_range: SleepRange | null

  units: Units
}

// ============================================================
// ACTIVE WORKOUT STATE (Zustand store)
// ============================================================

export interface ActiveWorkoutState {
  session_id: string | null
  program_day_id: string | null
  is_active: boolean
  started_at: string | null
  current_exercise_index: number
  logged_sets: Record<string, OptimisticWorkoutSet[]>
  rest_timer: {
    is_running: boolean
    seconds_remaining: number
    total_seconds: number
    exercise_name: string | null
  }
}

// ============================================================
// SOCIAL
// ============================================================

export interface WorkoutShareCard {
  session_id: string
  user_name: string
  date: string
  workout_name: string
  total_sets: number
  total_volume_kg: number
  duration_minutes: number
  highlight_exercise: string
  highlight_weight: string
  kiro_quote: string | null
  archetype: KairoArchetype | null
}

// ============================================================
// AI GENERATION TYPES
// ============================================================

export interface GeneratedProgram {
  name: string
  description: string
  ai_rationale: string
  weeks_duration: number
  progression_scheme: ProgressionScheme
  projected_weeks_to_goal: number | null
  projected_outcome_description: string | null
  days: GeneratedDay[]
}

export interface GeneratedDay {
  day_number: number // 1-6 only
  name: string
  focus_muscles: string[]
  session_type: SessionType
  estimated_duration_minutes: number
  exercises: GeneratedExercise[]
}

export interface GeneratedExercise {
  exercise_name: string
  sets: number
  reps_min: number
  reps_max: number
  // Minimum 120s for heavy compounds. Minimum 60s for isolations. Absolute min 30s.
  rest_seconds: number
  rpe_target: number | null
  rationale: string
  progression_scheme: ProgressionScheme
  modification_note: string | null
}

// ============================================================
// VALIDATION
// ============================================================

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  rule: string
  message: string
  value?: unknown
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion: string
}
