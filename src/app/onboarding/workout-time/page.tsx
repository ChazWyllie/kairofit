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
      <div className="flex flex-col gap-3 mt-4">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              workout_time_preference === option.value
                ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                : 'bg-[#111113] border-[#1A1A1F] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <div>
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="text-sm text-[#A1A19E] ml-2">{option.description}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
