'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { WorkSchedule, ActivityLevel } from '@/types'

const SCHEDULE_OPTIONS: Array<{ value: WorkSchedule; label: string }> = [
  { value: '9-5', label: '9-5' },
  { value: 'shift', label: 'Shift work' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'retired', label: 'Retired / Not working' },
]

const ACTIVITY_OPTIONS: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Mostly sitting' },
  { value: 'active', label: 'On my feet' },
  { value: 'mixed', label: 'Mix of both' },
]

export default function LifestylePage() {
  const { work_schedule, activity_level, setWorkSchedule, setActivityLevel, nextStep } =
    useOnboardingStore()
  const [localSchedule, setLocalSchedule] = useState<WorkSchedule | null>(work_schedule)
  const [localActivity, setLocalActivity] = useState<ActivityLevel | null>(activity_level)
  const router = useRouter()

  const canContinue = localSchedule !== null && localActivity !== null

  function handleContinue() {
    if (!canContinue) return
    setWorkSchedule(localSchedule)
    setActivityLevel(localActivity)
    nextStep()
    router.push('/onboarding/injuries')
  }

  return (
    <OnboardingLayout
      step={8}
      totalSteps={TOTAL_STEPS}
      question="Tell us about your daily routine"
      onBack={() => router.push('/onboarding/training-recency')}
    >
      <div className="mt-4 flex flex-col gap-8">
        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A19E]">Work schedule</p>
          <div className="flex flex-wrap gap-2">
            {SCHEDULE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalSchedule(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  localSchedule === opt.value
                    ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                    : 'border-[#1A1A1F] bg-[#111113] text-[#A1A19E] hover:border-[#6366F1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A19E]">
            Activity level at work or daily life
          </p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalActivity(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  localActivity === opt.value
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
