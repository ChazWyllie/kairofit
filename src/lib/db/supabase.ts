/**
 * Supabase Client Helpers
 *
 * Two patterns depending on context:
 * - createBrowserClient(): for Client Components
 * - createServerClient(): for Server Components and Server Actions
 *
 * Never use createBrowserClient() in a Server Component.
 * Never use createServerClient() in a Client Component.
 *
 * The service role client (createServiceRoleClient) is for Edge Functions only.
 * Never expose the service role key to the browser.
 */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase.generated'

// ============================================================
// BROWSER CLIENT (Client Components)
// ============================================================

/**
 * Use in Client Components for real-time subscriptions and reads.
 * Reads are subject to RLS - users only see their own data.
 */
export function createBrowserClient() {
  return _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================================
// SERVER CLIENT (Server Components + Server Actions)
// ============================================================

/**
 * Use in Server Components and Server Actions.
 * Handles cookie-based auth automatically.
 *
 * Usage in Server Actions:
 * const supabase = await createServerClient()
 * const { data: { user } } = await supabase.auth.getUser()
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - cookie setting is a no-op
          }
        },
      },
    }
  )
}
