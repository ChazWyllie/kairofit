'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { ExperienceLevel } from '@/types'

const OPTIONS: Array<{ value: ExperienceLevel; label: string; description: string }> = [
  { value: 1, label: 'Just starting out', description: "I'm new to strength training" },
  {
    value: 2,
    label: 'Getting comfortable',
    description: "I've trained on and off, not consistently",
  },
  { value: 3, label: 'Intermediate', description: 'I train regularly and know the basics well' },
  { value: 4, label: 'Experienced', description: "I've been training consistently for 2+ years" },
  {
    value: 5,
    label: 'Advanced',
    description: 'I follow structured programs and track performance closely',
  },
]

export default function ExperiencePage() {
  const { experience_level, setExperienceLevel, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: ExperienceLevel) {
    setExperienceLevel(value)
    nextStep()
    router.push('/onboarding/demographics')
  }

  return (
    <OnboardingLayout
      step={2}
      totalSteps={TOTAL_STEPS}
      question="How would you describe your training experience?"
      context="We'll tailor the complexity and explanation depth to match."
      onBack={() => router.push('/onboarding/goal')}
    >
      <div className="mt-4 flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              experience_level === option.value
                ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                : 'border-[#1A1A1F] bg-[#111113] text-[#F5F5F4] hover:border-[#6366F1]'
            }`}
          >
            <p className="font-medium">{option.label}</p>
            <p className="mt-0.5 text-sm text-[#A1A19E]">{option.description}</p>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
