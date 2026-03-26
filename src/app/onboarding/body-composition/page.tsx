'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

export default function BodyCompositionPage() {
  const { height_cm, weight_kg, setHeightCm, setWeightKg, setBodyFatPct, nextStep } = useOnboardingStore()
  const router = useRouter()

  const [height, setHeight] = useState(height_cm?.toString() ?? '')
  const [weight, setWeight] = useState(weight_kg?.toString() ?? '')
  const [bodyFat, setBodyFat] = useState('')

  const heightNum = Number(height)
  const weightNum = Number(weight)
  const canContinue =
    height.trim() !== '' &&
    weight.trim() !== '' &&
    !isNaN(heightNum) &&
    !isNaN(weightNum) &&
    heightNum > 0 &&
    weightNum > 0

  function handleContinue() {
    setHeightCm(heightNum)
    setWeightKg(weightNum)
    const bodyFatNum = bodyFat.trim() !== '' ? Number(bodyFat) : null
    setBodyFatPct(bodyFatNum)
    nextStep()
    router.push('/onboarding/why-now')
  }

  return (
    <OnboardingLayout
      step={10}
      totalSteps={TOTAL_STEPS}
      question="Help us personalize your program"
      context="Used for load recommendations and your transformation timeline. All data is encrypted."
      onBack={() => router.push('/onboarding/injuries')}
    >
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#A1A19E]">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 175"
            className="w-full px-4 py-3 rounded-lg bg-[#111113] border border-[#1A1A1F] text-[#F5F5F4] placeholder-[#6B6B68] focus:border-[#6366F1] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#A1A19E]">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 75"
            className="w-full px-4 py-3 rounded-lg bg-[#111113] border border-[#1A1A1F] text-[#F5F5F4] placeholder-[#6B6B68] focus:border-[#6366F1] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#A1A19E]">
            Body fat % <span className="text-[#6B6B68]">(optional)</span>
          </label>
          <input
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="e.g. 20"
            className="w-full px-4 py-3 rounded-lg bg-[#111113] border border-[#1A1A1F] text-[#F5F5F4] placeholder-[#6B6B68] focus:border-[#6366F1] focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full py-3 rounded-lg bg-[#6366F1] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mt-2"
        >
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}
