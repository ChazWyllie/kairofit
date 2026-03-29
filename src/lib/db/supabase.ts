/**
 * Supabase Server Client
 *
 * Server-only module - imports `next/headers` which cannot be bundled
 * for Client Components. For browser/client usage, import from
 * '@/lib/db/supabase-browser' instead.
 *
 * The service role client (createServiceRoleClient) is for Edge Functions only.
 * Never expose the service role key to the browser.
 */

import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase.generated'

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
