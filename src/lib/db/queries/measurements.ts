/**
 * Body Measurements Query Functions
 *
 * Reads decrypted measurement history via the get_body_measurements RPC.
 * Decryption happens inside Postgres (Vault key never leaves the DB).
 * Only call from Server Components, Server Actions, or Route Handlers.
 */

import { createServerClient } from '@/lib/db/supabase'

export interface MeasurementRow {
  id: string
  measured_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  notes: string | null
}

export async function getMeasurements(userId: string): Promise<MeasurementRow[]> {
  const supabase = await createServerClient()

  type RpcFn = (
    fn: string,
    args?: Record<string, string>
  ) => Promise<{ data: unknown; error: { message: string } | null }>
  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_body_measurements', {
    p_user_id: userId,
  })

  if (error) throw new Error(`Failed to fetch measurements: ${error.message}`)

  return (data ?? []) as MeasurementRow[]
}
