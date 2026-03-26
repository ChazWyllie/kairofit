'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

const OPTIONS = [
  { value: 'not_knowing', label: 'Not knowing what to do', emoji: '❓' },
  { value: 'motivation', label: 'Lack of motivation', emoji: '😴' },
  { value: 'busy', label: 'Too busy', emoji: '📅' },
  { value: 'injury', label: 'Injury concerns', emoji: '🩹' },
  { value: 'no_results', label: 'Not seeing results', emoji: '📊' },
  { value: 'returning', label: 'Getting back after a break', emoji: '🔄' },
]

export default function ObstaclePage() {
  const { obstacle, setObstacle, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: string) {
    setObstacle(value)
    nextStep()
    router.push('/onboarding/training-recency')
  }

  return (
    <OnboardingLayout
      step={6}
      totalSteps={TOTAL_STEPS}
      question="What's been your biggest challenge?"
      onBack={() => router.push('/onboarding/social-proof-1')}
    >
      <div className="flex flex-col gap-3 mt-4">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              obstacle === option.value
                ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                : 'bg-[#111113] border-[#1A1A1F] text-[#F5F5F4] hover:border-[#6366F1]'
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
