/**
 * 404 Not Found Page
 *
 * Rendered when no route matches the URL.
 * Uses the root layout (no app shell nav - user may not be authenticated).
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold text-[#6366F1]">404</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-[#F5F5F4]">Page not found</h1>
        <p className="mt-3 text-sm text-[#A1A19E]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-[#6366F1] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5558E6]"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
