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

export default function Psych2Page() {
  const { psych_scores, setPsychScore, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: string) {
    setPsychScore(1, parseInt(value, 10))
    nextStep()
    router.push('/onboarding/psych-3')
  }

  const currentValue = psych_scores[1]?.toString()

  return (
    <OnboardingLayout
      step={13}
      totalSteps={TOTAL_STEPS}
      question="I love when my workouts challenge me more each session."
      context="Rate how much this resonates with you."
      onBack={() => router.push('/onboarding/psych-1')}
    >
      <div className="flex flex-col gap-3 mt-4">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              currentValue === option.value
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
