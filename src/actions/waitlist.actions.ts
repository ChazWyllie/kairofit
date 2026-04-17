'use server'

import { after } from 'next/server'
import { createSafeActionClient } from 'next-safe-action'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { trackServer } from '@/lib/utils/analytics'
import { EVENTS } from '@/lib/utils/event-names'
import { waitlistJoinSchema, RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

const action = createSafeActionClient({
  handleServerError(error) {
    return error.message || 'Unable to join the waitlist right now.'
  },
})

export const joinWaitlistAction = action
  .schema(waitlistJoinSchema)
  .action(async ({ parsedInput }) => {
    await checkRateLimit(parsedInput.email, RATE_LIMIT_KEYS.WAITLIST)

    const supabase = await createServerClient()
    const { error } = await supabase.from('waitlist').insert({
      email: parsedInput.email.toLowerCase(),
      source: parsedInput.source ?? 'marketing_homepage',
      referrer: parsedInput.referrer ?? null,
      utm_source: parsedInput.utm_source ?? null,
      utm_medium: parsedInput.utm_medium ?? null,
      utm_campaign: parsedInput.utm_campaign ?? null,
    })

    if (error) {
      after(() => {
        void trackServer(parsedInput.email.toLowerCase(), EVENTS.WAITLIST_FAILED, {
          reason: error.message,
        })
      })
      if (error.message.includes('duplicate key value')) {
        throw new Error('This email is already on the waitlist.')
      }

      throw new Error('Unable to join the waitlist right now.')
    }

    after(() => {
      void trackServer(parsedInput.email.toLowerCase(), EVENTS.WAITLIST_SUBMITTED, {
        source: parsedInput.source ?? 'marketing_homepage',
      })
    })

    return { success: true }
  })
