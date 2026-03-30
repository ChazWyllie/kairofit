/**
 * Onboarding Server Actions
 *
 * Mutations for saving onboarding data and completing the onboarding flow.
 *
 * Flow:
 *   Screen 16 -> createAccountAction sends OTP magic link
 *   Screens 17-22 -> collected in onboarding.store.ts client-side
 *   Screen 23 -> awaits auth_ready, then calls persistOnboardingState + generateProgramAction
 */

'use server'

import { createSafeActionClient } from 'next-safe-action'
import { headers } from 'next/headers'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import {
  onboardingEmailSchema,
  onboardingStateSchema,
  generateProgramSchema,
  RATE_LIMIT_KEYS,
} from '@/lib/validation/schemas'
import { saveOnboardingData, getProfileForGeneration } from '@/lib/db/queries/profiles'
import { saveProgramToDb } from '@/lib/db/queries/programs'
import { generateProgram } from '@/lib/ai/workout-generator'
import type { OnboardingState } from '@/types'

// ============================================================
// UNAUTHENTICATED ACTION CLIENT
// No auth check - used before the user has an account.
// ============================================================

const unauthAction = createSafeActionClient()

// ============================================================
// AUTHENTICATED ACTION CLIENT
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
// CREATE ACCOUNT
// Sends a magic-link OTP to the provided email, creating the
// Supabase auth user if one does not already exist.
// Called from screen 16 (email gate) - user is not yet authenticated.
// ============================================================

export const createAccountAction = unauthAction
  .schema(onboardingEmailSchema)
  .action(async ({ parsedInput: { email } }) => {
    await checkRateLimit(email, RATE_LIMIT_KEYS.AUTH)

    const supabase = await createServerClient()
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? ''
    const proto = headersList.get('x-forwarded-proto') ?? 'https'
    const origin = host
      ? `${proto}://${host}`
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)

    return { success: true }
  })

// ============================================================
// GENERATE PROGRAM
// Reads the user's saved profile, calls the AI generator, and
// persists the result. Called from screen 23 after auth_ready.
// ============================================================

export const generateProgramAction = action
  .schema(generateProgramSchema)
  .action(async ({ ctx: { user } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_GENERATE)

    const profile = await getProfileForGeneration(user.id)
    if (!profile) throw new Error('Profile not found - complete onboarding first')

    const { program: generated, source } = await generateProgram(profile)

    const saved = await saveProgramToDb(user.id, generated, {
      generation_model: source,
      generation_prompt_version: '1.0',
      experience_level_target: profile.experience_level ?? 1,
    })

    return { programId: saved.id }
  })

// ============================================================
// PERSIST ONBOARDING STATE
// Server Action called from program-building/page.tsx after auth is confirmed.
// Resolves the user from the session server-side - no userId arg needed at call site.
// ============================================================

export async function persistOnboardingState(state: unknown): Promise<void> {
  const parsed = onboardingStateSchema.parse(state) as OnboardingState
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Authentication required')
  await saveOnboardingData(user.id, parsed)
}
