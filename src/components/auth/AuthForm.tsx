'use client'

/**
 * Shared Auth Form
 *
 * Used by both /auth/login and /auth/signup.
 * Supabase handles magic link for both new and existing users identically,
 * so the only difference between login and signup is the page copy.
 *
 * Supports:
 * - Magic link via email (primary)
 * - Google OAuth (secondary)
 */

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/db/supabase-browser'
import { Mail, Loader2 } from 'lucide-react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supabase = createBrowserClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setFormState('submitting')
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // After clicking the magic link in email, user lands at this callback
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setFormState('error')
      setErrorMessage(error.message)
    } else {
      setFormState('success')
    }
  }

  async function handleGoogleOAuth() {
    setFormState('submitting')
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setFormState('error')
      setErrorMessage(error.message)
    }
    // On success, the browser navigates to Google's OAuth page automatically
  }

  if (formState === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/10">
          <Mail className="h-6 w-6 text-[#10B981]" />
        </div>
        <h2 className="text-xl font-medium text-[#F5F5F4]">Check your email</h2>
        <p className="text-sm text-[#A1A19E]">
          We sent a sign-in link to <span className="font-medium text-[#F5F5F4]">{email}</span>.
          Click the link to continue.
        </p>
        <button
          onClick={() => setFormState('idle')}
          className="text-sm text-[#6366F1] transition-colors hover:text-[#818CF8]"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium text-[#A1A19E]">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formState === 'submitting'}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/10 bg-[#111113] px-4 py-3 text-[#F5F5F4] transition-colors placeholder:text-[#6B6B68] focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={formState === 'submitting' || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5558E6] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:opacity-50"
        >
          {formState === 'submitting' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Continue with Email
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0A0A0B] px-3 text-[#6B6B68]">or</span>
        </div>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleOAuth}
        disabled={formState === 'submitting'}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-[#111113] px-4 py-3 text-sm font-medium text-[#F5F5F4] transition-colors hover:bg-[#1A1A1F] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Error message */}
      {errorMessage && (
        <p className="rounded-lg bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">{errorMessage}</p>
      )}

      {/* Toggle login/signup */}
      <p className="text-center text-sm text-[#6B6B68]">
        {mode === 'login' ? (
          <>
            New to KairoFit?{' '}
            <a
              href="/auth/signup"
              className="text-[#6366F1] transition-colors hover:text-[#818CF8]"
            >
              Create an account
            </a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a href="/auth/login" className="text-[#6366F1] transition-colors hover:text-[#818CF8]">
              Sign in
            </a>
          </>
        )}
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
