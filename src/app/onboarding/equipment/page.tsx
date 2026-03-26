'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { Equipment } from '@/types'

const EQUIPMENT_OPTIONS: Array<{ value: Equipment; label: string }> = [
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'kettlebells', label: 'Kettlebells' },
  { value: 'barbells', label: 'Barbells' },
  { value: 'cables_machines', label: 'Cables and machines' },
  { value: 'pull_up_bar', label: 'Pull-up bar' },
  { value: 'resistance_bands', label: 'Resistance bands' },
  { value: 'bench', label: 'Bench' },
  { value: 'squat_rack', label: 'Squat rack' },
  { value: 'bodyweight', label: 'Bodyweight only' },
]

export default function EquipmentPage() {
  const { equipment, setEquipment, nextStep } = useOnboardingStore()
  const router = useRouter()

  const [selected, setSelected] = useState<Set<string>>(() => new Set(equipment))

  function toggleOption(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  function handleContinue() {
    setEquipment([...selected] as Equipment[])
    nextStep()
    router.push('/onboarding/split-preference')
  }

  return (
    <OnboardingLayout
      step={18}
      totalSteps={TOTAL_STEPS}
      question="What equipment do you have access to?"
      context="Your program will only include exercises you can actually do."
      onBack={() => router.push('/onboarding/email-gate')}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {EQUIPMENT_OPTIONS.map((option) => {
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
                  <span className="font-medium">{option.label}</span>
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
