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
  const { work_schedule, activity_level, setWorkSchedule, setActivityLevel, nextStep } = useOnboardingStore()
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
      <div className="flex flex-col gap-8 mt-4">
        <div>
          <p className="text-sm font-medium text-[#A1A19E] mb-3">Work schedule</p>
          <div className="flex flex-wrap gap-2">
            {SCHEDULE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalSchedule(opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  localSchedule === opt.value
                    ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                    : 'bg-[#111113] border-[#1A1A1F] text-[#A1A19E] hover:border-[#6366F1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[#A1A19E] mb-3">Activity level at work or daily life</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalActivity(opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  localActivity === opt.value
                    ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                    : 'bg-[#111113] border-[#1A1A1F] text-[#A1A19E] hover:border-[#6366F1]'
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
          className="w-full py-3 rounded-lg bg-[#6366F1] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}
