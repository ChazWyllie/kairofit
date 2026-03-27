/**
 * Profile Server Actions
 *
 * Mutations for profile settings, measurements, and account management.
 * Implemented fully in Phase 10.
 */

'use server'

import { createSafeActionClient } from 'next-safe-action'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import {
  updateProfileSchema,
  logMeasurementSchema,
  RATE_LIMIT_KEYS,
} from '@/lib/validation/schemas'

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
// UPDATE PROFILE SETTINGS
// Units toggle, Kiro persona toggle, notification preference.
// ============================================================

export const updateProfileAction = action
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    // Build update object manually to satisfy exactOptionalPropertyTypes.
    // Zod .optional() infers `T | undefined` which conflicts with `T | null`
    // in the profiles table Update type. Only include keys that are present.
    const updates: Record<string, unknown> = {}
    if (parsedInput.display_name !== undefined) updates.display_name = parsedInput.display_name
    if (parsedInput.preferred_units !== undefined)
      updates.preferred_units = parsedInput.preferred_units
    if (parsedInput.kiro_persona_enabled !== undefined)
      updates.kiro_persona_enabled = parsedInput.kiro_persona_enabled

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return { success: true }
  })

// ============================================================
// LOG BODY MEASUREMENT
// Stores weight and optional body composition data.
// Implemented in Phase 10.
// ============================================================

export const logMeasurementAction = action
  .schema(logMeasurementSchema)
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    // TODO (Phase 10): Implement with health data encryption
    // When the encryption utility is built (Phase 14), wrap weight_kg and
    // body_fat_pct in encrypt() before inserting to body_measurements.
    // For now, measurements are deferred until the encryption layer exists.
    void parsedInput
    void supabase
    throw new Error('Measurement logging not yet implemented - pending encryption utility')
  })

// ============================================================
// DELETE ACCOUNT
// Cancels Stripe subscription and cascades deletes all user data.
// Implemented in Phase 10.
// ============================================================

export const deleteAccountAction = action
  .schema(
    // No input needed - the authenticated user deletes their own account
    // Using an empty schema as a placeholder until Phase 10
    (await import('zod')).z.object({})
  )
  .action(async ({ ctx: { user, supabase } }) => {
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    // TODO (Phase 10): Implement full account deletion
    // 1. Cancel Stripe subscription if active
    // 2. Delete from auth.users (cascades to all tables via ON DELETE CASCADE)
    void supabase
    throw new Error('Account deletion not yet implemented')
  })
