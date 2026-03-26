/**
 * KairoFit Workout Generator
 *
 * Core AI generation with full resilience and Structured Outputs.
 *
 * Degradation chain (see skills/ai-resilience/SKILL.md):
 *   Sonnet + Structured Outputs
 *   -> Redis cache (same goal/level/days combo)
 *   -> Haiku + Structured Outputs (faster, cheaper)
 *   -> Pre-computed Supabase fallback
 *   -> Static placeholder
 *
 * Structured Outputs: guarantees JSON schema shape compliance.
 * IMPORTANT: Does NOT enforce numerical constraints (sets <= 10, reps <= 50).
 * workout-validator.ts is still required after generation.
 */

import Anthropic from '@anthropic-ai/sdk'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { KIRO_BASE_SYSTEM_PROMPT } from './kiro-voice'
import { validateWorkoutProgram } from './workout-validator'
import {
  canRequest,
  recordSuccess,
  recordFailure,
  classifyEquipmentBucket,
  CIRCUITS,
} from './circuit-breaker'
import { recommendSplit } from '@/lib/utils/progressive-overload'
import { getExcludedExercises } from '@/lib/utils/contraindications'
import { createServerClient } from '@/lib/db/supabase'
import type { UserProfile, GeneratedProgram } from '@/types'

const client = new Anthropic()

// ============================================================
// STRUCTURED OUTPUTS SCHEMA
// zodToJsonSchema converts Zod to JSON Schema for the Anthropic tool input_schema.
// Guarantees schema shape. Does NOT enforce numerical ranges.
// ============================================================

const GeneratedExerciseSchema = z.object({
  exercise_name: z.string(),
  sets: z.number().int(),
  reps_min: z.number().int(),
  reps_max: z.number().int(),
  rest_seconds: z.number().int(),
  rpe_target: z.number().int().nullable(),
  rationale: z.string(),
  progression_scheme: z.enum(['linear', 'double_progression', 'rpe_based', 'maintain']),
  modification_note: z.string().nullable(),
})

const GeneratedDaySchema = z.object({
  day_number: z.number().int(),
  name: z.string(),
  focus_muscles: z.array(z.string()),
  session_type: z.enum(['strength', 'hypertrophy', 'volume', 'full_body', 'deload']),
  estimated_duration_minutes: z.number().int(),
  exercises: z.array(GeneratedExerciseSchema),
})

const GeneratedProgramSchema = z.object({
  name: z.string(),
  description: z.string(),
  ai_rationale: z.string(),
  weeks_duration: z.number().int(),
  progression_scheme: z.enum(['linear', 'double_progression', 'rpe_based', 'dup', 'block']),
  projected_weeks_to_goal: z.number().int().nullable(),
  projected_outcome_description: z.string(),
  days: z.array(GeneratedDaySchema),
})

// Build the tool definition for forced-JSON-shape responses.
// output_config does not exist in the Anthropic SDK - the correct pattern is
// tool use with tool_choice: { type: 'tool', name: 'create_workout_program' }.
// This forces the model to call the tool and the response is guaranteed to match
// the schema shape (but NOT numerical bounds - the validator still runs after).
const _rawSchema = zodToJsonSchema(GeneratedProgramSchema, {
  name: 'workout_program',
  $refStrategy: 'none',
}) as Record<string, unknown>
delete _rawSchema['$schema'] // strip $schema - Anthropic may reject it

const PROGRAM_TOOL: Anthropic.Tool = {
  name: 'create_workout_program',
  description: 'Create a structured workout program for the user',
  input_schema: _rawSchema as Anthropic.Tool['input_schema'],
}

// ============================================================
// MAIN GENERATION WITH RESILIENCE
// ============================================================

export type GenerationSource =
  | 'ai_sonnet'
  | 'ai_haiku'
  | 'redis_cache'
  | 'supabase_fallback'
  | 'static_fallback'

export interface GenerationResult {
  program: GeneratedProgram
  source: GenerationSource
}

/**
 * Generate a program with full resilience. Never throws.
 * Always returns something usable from the degradation chain.
 */
export async function generateProgram(profile: UserProfile): Promise<GenerationResult> {
  const supabase = await createServerClient()

  if (!(await canRequest(CIRCUITS.PROGRAM_GENERATION))) {
    console.warn('Circuit open - going straight to fallback')
    return getFallbackProgram(profile, supabase)
  }

  // TODO: Redis cache check here (src/lib/utils/rate-limit.ts Redis instance)

  try {
    const program = await generateWithSonnet(profile)
    await recordSuccess(CIRCUITS.PROGRAM_GENERATION)
    return { program, source: 'ai_sonnet' }
  } catch (err) {
    await recordFailure(CIRCUITS.PROGRAM_GENERATION)
    console.error('Sonnet failed, trying Haiku:', err)
    try {
      const program = await generateWithHaiku(profile)
      return { program, source: 'ai_haiku' }
    } catch (haikuErr) {
      console.error('Haiku also failed, using fallback:', haikuErr)
      return getFallbackProgram(profile, supabase)
    }
  }
}

// ============================================================
// SONNET GENERATION (primary path)
// ============================================================

