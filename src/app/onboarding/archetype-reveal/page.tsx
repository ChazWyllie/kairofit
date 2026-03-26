'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import { assignArchetype, ARCHETYPES } from '@/lib/onboarding/archetypes'

export default function ArchetypeRevealPage() {
  const { psych_scores, archetype, setArchetype, nextStep } = useOnboardingStore()
  const router = useRouter()

  useEffect(() => {
    if (!archetype) {
      setArchetype(assignArchetype(psych_scores))
    }
  }, [archetype, psych_scores, setArchetype])

  const computed = archetype ?? assignArchetype(psych_scores)
  const def = ARCHETYPES[computed]

  function handleContinue() {
    nextStep()
    router.push('/onboarding/email-gate')
  }

  return (
    <OnboardingLayout
      step={16}
      totalSteps={TOTAL_STEPS}
      showBack={false}
    >
      <div className="flex flex-col gap-6 mt-4">
        <div className="text-center">
          <div className="text-6xl mb-3">{def.emoji}</div>
          <h2 className="text-2xl font-semibold text-[#6366F1] mb-2">{def.name}</h2>
          <p className="text-lg text-[#F5F5F4] font-medium mb-4">{def.headline}</p>
          <p className="text-[#A1A19E] leading-relaxed">{def.description}</p>
        </div>

        <div className="rounded-lg bg-[#111113] border border-[#1A1A1F] px-5 py-4">
          <p className="text-sm text-[#6B6B68] font-medium uppercase tracking-wide mb-2">
            Your program focus
          </p>
          <p className="text-[#F5F5F4] text-sm leading-relaxed">{def.program_emphasis}</p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg bg-[#6366F1] text-white font-medium transition-opacity"
        >
          This is me - build my program
        </button>
      </div>
    </OnboardingLayout>
  )
}
