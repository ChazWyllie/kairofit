'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { getLoadingFact } from '@/lib/onboarding/archetypes'
import { persistOnboardingState, generateProgramAction } from '@/actions/onboarding.actions'
import type { OnboardingState } from '@/types'

export default function ProgramBuildingPage() {
  const store = useOnboardingStore()
  const { auth_ready, goal, experience_level } = store
  const router = useRouter()

  const [phase, setPhase] = useState<'auth' | 'generating' | 'error'>('auth')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAuthError, setIsAuthError] = useState(false)
  // Prevent double-invocation in React StrictMode
  const hasStarted = useRef(false)

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

  // Once in generating phase, save profile data and call AI generation
  useEffect(() => {
    if (phase !== 'generating') return
    if (hasStarted.current) return
    hasStarted.current = true

    async function run() {
      try {
        // Snapshot current store state for the server call
        const state = useOnboardingStore.getState() as OnboardingState
        await persistOnboardingState(state)

        const result = await generateProgramAction({ confirm_generation: true })

        if (result?.serverError || !result?.data?.programId) {
          setErrorMessage('Failed to generate your program. Please try again.')
          setPhase('error')
          return
        }

        // Purge health/biometric PII from localStorage now that it's saved server-side
        useOnboardingStore.persist.clearStorage()
        router.push('/dashboard')
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message === 'Authentication required') {
          setIsAuthError(true)
          setErrorMessage('Your session expired before your program could be generated.')
        } else {
          setIsAuthError(false)
          setErrorMessage('Something went wrong. Please try again.')
        }
        setPhase('error')
      }
    }

    run()
  }, [phase, router])

  if (phase === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6">
        <div className="w-full max-w-sm text-center">
          <p data-testid="program-building-error-message" className="mb-6 text-sm text-[#EF4444]">{errorMessage}</p>
          {isAuthError ? (
            <button
              data-testid="program-building-reauth-button"
              onClick={() => router.push('/onboarding/email-gate')}
              className="rounded-lg bg-[#6366F1] px-6 py-3 font-medium text-white"
            >
              Sign in again
            </button>
          ) : (
            <button
              data-testid="program-building-retry-button"
              onClick={() => {
                hasStarted.current = false
                setIsAuthError(false)
                setPhase('generating')
              }}
              className="rounded-lg bg-[#6366F1] px-6 py-3 font-medium text-white"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6">
      <div className="w-full max-w-sm text-center">
        {/* Spinner */}
        <div data-testid="program-building-spinner" className="mx-auto mb-8 h-12 w-12 animate-spin rounded-full border-2 border-[#1A1A1F] border-t-[#6366F1]" />

        {phase === 'auth' ? (
          <>
            <h1 data-testid="program-building-auth-heading" className="mb-2 text-xl font-medium text-[#F5F5F4]">Setting up your account...</h1>
            <p className="text-sm text-[#A1A19E]">Just a moment while we get everything ready.</p>
          </>
        ) : (
          <>
            <h1 data-testid="program-building-gen-heading" className="mb-4 text-xl font-medium text-[#F5F5F4]">Building your program...</h1>
            <p className="text-sm leading-relaxed text-[#A1A19E]">{fact}</p>
          </>
        )}
      </div>
    </div>
  )
}
