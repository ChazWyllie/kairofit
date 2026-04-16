/**
 * Global Error Boundary
 *
 * Catches errors in the root layout itself - the last line of defense.
 * Must define its own <html> and <body> since the root layout may have crashed.
 *
 * This is a Client Component by requirement (Next.js error boundaries must be).
 */

'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: pipe to Sentry once @sentry/nextjs is installed (Phase A2)
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-[#0A0A0B] text-[#F5F5F4] antialiased">
        <div className="mx-auto max-w-md px-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-[#A1A19E]">
            An unexpected error occurred. Your workout data is safe.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-[#6366F1] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5558E6]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
