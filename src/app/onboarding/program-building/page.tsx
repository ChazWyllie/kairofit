'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { getLoadingFact } from '@/lib/onboarding/archetypes'

export default function ProgramBuildingPage() {
  const { auth_ready, goal, experience_level } = useOnboardingStore()
  const router = useRouter()

  const [phase, setPhase] = useState<'auth' | 'generating'>('auth')

  const fact = getLoadingFact(goal ?? 'fitness', experience_level ?? 1)

  // Wait for auth_ready, or proceed after 5 seconds regardless
  useEffect(() => {
    if (auth_ready) {
      setPhase('generating')
      return
    }

    const timeout = setTimeout(() => {
      setPhase('generating')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [auth_ready])

  // Once in generating phase, stub navigation to dashboard
  // TODO: Call generateProgram server action here; navigate on success
  useEffect(() => {
    if (phase !== 'generating') return

    const stub = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(stub)
  }, [phase, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6">
      <div className="w-full max-w-sm text-center">
        {/* Spinner */}
        <div className="mx-auto mb-8 h-12 w-12 animate-spin rounded-full border-2 border-[#1A1A1F] border-t-[#6366F1]" />

        {phase === 'auth' ? (
          <>
            <h1 className="mb-2 text-xl font-medium text-[#F5F5F4]">Setting up your account...</h1>
            <p className="text-sm text-[#A1A19E]">Just a moment while we get everything ready.</p>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-xl font-medium text-[#F5F5F4]">Building your program...</h1>
            <p className="text-sm leading-relaxed text-[#A1A19E]">{fact}</p>
          </>
        )}
      </div>
    </div>
  )
}
