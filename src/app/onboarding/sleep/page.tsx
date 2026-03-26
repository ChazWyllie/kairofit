'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { SleepRange } from '@/types'

const OPTIONS: Array<{ value: SleepRange; label: string }> = [
  { value: '<5', label: 'Less than 5 hours' },
  { value: '5-6', label: '5-6 hours' },
  { value: '7-8', label: '7-8 hours' },
  { value: '>8', label: 'More than 8 hours' },
]

export default function SleepPage() {
  const { sleep_hours_range, setSleepHoursRange, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleSelect(value: SleepRange) {
    setSleepHoursRange(value)
    nextStep()
    router.push('/onboarding/program-building')
  }

  return (
    <OnboardingLayout
      step={22}
      totalSteps={TOTAL_STEPS}
      question="How much sleep do you typically get per night?"
      onBack={() => router.push('/onboarding/other-training')}
    >
      <div className="mt-4 flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              sleep_hours_range === option.value
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
