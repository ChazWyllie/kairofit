/**
 * KairoFit Zod Validation Schemas
 *
 * Single source of truth for all input validation.
 * Every Server Action and API route uses schemas from this file.
 * Never validate inline - always import from here.
 *
 * CLAUDE.md rule: "ALWAYS validate with Zod before touching Supabase or Claude API"
 */

import { z } from 'zod'

// ============================================================
// SHARED PRIMITIVES
// ============================================================

const uuid = z.string().uuid()
const rpe = z.number().int().min(1).max(10)

// ============================================================
// WORKOUT LOGGING
// ============================================================

export const logSetSchema = z.object({
  session_id: uuid,
  exercise_id: uuid,
  program_exercise_id: uuid.optional(),
  set_number: z.number().int().min(1).max(20),
  reps_completed: z.number().int().min(0).max(100),
  weight_kg: z.number().min(0).max(500).optional(),
  rpe: rpe.optional(),
  is_warmup: z.boolean().default(false),
  is_dropset: z.boolean().default(false),
})

export const startSessionSchema = z.object({
  program_day_id: uuid.optional(),
  program_id: uuid.optional(),
})

export const completeSessionSchema = z.object({
  session_id: uuid,
  perceived_effort: rpe.optional(),
  energy_level: z.number().int().min(1).max(5).optional(),
  user_notes: z.string().max(1000).optional(),
})

// ============================================================
// PROGRAM MANAGEMENT
// ============================================================

export const generateProgramSchema = z.object({
  // All required fields validated server-side after reading from profile
  // User cannot directly specify these - they come from onboarding data
  confirm_generation: z.literal(true),
})

export const adjustProgramSchema = z.object({
  program_id: uuid,
  feedback: z.string().min(10).max(2000),
})

export const swapExerciseSchema = z.object({
  program_exercise_id: uuid,
  replacement_exercise_id: uuid,
  reason: z.string().max(500).optional(),
})

// ============================================================
// ONBOARDING
// ============================================================

export const onboardingGoalSchema = z.object({
  goal: z.enum(['muscle', 'fat_loss', 'strength', 'fitness', 'recomposition']),
})

export const onboardingExperienceSchema = z.object({
  experience_level: z.number().int().min(1).max(5),
})

export const onboardingDemographicsSchema = z.object({
  age_range: z.enum(['18-23', '24-29', '30s', '40s', '50+']),
  gender: z.enum(['male', 'female', 'nonbinary', 'prefer_not']),
})

export const onboardingScheduleSchema = z.object({
  days_per_week: z.number().int().min(2).max(6),
  session_duration_preference: z.enum(['15-20', '20-30', '30-45', '45-60', '60+']),
})

export const onboardingInjuriesSchema = z.object({
  injuries: z.array(
    z.enum(['lower_back', 'knees', 'shoulders', 'wrists', 'hips', 'neck', 'other'])
  ),
})

export const onboardingBodyCompositionSchema = z.object({
  // Height is required. Weight is required. Body fat is optional.
  height_cm: z.number().min(100).max(250),
  weight_kg: z.number().min(30).max(300),
  body_fat_pct: z.number().min(5).max(60).optional(),
})

export const onboardingLifestyleSchema = z.object({
  work_schedule: z.enum(['9-5', 'shift', 'flexible', 'retired']),
  activity_level: z.enum(['sedentary', 'active', 'mixed']),
  obstacle: z.string().max(100),
})

export const onboardingWhyNowSchema = z.object({
  why_now: z.string().max(200),
})

export const onboardingPsychSchema = z.object({
  // 4 Likert scores, each 1-5
  psych_scores: z.tuple([
    z.number().int().min(1).max(5),
    z.number().int().min(1).max(5),
    z.number().int().min(1).max(5),
    z.number().int().min(1).max(5),
  ]),
})

export const onboardingEmailSchema = z.object({
  email: z.string().email(),
})

export const onboardingEquipmentSchema = z.object({
  equipment: z
    .array(
      z.enum([
        'dumbbells',
        'kettlebells',
        'barbells',
        'cables_machines',
        'pull_up_bar',
        'resistance_bands',
        'bench',
        'squat_rack',
        'bodyweight',
      ])
    )
    .min(1, 'Select at least one equipment option'),
})

