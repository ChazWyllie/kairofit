/**
 * Social Server Actions
 *
 * Mutations for follows, weekly challenges, and workout sharing.
 * All actions here are gated behind NEXT_PUBLIC_SOCIAL_ENABLED=true.
 * Do NOT implement until that flag is flipped. Flipping it before the
 * social tables and UI are fully built causes broken UI.
 *
 * Implemented in Phase 12.
 */

'use server'

import { createSafeActionClient } from 'next-safe-action'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { followUserSchema, unfollowUserSchema, RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

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
// FOLLOW USER
// ============================================================

export const followUserAction = action
  .schema(followUserSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (process.env.NEXT_PUBLIC_SOCIAL_ENABLED !== 'true') {
      throw new Error('Social features are not yet enabled')
    }
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)
    // TODO (Phase 12): Implement follow
    void parsedInput
    throw new Error('Social features not yet implemented')
  })

// ============================================================
// UNFOLLOW USER
// ============================================================

export const unfollowUserAction = action
  .schema(unfollowUserSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (process.env.NEXT_PUBLIC_SOCIAL_ENABLED !== 'true') {
      throw new Error('Social features are not yet enabled')
    }
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)
    // TODO (Phase 12): Implement unfollow
    void parsedInput
    throw new Error('Social features not yet implemented')
  })
