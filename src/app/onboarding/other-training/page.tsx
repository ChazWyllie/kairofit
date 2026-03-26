'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

const OPTIONS = [
  { value: 'none', label: 'None - just strength training' },
  { value: 'running', label: 'Running or cardio' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'sports', label: 'Team sports' },
  { value: 'yoga_pilates', label: 'Yoga or Pilates' },
  { value: 'martial_arts', label: 'Martial arts' },
]

export default function OtherTrainingPage() {
  const { other_training, setOtherTraining, nextStep } = useOnboardingStore()
  const router = useRouter()

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(other_training.length > 0 ? other_training : [])
  )

  function toggleOption(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (value === 'none') {
        // 'None' is mutually exclusive with all other options
        return new Set(['none'])
      }
      // Selecting a real activity clears 'none'
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
    // Filter out the 'none' sentinel before saving
    const training = [...selected].filter((v) => v !== 'none')
    setOtherTraining(training)
    nextStep()
    router.push('/onboarding/sleep')
  }

  return (
    <OnboardingLayout
      step={21}
      totalSteps={TOTAL_STEPS}
      question="Do you do any other types of training?"
      context="We'll factor this into your weekly volume and recovery planning."
      onBack={() => router.push('/onboarding/workout-time')}
    >
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-2">
          {OPTIONS.map((option) => {
            const isSelected = selected.has(option.value)
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-[#1A1A1F] border-[#6366F1] text-[#F5F5F4]'
                    : 'bg-[#111113] border-[#1A1A1F] text-[#F5F5F4] hover:border-[#6366F1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[#6366F1] border-[#6366F1]' : 'border-[#6B6B68]'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
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
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="w-full py-3 rounded-lg bg-[#6366F1] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}
