/**
 * Login Page
 *
 * Lives in (auth) route group - no app shell layout applied.
 * Supports: Magic Link and Google OAuth.
 *
 * TODO: Implement full UI per CLAUDE.md visual identity (dark, #0A0A0B bg).
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in - KairoFit',
}

export default function LoginPage() {
  // TODO: Implement
  // - Magic link form (email input + submit)
  // - Google OAuth button
  // - Apple Sign In button (optional, for UX - not required for PWA)
  // - KairoFit wordmark
  // - Link to signup

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B]">
      <div className="w-full max-w-sm px-6">
        <h1 className="mb-8 text-2xl font-medium text-[#F5F5F4]">Sign in to KairoFit</h1>
        {/* TODO: Magic link form */}
        {/* TODO: OAuth buttons */}
      </div>
    </div>
  )
}
