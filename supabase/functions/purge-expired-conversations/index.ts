// supabase/functions/purge-expired-conversations/index.ts
//
// GDPR compliance: deletes intake_conversations where expires_at < now()
// The expires_at column alone does not enforce deletion - Postgres does not
// auto-delete rows based on column values. This function is the enforcement mechanism.
//
// Setup: run this as a cron job every night at 2am UTC
// In Supabase Dashboard -> Database -> Extensions -> enable pg_cron
// Then run this SQL once:
//   SELECT cron.schedule(
//     'purge-expired-conversations',
//     '0 2 * * *',
//     $$DELETE FROM public.intake_conversations WHERE expires_at < now()$$
//   );
//
// Alternatively deploy this as a Supabase Edge Function and schedule it
// via the Supabase Dashboard -> Edge Functions -> Schedules

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    // Service role required for deletion across all users
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { count, error } = await supabase
    .from('intake_conversations')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Failed to purge expired conversations:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log(`Purged ${count ?? 0} expired intake conversations`)
  return new Response(JSON.stringify({ deleted: count ?? 0 }), { status: 200 })
})
