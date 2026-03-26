'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

const OPTIONS = [
  { value: '1', label: 'Strongly disagree' },
  { value: '2', label: 'Disagree' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Agree' },
  { value: '5', label: 'Strongly agree' },
]

export default function Psych4Page() {
  const { psych_scores, setPsychScore, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: string) {
    setPsychScore(3, parseInt(value, 10))
    nextStep()
    router.push('/onboarding/archetype-reveal')
  }

  const currentValue = psych_scores[3]?.toString()

  return (
    <OnboardingLayout
      step={15}
      totalSteps={TOTAL_STEPS}
      question="Understanding why an exercise is in my program motivates me to do it well."
      context="Rate how much this resonates with you."
      onBack={() => router.push('/onboarding/psych-3')}
    >
      <div className="mt-4 flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              currentValue === option.value
                ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                : 'border-[#1A1A1F] bg-[#111113] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
