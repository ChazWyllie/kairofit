'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { Button } from './Button'
import { captureMarketingEvent } from './MarketingAnalytics'
import { joinWaitlistAction } from '@/actions/waitlist.actions'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const utm = useMemo(
    () => ({
      utm_source: searchParams.get('utm_source') ?? undefined,
      utm_medium: searchParams.get('utm_medium') ?? undefined,
      utm_campaign: searchParams.get('utm_campaign') ?? undefined,
    }),
    [searchParams]
  )

  const { execute, isExecuting, result } = useAction(joinWaitlistAction, {
    onSuccess({ data }) {
      if (!data?.success) return
      captureMarketingEvent('WAITLIST_SUBMITTED')
      router.push('/waitlist/thank-you')
    },
    onError({ error }) {
      captureMarketingEvent('WAITLIST_FAILED', {
        reason: error.serverError ?? 'unknown',
      })
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        captureMarketingEvent('WAITLIST_CTA_CLICKED')
        execute({
          email,
          source: 'marketing_homepage',
          referrer: typeof document === 'undefined' ? undefined : document.referrer || undefined,
          ...utm,
        })
      }}
    >
      <label htmlFor="waitlist-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="waitlist-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="min-h-12 flex-1 rounded-pill border border-marketing-border-strong bg-marketing-bg-elevated px-5 text-base text-marketing-text-primary placeholder:font-mono placeholder:text-mono-label-md placeholder:uppercase placeholder:tracking-[0.16em] placeholder:text-marketing-text-muted focus:border-marketing-accent focus:outline-none focus:ring-2 focus:ring-marketing-accent/40"
          required
        />
        <Button type="submit" className="sm:min-w-[220px]" disabled={isExecuting}>
          {isExecuting ? 'Joining...' : 'Join the waitlist'}
        </Button>
      </div>
      {result.serverError && <p className="text-sm text-marketing-danger">{result.serverError}</p>}
      {result.validationErrors?.email?._errors?.[0] && (
        <p className="text-sm text-marketing-danger">{result.validationErrors.email._errors[0]}</p>
      )}
      <p className="text-sm leading-7 text-marketing-text-muted">
        Closed beta. Free during beta. $9.99/month when we open to the public.
      </p>
    </form>
  )
}
