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
import { generateProgram } from '@/lib/ai/workout-generator'
import { saveProgramToDb } from '@/lib/db/queries/programs'
import { getProfileForGeneration } from '@/lib/db/queries/profiles'

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
      console.error(`generateProgramAction: using fallback source=${result.source} for user=${user.id}`)
    }

    const program = await saveProgramToDb(user.id, result.program, {
      generation_model: 'claude-sonnet-4-6',
      generation_prompt_version: 'v1',
      experience_level_target: profile.experience_level ?? 1,
    })

    // After response is sent: analytics and onboarding step update
    after(async () => {
      const supabase = await createServerClient()
      await supabase
        .from('profiles')
        .update({ onboarding_step: 22 })
        .eq('id', user.id)
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
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_GENERATE)
    // TODO (Phase 9): Implement program adjustment via Claude
    // 1. Load current program from DB
    // 2. Pass to adjustProgram() in workout-generator.ts
    // 3. Validate and save updated program
    void parsedInput
    void user
    throw new Error('Program adjustment not yet implemented')
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
