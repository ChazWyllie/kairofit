/**
 * Onboarding Server Actions
 *
 * Mutations for saving onboarding data and completing the onboarding flow.
 * The critical action here is saveOnboardingAndGenerateProgram, which is called
 * from screen 22 after auth_ready is confirmed.
 *
 * Flow:
 *   Screen 16 -> creates Supabase auth user (background)
 *   Screens 17-21 -> collected in onboarding.store.ts client-side
 *   Screen 22 -> awaits auth_ready, then calls saveOnboardingAndGenerateProgram
 */

'use server'

import { createSafeActionClient } from 'next-safe-action'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { onboardingEmailSchema, RATE_LIMIT_KEYS } from '@/lib/validation/schemas'
import { saveOnboardingData } from '@/lib/db/queries/profiles'
import type { OnboardingState } from '@/types'

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
// SAVE ONBOARDING DATA
// Persists all collected onboarding state to the profiles table.
// Called once from screen 22 after auth is confirmed.
// ============================================================

export const saveOnboardingDataAction = action
  .schema(onboardingEmailSchema) // validates email was collected at screen 16
  .action(async ({ ctx: { user } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    // The actual onboarding state is passed from the component via a separate mechanism.
    // This action stub will be fully implemented in Phase 3.
    // TODO (Phase 3): Accept full OnboardingState and call saveOnboardingData(user.id, state)
    return { success: true, userId: user.id }
  })

// ============================================================
// SAVE FULL ONBOARDING STATE
// Direct function (not a safe action) called internally by generateProgramAction.
// Not exposed as a safe action because it requires the full OnboardingState object
// which is not easily Zod-validated at the boundary.
// ============================================================

export async function persistOnboardingState(
  userId: string,
  state: OnboardingState
): Promise<void> {
  await saveOnboardingData(userId, state)
}
