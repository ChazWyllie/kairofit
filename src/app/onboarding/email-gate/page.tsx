'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import { ARCHETYPES } from '@/lib/onboarding/archetypes'

export default function EmailGatePage() {
  const { archetype, setEmail, setAuthReady, nextStep } = useOnboardingStore()
  const router = useRouter()

  const [localEmail, setLocalEmail] = useState('')

  const archetypeName = archetype ? ARCHETYPES[archetype].name : 'Your'
  // Basic email format check
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)

  function handleSubmit() {
    setEmail(localEmail)
    setAuthReady(false)
    // TODO: call createAccountAction(localEmail) when auth actions are wired up
    nextStep()
    router.push('/onboarding/equipment')
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
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg border border-[#1A1A1F] bg-[#111113] px-4 py-3 text-[#F5F5F4] placeholder-[#6B6B68] transition-colors focus:border-[#6366F1] focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValidEmail) handleSubmit()
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!isValidEmail}
          className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Unlock my program
        </button>

        <p className="text-center text-xs text-[#6B6B68]">No spam. Unsubscribe anytime.</p>
      </div>
    </OnboardingLayout>
  )
}
