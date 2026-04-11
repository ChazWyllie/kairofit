/**
 * MeasurementHistory (Server Component)
 *
 * Reads and displays the user's body measurement history.
 * Fetches via get_body_measurements RPC - values are decrypted server-side.
 * revalidatePath('/settings') from logMeasurementAction refreshes this list.
 */

import { createServerClient } from '@/lib/db/supabase'
import { getMeasurements } from '@/lib/db/queries/measurements'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function fmt(value: number | null, unit: string): string | null {
  if (value === null || value === undefined) return null
  return `${value}${unit}`
}

export async function MeasurementHistory() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  let rows
  try {
    rows = await getMeasurements(user.id)
  } catch {
    return (
      <div className="rounded-xl border border-[#2A2A2F] bg-[#111113] p-6">
        <h2 className="mb-1 text-base font-semibold text-[#F5F5F4]">Measurement history</h2>
        <p className="text-sm text-red-400">Could not load measurements. Try again later.</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[#2A2A2F] bg-[#111113] p-6">
        <h2 className="mb-1 text-base font-semibold text-[#F5F5F4]">Measurement history</h2>
        <p className="text-sm text-[#A1A19E]">No measurements yet. Log your first one above.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#2A2A2F] bg-[#111113] p-6">
      <h2 className="mb-4 text-base font-semibold text-[#F5F5F4]">Measurement history</h2>
      <div className="space-y-3">
        {rows.map((row) => {
          const chips = [
            fmt(row.weight_kg, ' kg'),
            fmt(row.body_fat_pct, '%'),
            fmt(row.chest_cm, ' cm chest'),
            fmt(row.waist_cm, ' cm waist'),
            fmt(row.hips_cm, ' cm hips'),
          ].filter(Boolean) as string[]

          return (
            <div
              key={row.id}
              className="flex flex-col gap-1 rounded-lg border border-[#2A2A2F] bg-[#1A1A1F] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-mono text-xs text-[#6B6B68]">
                {formatDate(row.measured_at)}
              </span>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded bg-[#111113] px-2 py-0.5 font-mono text-xs text-[#F5F5F4]"
                  >
                    {chip}
                  </span>
                ))}
                {row.notes && <span className="text-xs italic text-[#6B6B68]">{row.notes}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
