/**
 * Supabase Browser Client
 *
 * Separate file from supabase.ts to avoid bundling `next/headers`
 * (a server-only module) into Client Components.
 *
 * Use in Client Components for auth flows and real-time subscriptions.
 * Reads are subject to RLS - users only see their own data.
 *
 * For Server Components and Server Actions, use createServerClient
 * from '@/lib/db/supabase' instead.
 */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase.generated'

export function createBrowserClient() {
  return _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
