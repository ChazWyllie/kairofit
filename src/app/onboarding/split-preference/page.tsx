'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

const OPTIONS = [
  { value: 'ppl', label: 'Push / Pull / Legs' },
  { value: 'upper_lower', label: 'Upper / Lower' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'not_sure', label: "Not sure - let KairoFit decide" },
]

export default function SplitPreferencePage() {
  const { split_preference, setSplitPreference, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: string) {
    setSplitPreference(value)
    nextStep()
    router.push('/onboarding/workout-time')
  }

  return (
    <OnboardingLayout
      step={19}
      totalSteps={TOTAL_STEPS}
      question="Do you have a preferred training approach?"
      context="If not sure, we'll build the optimal split for your schedule."
      onBack={() => router.push('/onboarding/equipment')}
    >
      <div className="flex flex-col gap-3 mt-4">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              split_preference === option.value
                ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                : 'bg-[#111113] border-[#1A1A1F] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
