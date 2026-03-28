/**
 * Dashboard Page (Server Component)
 *
 * First screen the user sees after onboarding completes.
 * Loads the active program via getActiveProgram and renders
 * a summary of the program name and day list.
 *
 * Auth is guaranteed by middleware - no redirect logic needed here.
 */

import { createServerClient } from '@/lib/db/supabase'
import { getActiveProgram } from '@/lib/db/queries/programs'

export const revalidate = 0 // always fresh - user expects immediate updates

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware guarantees auth, but session can expire between middleware check and here
  // (TOCTOU window), so defensive null check is still required
  const program = user ? await getActiveProgram(user.id) : null

  if (!program) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#1A1A1F] border-t-[#6366F1]" />
        <h1
          data-testid="dashboard-loading-heading"
          className="mb-2 text-xl font-medium text-[#F5F5F4]"
        >
          Building your program...
        </h1>
        <p className="text-sm text-[#A1A19E]">
          Your personalized plan is being generated. Check back in a moment.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 data-testid="dashboard-program-name" className="text-2xl font-semibold text-[#F5F5F4]">
          {program.name}
        </h1>
        {program.description && (
          <p className="mt-1 text-sm text-[#A1A19E]">{program.description}</p>
        )}
      </div>

      {program.days && program.days.length > 0 ? (
        <div className="flex flex-col gap-3">
          {program.days.map((day) => (
            <div
              key={day.id}
              data-testid="dashboard-day-card"
              className="rounded-xl border border-[#1A1A1F] bg-[#111113] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#6B6B68]">
                    Day {day.day_number}
                  </p>
                  <p className="mt-0.5 font-medium text-[#F5F5F4]">{day.name}</p>
                </div>
                {day.estimated_duration_minutes && (
                  <span className="text-sm text-[#6B6B68]">{day.estimated_duration_minutes}m</span>
                )}
              </div>

              {day.focus_muscles && day.focus_muscles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {day.focus_muscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="rounded-full bg-[#1A1A1F] px-2 py-0.5 text-xs text-[#A1A19E]"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p data-testid="dashboard-no-days-message" className="text-sm text-[#6B6B68]">
          No training days found.
        </p>
      )}
    </div>
  )
}