async function generateWithSonnet(profile: UserProfile): Promise<GeneratedProgram> {
  const split = recommendSplit(profile.days_per_week ?? 3)
  const excluded = getExcludedExercises(profile.injuries ?? [])

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    // System as array to enable cache_control on the stable base prompt
    system: [
      {
        type: 'text',
        text: KIRO_BASE_SYSTEM_PROMPT,
        // cache_control saves ~90% on this ~2000 token stable content
        cache_control: { type: 'ephemeral' },
      } as Anthropic.TextBlockParam & { cache_control: { type: 'ephemeral' } },
      {
        type: 'text',
        text: GENERATION_TASK_INSTRUCTIONS,
      },
    ],
    messages: [{ role: 'user', content: buildPrompt(profile, split, excluded) }],
    // Structured Outputs - schema shape is guaranteed
    tools: [PROGRAM_TOOL],
    tool_choice: { type: 'tool', name: 'create_workout_program' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Sonnet did not call the program tool')
  }

  const program = toolUse.input as GeneratedProgram

  // Validate numerical constraints that Structured Outputs does NOT enforce
  const result = validateWorkoutProgram(
    program,
    profile.experience_level ?? 1,
    profile.injuries ?? [],
    profile.equipment ?? []
  )
  if (!result.valid) {
    throw new Error(`Validation failed: ${result.errors[0]?.message}`)
  }

  return program
}

// ============================================================
// HAIKU FALLBACK
// ============================================================

async function generateWithHaiku(profile: UserProfile): Promise<GeneratedProgram> {
  const split = recommendSplit(profile.days_per_week ?? 3)
  // Compute exclusions same as Sonnet path - injury safety must hold in ALL fallback paths
  const excluded = getExcludedExercises(profile.injuries ?? [])

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `${GENERATION_TASK_INSTRUCTIONS}\n\n${buildPrompt(profile, split, excluded)}`,
      },
    ],
    tools: [PROGRAM_TOOL],
    tool_choice: { type: 'tool', name: 'create_workout_program' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Haiku did not call the program tool')
  }
  return toolUse.input as GeneratedProgram
}

// ============================================================
// SUPABASE FALLBACK
// ============================================================

async function getFallbackProgram(
  profile: UserProfile,
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<GenerationResult> {
  const equipmentType = classifyEquipmentBucket(profile.equipment ?? [])

  const { data } = await supabase
    .from('fallback_programs')
    .select('program_json')
    .eq('goal', profile.goal ?? 'fitness')
    .eq('experience_level', profile.experience_level ?? 2)
    .eq('days_per_week', profile.days_per_week ?? 3)
    .eq('equipment_type', equipmentType)
    .limit(1)
    .single()

  if (data?.program_json) {
    return {
      program: data.program_json as unknown as GeneratedProgram,
      source: 'supabase_fallback',
    }
  }

  return { program: buildStaticFallback(), source: 'static_fallback' }
}

// ============================================================
// DEBRIEF GENERATION (separate function, lower stakes)
// ============================================================

/**
 * Generate Kiro's post-workout debrief.
 * TODO: Implement - see skills/ai-resilience/SKILL.md for the debrief degradation chain.
 */
export async function generateDebrief(
  _sessionId: string,
  _userId: string
): Promise<{ text: string; source: GenerationSource }> {
  // TODO: Implement full streaming debrief using Sonnet
  // Steps: load session data -> build debrief prompt -> stream from Sonnet
  // -> on failure fall back to static template (never throw)
  //
  // Until implemented: return the static fallback so post-workout flow does not crash.
  // The pattern used in generateProgram (return fallback, never throw) applies here too.
  return {
    text: "Your session is logged. Kiro's analysis will be available once this feature ships.",
    source: 'static_fallback',
  }
}

// ============================================================
// HELPERS
// ============================================================

function buildPrompt(
  profile: UserProfile,
  split: ReturnType<typeof recommendSplit>,
  excluded: Set<string>
): string {
  return `
User profile:
- Goal: ${profile.goal}
- Experience level: ${profile.experience_level}/5
- Days per week: ${profile.days_per_week}
- Session duration: ${profile.session_duration_preference}
- Equipment: ${(profile.equipment ?? []).join(', ')}
- Injuries: ${(profile.injuries ?? []).join(', ') || 'none'}
- Training recency: ${profile.training_recency_months != null ? `${profile.training_recency_months} months since last consistent training` : 'unknown'}
- Sleep: ${profile.sleep_hours_range}
- Archetype: ${profile.archetype}

Recommended split: ${split.split_type}
Split rationale: ${split.rationale}

Exercises to EXCLUDE (injury contraindications): ${[...excluded].join(', ') || 'none'}

Generate the complete program JSON.
`.trim()
}

const GENERATION_TASK_INSTRUCTIONS = `
Generate a KairoFit workout program. Output ONLY the JSON object. No text outside the JSON.

Critical constraints:
- Heavy compounds (squat, deadlift, bench, overhead press): minimum 120 seconds rest
- Do NOT pair heavy squat + heavy deadlift on the same day
- Do NOT pair heavy bench + heavy overhead press on the same day
- Every exercise must have a rationale explaining why it is in this session
- Use only equipment the user has listed
- Exclude all injury-contraindicated exercises listed above
`

function buildStaticFallback(): GeneratedProgram {
  return {
    name: 'KairoFit Program',
    description: 'Your program is being finalized.',
    ai_rationale:
      'AI service is temporarily unavailable. Your program will regenerate automatically.',
    weeks_duration: 8,
    progression_scheme: 'double_progression',
    projected_weeks_to_goal: null,
    projected_outcome_description: 'Full analysis available when AI service resumes.',
    days: [],
  }
}

// NOTE: buildCachedSystemMessage was removed.
// It had two bugs: (1) getKiroSystemPrompt concatenates base+task into one string,
// losing the per-block caching benefit; (2) the returned object shape was wrong for
// the Anthropic SDK system parameter.
// Prompt caching is implemented correctly inline in generateWithSonnet() above,
// using system as TextBlockParam[] with cache_control on the stable base block only.
