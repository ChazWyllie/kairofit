'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { SessionDurationPreference } from '@/types'

const DAYS_OPTIONS = [2, 3, 4, 5, 6]

const DURATION_OPTIONS: Array<{ value: SessionDurationPreference; label: string }> = [
  { value: '20-30', label: '20-30 min' },
  { value: '30-45', label: '30-45 min' },
  { value: '45-60', label: '45-60 min' },
  { value: '60+', label: '60+ min' },
]

export default function SchedulePage() {
  const {
    days_per_week,
    session_duration_preference,
    setDaysPerWeek,
    setSessionDuration,
    nextStep,
  } = useOnboardingStore()
  const [localDays, setLocalDays] = useState<number | null>(days_per_week)
  const [localDuration, setLocalDuration] = useState<SessionDurationPreference | null>(
    session_duration_preference
  )
  const router = useRouter()

  const canContinue = localDays !== null && localDuration !== null

  function handleContinue() {
    if (!canContinue) return
    setDaysPerWeek(localDays)
    setSessionDuration(localDuration)
    nextStep()
    router.push('/onboarding/social-proof-1')
  }

  return (
    <OnboardingLayout
      step={4}
      totalSteps={TOTAL_STEPS}
      question="How much time can you commit?"
      onBack={() => router.push('/onboarding/demographics')}
    >
      <div className="mt-4 flex flex-col gap-8">
        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A19E]">Days per week</p>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map((days) => (
              <button
                key={days}
                onClick={() => setLocalDays(days)}
                className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-colors ${
                  localDays === days
                    ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                    : 'border-[#1A1A1F] bg-[#111113] text-[#A1A19E] hover:border-[#6366F1]'
                }`}
              >
                {days}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A19E]">Session duration</p>
          <div className="flex flex-col gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalDuration(opt.value)}
                className={`w-full rounded-lg border py-3 text-sm font-medium transition-colors ${
                  localDuration === opt.value
                    ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                    : 'border-[#1A1A1F] bg-[#111113] text-[#A1A19E] hover:border-[#6366F1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}
