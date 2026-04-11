/**
 * Program Server Actions
 *
 * Mutations for program generation, adjustment, and exercise swaps.
 * generateProgramAction is the centrepiece of the app - it is called from
 * screen 22 after auth_ready and onboarding data have both been confirmed.
 *
 * AI safety layer: all Claude calls go through safety-filter.ts first.
 * Rate limiting: AI endpoints use RATE_LIMIT_KEYS.AI_GENERATE (stricter limit).
 */

'use server'

import { createSafeActionClient } from 'next-safe-action'
import { after } from 'next/server'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import {
  generateProgramSchema,
  adjustProgramSchema,
  swapExerciseSchema,
  RATE_LIMIT_KEYS,
} from '@/lib/validation/schemas'
import { generateProgram, adjustProgram } from '@/lib/ai/workout-generator'
import { canRequest, recordSuccess, recordFailure, CIRCUITS } from '@/lib/ai/circuit-breaker'
import { checkInputSafety } from '@/lib/ai/safety-filter'
import { saveProgramToDb, getProgramById } from '@/lib/db/queries/programs'
import { getProfileForGeneration } from '@/lib/db/queries/profiles'
import { EVENTS } from '@/lib/utils/event-names'
import { trackServer } from '@/lib/utils/analytics'

// ============================================================
// AUTHENTICATED ACTION CLIENT WITH AI MIDDLEWARE
// ============================================================

const action = createSafeActionClient().use(async ({ next }) => {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Authentication required')
  return next({ ctx: { user, supabase } })
})

// ============================================================
// GENERATE PROGRAM
// The main AI call. Called from screen 22 (/onboarding/building).
//
// Steps:
//   1. Save onboarding data to profiles table (first time, data lives in store)
//   2. Rate limit check (strict AI limit)
//   3. Load profile from DB (now persisted)
//   4. Call generateProgram() from workout-generator.ts
//   5. Validate and save to programs table
//   6. Return program ID for redirect to /dashboard
// ============================================================

export const generateProgramAction = action
  .schema(generateProgramSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_GENERATE)

    // Profile must already be persisted before this action is called.
    // The client calls saveOnboardingDataAction first (Phase 3 implementation),
    // then confirms generation here. If the profile is incomplete, generation
    // will fail with a descriptive error from workout-generator.ts.
    void parsedInput

    const profile = await getProfileForGeneration(user.id)
    if (!profile) throw new Error('Profile not found - ensure onboarding data was saved first')

    const result = await generateProgram(profile)

    // generateProgram never throws - it returns a source field indicating degradation level.
    // Log the source for observability but proceed regardless.
    if (result.source !== 'ai_sonnet') {
      console.error(
        `generateProgramAction: using fallback source=${result.source} for user=${user.id}`
      )
    }

    const program = await saveProgramToDb(user.id, result.program, {
      generation_model: result.source,
      generation_prompt_version: 'v1',
      experience_level_target: profile.experience_level ?? 1,
    })

    // After response is sent: analytics and onboarding step update
    after(async () => {
      const supabase = await createServerClient()
      await supabase.from('profiles').update({ onboarding_step: 22 }).eq('id', user.id)
    })

    return { programId: program.id }
  })

// ============================================================
// ADJUST PROGRAM
// Free-text program adjustment. Called from the program page.
// Fully implemented in Phase 9.
// ============================================================

export const adjustProgramAction = action
  .schema(adjustProgramSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // 1. Rate limit - use the adjustment-specific key (5 req / 5 min)
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_ADJUST)

    // 2. Safety filter - feedback goes to Claude, must pass first
    const safety = await checkInputSafety(parsedInput.feedback)
    if (!safety.safe) {
      throw new Error('I can only help with fitness and training questions.')
    }

    // 3. Circuit breaker - skip Claude when the adjustment circuit is open
    if (!(await canRequest(CIRCUITS.ADJUSTMENT))) {
      throw new Error('Program adjustment is temporarily unavailable. Please try again shortly.')
    }

    // 4. Load the program the user wants adjusted
    const program = await getProgramById(parsedInput.program_id, user.id)
    if (!program) throw new Error('Program not found')

    // 5. Call Claude (Sonnet -> Haiku inside adjustProgram)
    let result: Awaited<ReturnType<typeof adjustProgram>>
    try {
      result = await adjustProgram(program, parsedInput.feedback)
      await recordSuccess(CIRCUITS.ADJUSTMENT)
    } catch (err) {
      await recordFailure(CIRCUITS.ADJUSTMENT)
      console.error('adjustProgramAction: AI adjustment failed:', err)
      throw new Error('Program adjustment failed. Please try again.')
    }

    // 6. Version-copy strategy: deactivate old program, save adjusted as new active version.
    // Completed sessions retain their program snapshot via FK - no history is lost.
    const updatedProgram = await saveProgramToDb(user.id, result.program, {
      generation_model: result.source,
      generation_prompt_version: 'v1',
      experience_level_target: program.current_week ?? 1,
    })

    // 7. Fire analytics after response is sent (non-blocking)
    after(async () => {
      void trackServer(user.id, EVENTS.PROGRAM_ADJUSTED, {
        program_id: updatedProgram.id,
        source: result.source,
        feedback_length: parsedInput.feedback.length,
      })
    })

    return { updatedProgram }
  })

// ============================================================
// SWAP EXERCISE
// Swap an exercise in the active program. Called from workout logger.
// Fully implemented in Phase 7.
// ============================================================

export const swapExerciseAction = action
  .schema(swapExerciseSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)
    // TODO (Phase 7): Implement exercise swap
    // 1. Validate substitute is safe given user's injuries
    // 2. Update program_exercises row
    void parsedInput
    void user
    throw new Error('Exercise swap not yet implemented')
  })
