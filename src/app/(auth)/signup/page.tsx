/**
 * Signup Page
 *
 * Lives in (auth) route group - no app shell layout applied.
 * Renders the shared AuthForm in "signup" mode.
 *
 * Supabase handles magic link identically for new and existing users,
 * so the auth trigger in 001_initial_schema.sql creates the profile
 * row on first signup automatically.
 *
 * Middleware redirects authenticated users away from this page to /dashboard.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Create account - KairoFit',
  description: 'Start your research-backed AI workout program. Free to get started.',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F4]">KairoFit</h1>
          <p className="mt-2 text-sm text-[#A1A19E]">Your program starts here</p>
        </div>

        <Suspense fallback={<SignupFormSkeleton />}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  )
}

function SignupFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-[#111113]" />
        <div className="h-12 rounded-lg bg-[#111113]" />
        <div className="h-12 rounded-lg bg-[#6366F1]/20" />
      </div>
      <div className="h-12 rounded-lg bg-[#111113]" />
    </div>
  )
}
