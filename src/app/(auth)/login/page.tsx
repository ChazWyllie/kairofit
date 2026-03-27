/**
 * Login Page
 *
 * Lives in (auth) route group - no app shell layout applied.
 * Renders the shared AuthForm in "login" mode.
 *
 * Middleware redirects authenticated users away from this page to /dashboard.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Sign in - KairoFit',
  description: 'Sign in to your KairoFit account for research-backed AI workout programming.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F4]">KairoFit</h1>
          <p className="mt-2 text-sm text-[#A1A19E]">Research-backed AI workout programming</p>
        </div>

        {/* AuthForm reads useSearchParams, which requires Suspense in App Router */}
        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  )
}

function AuthFormSkeleton() {
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
