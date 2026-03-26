'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

// Values are months since last consistent training. 0 = currently active.
const OPTIONS = [
  { value: 0, label: 'Currently training', description: 'Active right now' },
  { value: 1, label: 'Last month' },
  { value: 3, label: '1-3 months ago' },
  { value: 6, label: '3-6 months ago' },
  { value: 12, label: '6-12 months ago' },
  { value: 24, label: 'More than a year ago' },
]

export default function TrainingRecencyPage() {
  const { training_recency_months, setTrainingRecency, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(months: number) {
    setTrainingRecency(months)
    nextStep()
    router.push('/onboarding/lifestyle')
  }

  return (
    <OnboardingLayout
      step={7}
      totalSteps={TOTAL_STEPS}
      question="When did you last train consistently?"
      context="Helps us set the right starting volume and progression speed."
      onBack={() => router.push('/onboarding/obstacle')}
    >
      <div className="flex flex-col gap-3 mt-4">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              training_recency_months === option.value
                ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                : 'bg-[#111113] border-[#1A1A1F] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <p className="font-medium">{option.label}</p>
            {option.description && (
              <p className="text-sm text-[#A1A19E] mt-0.5">{option.description}</p>
            )}
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
