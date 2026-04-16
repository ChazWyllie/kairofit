/**
 * Next.js Middleware - Authentication Guard
 *
 * Protects all routes under (app) from unauthenticated access.
 * Redirects to /auth/login if no valid session exists.
 *
 * Runs on the Edge runtime - no Node.js APIs available here.
 * Keep this file lean - no database calls, no heavy imports.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/onboarding']

// Routes that should redirect authenticated users away (e.g. login page)
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets and API routes through without auth check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') || // Stripe webhooks do their own auth
    pathname.startsWith('/api/sync') || // Service worker sync - auth handled inside route
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client that can refresh the session cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session (extends the cookie if valid)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login for protected routes
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Run middleware on all routes except static files and api routes that handle their own auth
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)'],
}
