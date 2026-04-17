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
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-[#F5F5F4] antialiased">
        <div className="max-w-md border border-[#1A1A1A] bg-[#0A0A0A] p-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#DC2626]">Error</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
            Something went wrong
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#999999]">
            An unexpected error occurred while rendering this page.
          </p>
          <button
            onClick={reset}
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-[#DC2626] px-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#EF4444]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
