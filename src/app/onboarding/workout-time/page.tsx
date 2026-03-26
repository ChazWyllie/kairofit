'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { WorkoutTimePreference } from '@/types'

const OPTIONS: Array<{ value: WorkoutTimePreference; label: string; description?: string }> = [
  { value: 'morning', label: 'Morning', description: '6-9am' },
  { value: 'midday', label: 'Midday', description: '11am-1pm' },
  { value: 'afternoon', label: 'Afternoon', description: '3-6pm' },
  { value: 'evening', label: 'Evening', description: '7-10pm' },
  { value: 'no_preference', label: 'No preference' },
]

export default function WorkoutTimePage() {
  const { workout_time_preference, setWorkoutTimePreference, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: WorkoutTimePreference) {
    setWorkoutTimePreference(value)
    nextStep()
    router.push('/onboarding/other-training')
  }

  return (
    <OnboardingLayout
      step={20}
      totalSteps={TOTAL_STEPS}
      question="When do you prefer to train?"
      context="We'll use this for smart notification timing."
      onBack={() => router.push('/onboarding/split-preference')}
    >
      <div className="mt-4 flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              workout_time_preference === option.value
                ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                : 'border-[#1A1A1F] bg-[#111113] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <div>
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="ml-2 text-sm text-[#A1A19E]">{option.description}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
