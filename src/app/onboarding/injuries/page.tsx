'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { InjuryZone } from '@/types'

const INJURY_OPTIONS: Array<{ value: InjuryZone | 'none'; label: string; description?: string }> = [
  { value: 'none', label: 'None', description: 'No injuries or limitations' },
  { value: 'lower_back', label: 'Lower back' },
  { value: 'knees', label: 'Knees' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'wrists', label: 'Wrists' },
  { value: 'hips', label: 'Hips' },
  { value: 'neck', label: 'Neck' },
  { value: 'other', label: 'Other', description: "I'll describe it" },
]

export default function InjuriesPage() {
  const { injuries, setInjuries, nextStep } = useOnboardingStore()
  const router = useRouter()

  // Track selections as a Set for O(1) toggles
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(injuries.length > 0 ? injuries : [])
  )
  const [showConfirmation, setShowConfirmation] = useState(false)

  function toggleOption(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (value === 'none') {
        // 'None' is mutually exclusive with all injury zones
        return new Set(['none'])
      }
      // Selecting a real injury clears 'none'
      next.delete('none')
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  function handleContinue() {
    // Convert selection to InjuryZone[] (exclude the 'none' sentinel)
    const injuryZones = [...selected].filter((v): v is InjuryZone => v !== 'none') as InjuryZone[]
    setInjuries(injuryZones)
    nextStep()

    if (injuryZones.length > 0) {
      setShowConfirmation(true)
    } else {
      router.push('/onboarding/body-composition')
    }
  }

  if (showConfirmation) {
    return (
      <OnboardingLayout step={9} totalSteps={TOTAL_STEPS} showBack={false}>
        <div className="mt-4 flex flex-col gap-6">
          <div className="rounded-lg border border-[#10B981] bg-[#111113] px-5 py-6">
            <p className="mb-2 font-medium text-[#10B981]">Injury flags saved</p>
            <p className="text-[#F5F5F4]">
              We&apos;ll automatically exclude and modify exercises that could aggravate those
              areas.
            </p>
            <p className="mt-2 text-sm text-[#A1A19E]">
              You can update this anytime in your profile settings.
            </p>
          </div>
          <button
            onClick={() => router.push('/onboarding/body-composition')}
            className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white"
          >
            Got it
          </button>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      step={9}
      totalSteps={TOTAL_STEPS}
      question="Any areas of pain or injury we should work around?"
      context="We'll automatically exclude and modify exercises that could aggravate these areas."
      onBack={() => router.push('/onboarding/lifestyle')}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {INJURY_OPTIONS.map((option) => {
            const isSelected = selected.has(option.value)
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[#6366F1] bg-[#1A1A1F] text-[#F5F5F4]'
                    : 'border-[#1A1A1F] bg-[#111113] text-[#F5F5F4] hover:border-[#6366F1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                      isSelected ? 'border-[#6366F1] bg-[#6366F1]' : 'border-[#6B6B68]'
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    {option.description && (
                      <p className="text-sm text-[#A1A19E]">{option.description}</p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}
