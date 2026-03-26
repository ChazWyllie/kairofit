'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

const OPTIONS = [
  { value: 'fresh_start', label: 'I want a fresh start' },
  { value: 'upcoming_event', label: 'Upcoming event or deadline' },
  { value: 'doctor', label: 'My doctor suggested it' },
  { value: 'consistency', label: "I've struggled with consistency" },
  { value: 'returning', label: "I'm back after a break" },
  { value: 'ready', label: 'I just feel ready' },
]

export default function WhyNowPage() {
  const { why_now, setWhyNow, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: string) {
    setWhyNow(value)
    nextStep()
    router.push('/onboarding/psych-1')
  }

  return (
    <OnboardingLayout
      step={11}
      totalSteps={TOTAL_STEPS}
      question="What made you decide to start now?"
      onBack={() => router.push('/onboarding/body-composition')}
    >
      <div className="flex flex-col gap-3 mt-4">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              why_now === option.value
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
