'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'
import type { FitnessGoal, ExperienceLevel } from '@/types'

// Personalized copy keyed by goal. Two lines per goal - selected by experience level.
const SOCIAL_PROOF: Record<FitnessGoal, [string, string]> = {
  muscle: [
    'Over 84,000 intermediate lifters targeting muscle gain have built measurable strength with evidence-based programming.',
    'Lifters who follow structured progressive overload programs gain 2-3x more muscle than those training without a plan.',
  ],
  fat_loss: [
    'People who combine resistance training with a calorie deficit preserve 40% more lean muscle than cardio-only approaches.',
    'Evidence-based fat loss programs reduce the risk of rebound weight gain by keeping metabolism higher through the cut.',
  ],
  strength: [
    'Structured strength programs produce 25-30% greater 1RM improvements over 12 weeks compared to unstructured training.',
    'Compound-focused programming with planned progressive overload is the single most validated strength development approach.',
  ],
  fitness: [
    'Full-body training 3x/week produces the most comprehensive fitness improvements for general health goals.',
    'Consistency over 8 weeks produces more benefit than intensity over 2. Your program is designed for sustainable progression.',
  ],
  recomposition: [
    'Body recomposition - losing fat while gaining muscle simultaneously - is achievable with precise programming and nutrition.',
    'Resistance training at moderate calorie balance with high protein is the evidence-based approach for simultaneous recomposition.',
  ],
}

function getSocialProofText(goal: FitnessGoal | null, level: ExperienceLevel | null): string {
  const goalKey: FitnessGoal = goal ?? 'fitness'
  const lines = SOCIAL_PROOF[goalKey]
  // Use experience level to select between the two lines (1-3 get line 0, 4-5 get line 1)
  return (level !== null && level >= 4 ? lines[1] : lines[0]) ?? lines[0] ?? ''
}

export default function SocialProof1Page() {
  const { goal, experience_level, nextStep } = useOnboardingStore()
  const router = useRouter()

  function handleContinue() {
    nextStep()
    router.push('/onboarding/obstacle')
  }

  const proofText = getSocialProofText(goal, experience_level)

  return (
    <OnboardingLayout
      step={5}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.push('/onboarding/schedule')}
    >
      <div className="flex flex-col gap-8 mt-4">
        <div className="rounded-lg bg-[#111113] border border-[#1A1A1F] px-5 py-6">
          <p className="text-lg text-[#F5F5F4] leading-relaxed">{proofText}</p>
          <p className="text-xs text-[#6B6B68] mt-4">Based on published exercise science research</p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg bg-[#6366F1] text-white font-medium"
        >
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}
