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
      <div className="flex flex-col gap-8 mt-4">
        <div>
          <p className="text-sm font-medium text-[#A1A19E] mb-3">Age range</p>
          <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map((age) => (
              <button
                key={age}
                onClick={() => setLocalAge(age)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  localAge === age
                    ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                    : 'bg-[#111113] border-[#1A1A1F] text-[#A1A19E] hover:border-[#6366F1]'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[#A1A19E] mb-3">Gender</p>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalGender(opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  localGender === opt.value
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
