/**
 * Auth Callback Route Handler
 *
 * This route is where Supabase redirects after a magic link click or OAuth flow.
 * It exchanges the auth code for a session, sets the cookie, and redirects
 * to the appropriate page:
 *
 * - /onboarding  if the user has no onboarding_completed_at (new user)
 * - /dashboard   if onboarding is complete (returning user)
 * - [redirectTo] if specified in the query params (e.g. deep link from middleware)
 *
 * Path: /auth/callback (NOT inside (auth) group - this is a Route Handler, not a page)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo')

  if (!code) {
    // No code means the link was invalid or expired
    return NextResponse.redirect(
      new URL('/auth/login?error=invalid_link', request.url)
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Exchange the temporary code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Auth callback exchange error:', exchangeError.message)
    return NextResponse.redirect(
      new URL('/auth/login?error=exchange_failed', request.url)
    )
  }

  // Session is now set via cookies. Determine where to send the user.

  // If a specific redirect was requested (e.g. from middleware), honour it
  if (redirectTo && redirectTo.startsWith('/')) {
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // Otherwise, check if onboarding is complete to decide the destination
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_completed_at) {
      // New user or incomplete onboarding - send to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Returning user with completed onboarding - send to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
