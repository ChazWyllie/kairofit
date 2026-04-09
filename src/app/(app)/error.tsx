/**
 * App Shell Error Boundary
 *
 * Catches errors within any (app)/ route (dashboard, workout, etc.).
 * The root layout and app shell layout remain intact - only the page content
 * is replaced with this error UI.
 */

'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: pipe to Sentry once @sentry/nextjs is installed (Phase A2)
    console.error('App error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F4]">
          Something went wrong
        </h2>
        <p className="mt-3 text-sm text-[#A1A19E]">
          An error occurred loading this page. Your workout data is safe.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-[#6B6B68]">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[#6366F1] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5558E6]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
