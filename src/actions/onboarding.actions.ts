/**
 * Onboarding Server Actions
 *
 * Mutations for saving onboarding data and completing the onboarding flow.
 *
 * Flow:
 *   Screen 16 -> createAccountAction sends OTP (unauthenticated)
 *   Screens 17-21 -> collected in onboarding.store.ts client-side
 *   Screen 22 -> awaits auth_ready, then calls generateProgramAction
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
// PUBLIC ACTION CLIENT (no auth middleware - user has no session yet)
// ============================================================

const publicAction = createSafeActionClient()

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
// Sends a magic link OTP to the provided email. Called from screen 16
// before the user has a session, so this uses the public action client.
// ============================================================

export const createAccountAction = publicAction
  .schema(onboardingEmailSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createServerClient()
    // Use env var only - never the request Origin header, which is attacker-controlled
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? ''

    // Rate limit by IP first to prevent email flooding, then by email for per-address limits
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'
    await checkRateLimit(ip, RATE_LIMIT_KEYS.AUTH)
    await checkRateLimit(parsedInput.email, RATE_LIMIT_KEYS.AUTH)

    const { error } = await supabase.auth.signInWithOtp({
      email: parsedInput.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('OTP send error:', error.message)
      throw new Error('Failed to send verification email')
    }

    return { success: true }
  })

// ============================================================
// GENERATE PROGRAM
// Authenticated. Fetches the user's profile, calls the AI generator,
// persists the result, and returns the new programId.
// Called from screen 22 after auth_ready is confirmed.
// ============================================================

export const generateProgramAction = action
  .schema(generateProgramSchema)
  .action(async ({ ctx: { user } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_GENERATE)

    const profile = await getProfileForGeneration(user.id)
    if (!profile) throw new Error('Profile not found')

    const { program, source } = await generateProgram(profile)

    const saved = await saveProgramToDb(user.id, program, {
      generation_model: source,
      generation_prompt_version: '1.0',
      experience_level_target: profile.experience_level ?? 1,
    })

    return { programId: saved.id }
  })

// ============================================================
// SAVE FULL ONBOARDING STATE
// Direct function called internally before generateProgramAction.
// Not a safe action - accepts the full OnboardingState object.
// userId is derived from the authenticated server-side session,
// never trusted from the client, to prevent IDOR writes.
// All fields validated with Zod before touching Supabase.
// ============================================================

export async function persistOnboardingState(state: OnboardingState): Promise<void> {
  const parsed = onboardingStateSchema.safeParse(state)
  if (!parsed.success) {
    throw new Error(`Invalid onboarding state: ${parsed.error.message}`)
  }

  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Authentication required')
  await saveOnboardingData(user.id, state)
}
