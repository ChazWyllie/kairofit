'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { AgeRange, Gender } from '@/types'

const AGE_OPTIONS: AgeRange[] = ['18-23', '24-29', '30s', '40s', '50+']

const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

export default function DemographicsPage() {
  const { age_range, gender, setAgeRange, setGender, nextStep } = useOnboardingStore()
  const [localAge, setLocalAge] = useState<AgeRange | null>(age_range)
  const [localGender, setLocalGender] = useState<Gender | null>(gender)
  const router = useRouter()

  const canContinue = localAge !== null && localGender !== null

  function handleContinue() {
    if (!canContinue) return
    setAgeRange(localAge)
    setGender(localGender)
    nextStep()
    router.push('/onboarding/schedule')
  }

  return (
    <OnboardingLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      question="A bit about you"
      onBack={() => router.push('/onboarding/experience')}
    >
      <div className="mt-4 flex flex-col gap-8">
        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A19E]">Age range</p>
          <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map((age) => (
              <button
                key={age}
                onClick={() => setLocalAge(age)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  localAge === age
                    ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                    : 'border-[#1A1A1F] bg-[#111113] text-[#A1A19E] hover:border-[#6366F1]'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A19E]">Gender</p>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalGender(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  localGender === opt.value
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
