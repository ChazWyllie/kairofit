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
    <OnboardingLayout step={16} totalSteps={TOTAL_STEPS} showBack={false}>
      <div className="mt-4 flex flex-col gap-6">
        <div className="text-center">
          <div className="mb-3 text-6xl">{def.emoji}</div>
          <h2 className="mb-2 text-2xl font-semibold text-[#6366F1]">{def.name}</h2>
          <p className="mb-4 text-lg font-medium text-[#F5F5F4]">{def.headline}</p>
          <p className="leading-relaxed text-[#A1A19E]">{def.description}</p>
        </div>

        <div className="rounded-lg border border-[#1A1A1F] bg-[#111113] px-5 py-4">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-[#6B6B68]">
            Your program focus
          </p>
          <p className="text-sm leading-relaxed text-[#F5F5F4]">{def.program_emphasis}</p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-opacity"
        >
          This is me - build my program
        </button>
      </div>
    </OnboardingLayout>
  )
}