export const onboardingTrainingSetupSchema = z.object({
  split_preference: z.string().max(50),
  workout_time_preference: z.enum(['morning', 'midday', 'afternoon', 'evening', 'no_preference']),
  other_training: z.array(z.string()),
  sleep_hours_range: z.enum(['<5', '5-6', '7-8', '>8']),
})

// Composite schema covering all OnboardingState fields written by saveOnboardingData.
// Used by persistOnboardingState to validate the full client state before any DB write.
// Must be declared after all per-screen schemas it references.
export const onboardingStateSchema = z.object({
  goal: onboardingGoalSchema.shape.goal.optional(),
  experience_level: onboardingExperienceSchema.shape.experience_level.optional(),
  training_recency_months: z.number().int().min(0).max(600).nullable().optional(),
  age_range: onboardingDemographicsSchema.shape.age_range.optional(),
  gender: onboardingDemographicsSchema.shape.gender.optional(),
  days_per_week: onboardingScheduleSchema.shape.days_per_week.optional(),
  session_duration_preference: onboardingScheduleSchema.shape.session_duration_preference.optional(),
  work_schedule: onboardingLifestyleSchema.shape.work_schedule.optional(),
  activity_level: onboardingLifestyleSchema.shape.activity_level.optional(),
  obstacle: onboardingLifestyleSchema.shape.obstacle.optional(),
  injuries: onboardingInjuriesSchema.shape.injuries.optional(),
  height_cm: onboardingBodyCompositionSchema.shape.height_cm.optional(),
  weight_kg: onboardingBodyCompositionSchema.shape.weight_kg.optional(),
  body_fat_pct: onboardingBodyCompositionSchema.shape.body_fat_pct.optional(),
  why_now: onboardingWhyNowSchema.shape.why_now.optional(),
  psych_scores: onboardingPsychSchema.shape.psych_scores.optional(),
  archetype: z
    .enum([
      'system_builder',
      'milestone_chaser',
      'explorer',
      'pragmatist',
      'comeback_kid',
      'optimizer',
      'challenger',
      'understander',
    ])
    .optional(),
  equipment: onboardingEquipmentSchema.shape.equipment.optional(),
  split_preference: onboardingTrainingSetupSchema.shape.split_preference.optional(),
  workout_time_preference: onboardingTrainingSetupSchema.shape.workout_time_preference.optional(),
  other_training: onboardingTrainingSetupSchema.shape.other_training.optional(),
  sleep_hours_range: onboardingTrainingSetupSchema.shape.sleep_hours_range.optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  email: z.string().email().optional(),
  auth_ready: z.boolean().optional(),
  current_step: z.number().int().min(1).optional(),
  archetype_scores: z.record(z.number()).optional(),
})

// ============================================================
// PROFILE UPDATES
// ============================================================

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  preferred_units: z.enum(['metric', 'imperial']).optional(),
  kiro_persona_enabled: z.boolean().optional(),
})

// ============================================================
// BODY MEASUREMENTS
// ============================================================

export const logMeasurementSchema = z.object({
  weight_kg: z.number().min(20).max(400).optional(),
  body_fat_pct: z.number().min(3).max(70).optional(),
  chest_cm: z.number().min(50).max(200).optional(),
  waist_cm: z.number().min(40).max(200).optional(),
  hips_cm: z.number().min(50).max(200).optional(),
  notes: z.string().max(500).optional(),
})

// ============================================================
// SOCIAL
// ============================================================

export const followUserSchema = z.object({
  target_user_id: uuid,
})

export const unfollowUserSchema = z.object({
  target_user_id: uuid,
})

// ============================================================
// RATE LIMIT KEYS
// ============================================================

export const RATE_LIMIT_KEYS = {
  AI_GENERATE: 'ai:generate',
  AI_DEBRIEF: 'ai:debrief',
  AI_ADJUST: 'ai:adjust',
  AI_INTAKE: 'ai:intake',
  AUTH: 'auth',
  GENERAL: 'general',
} as const
