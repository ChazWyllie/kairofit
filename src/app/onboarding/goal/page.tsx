'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { FitnessGoal } from '@/types'

const OPTIONS: Array<{ value: FitnessGoal; label: string; emoji: string }> = [
  { value: 'muscle', label: 'Build muscle', emoji: '💪' },
  { value: 'fat_loss', label: 'Lose fat', emoji: '🔥' },
  { value: 'strength', label: 'Build strength', emoji: '🏋️' },
  { value: 'fitness', label: 'Improve fitness', emoji: '🏃' },
  { value: 'recomposition', label: 'Recompose body', emoji: '⚡' },
]

export default function GoalPage() {
  const { goal, setGoal, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: FitnessGoal) {
    setGoal(value)
    nextStep()
    router.push('/onboarding/experience')
  }

  return (
    <OnboardingLayout
      step={1}
      totalSteps={TOTAL_STEPS}
      question="What brings you to KairoFit?"
      context="We'll build your program around this goal."
      showBack={false}
    >
      <div className="mt-4 flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              goal === option.value
                ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                : 'border-[#1A1A1F] bg-[#111113] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <span className="mr-3">{option.emoji}</span>
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
