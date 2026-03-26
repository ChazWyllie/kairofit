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
      <div className="flex flex-col gap-4 mt-4">
        <input
          type="email"
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full px-4 py-3 rounded-lg bg-[#111113] border border-[#1A1A1F] text-[#F5F5F4] placeholder-[#6B6B68] focus:border-[#6366F1] focus:outline-none transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValidEmail) handleSubmit()
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!isValidEmail}
          className="w-full py-3 rounded-lg bg-[#6366F1] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Unlock my program
        </button>

        <p className="text-xs text-center text-[#6B6B68]">No spam. Unsubscribe anytime.</p>
      </div>
    </OnboardingLayout>
  )
}
