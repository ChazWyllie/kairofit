'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import { ARCHETYPES } from '@/lib/onboarding/archetypes'
import { createAccountAction } from '@/actions/onboarding.actions'
import { EVENTS } from '@/lib/utils/event-names'

export default function EmailGatePage() {
  const posthog = usePostHog()
  const { archetype, setEmail, setAuthReady, nextStep } = useOnboardingStore()
  const router = useRouter()

  const [localEmail, setLocalEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const archetypeName = archetype ? ARCHETYPES[archetype].name : 'Your'
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)

  useEffect(() => {
    posthog?.capture(EVENTS.EMAIL_GATE_REACHED, { archetype })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await createAccountAction({ email: localEmail })

      if (result?.serverError) {
        setError('Something went wrong. Please try again.')
        return
      }

      if (result?.validationErrors) {
        setError('Please enter a valid email address.')
        return
      }

      posthog?.capture(EVENTS.EMAIL_GATE_SUBMITTED, { archetype })

      setEmail(localEmail)
      setAuthReady(false)
      nextStep()
      router.push('/onboarding/equipment')
    })
  }

  return (
    <OnboardingLayout
      step={17}
      totalSteps={TOTAL_STEPS}
      question={`${archetypeName} plan is ready.`}
      context="Enter your email to unlock your personalized program."
      onBack={() => router.push('/onboarding/archetype-reveal')}
    >
      <div className="mt-4 flex flex-col gap-4">
        <input
          type="email"
          data-testid="email-gate-input"
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg border border-[#1A1A1F] bg-[#111113] px-4 py-3 text-[#F5F5F4] placeholder-[#6B6B68] transition-colors focus:border-[#6366F1] focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValidEmail && !isPending) handleSubmit()
          }}
        />

        {error && (
          <p data-testid="email-gate-error" className="text-sm text-[#EF4444]">
            {error}
          </p>
        )}

        <button
          data-testid="email-gate-submit"
          onClick={handleSubmit}
          disabled={!isValidEmail || isPending}
          className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Sending...' : 'Unlock my program'}
        </button>

        <p className="text-center text-xs text-[#6B6B68]">No spam. Unsubscribe anytime.</p>
      </div>
    </OnboardingLayout>
  )
}
