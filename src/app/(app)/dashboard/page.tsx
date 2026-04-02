/**
 * Dashboard Page (Server Component)
 *
 * First screen the user sees after onboarding completes.
 * Loads the active program, profile, streak, volume, and next day.
 *
 * Auth is guaranteed by middleware - no redirect logic needed here.
 */

import { createServerClient } from '@/lib/db/supabase'
import { getActiveProgram } from '@/lib/db/queries/programs'
import { getProfile } from '@/lib/db/queries/profiles'
import { getStreakCount, getWeeklyVolume, getNextProgramDay } from '@/lib/db/queries/sessions'
import { ProgramCard } from '@/components/workout/ProgramCard'
import { TodayWorkout } from '@/components/workout/TodayWorkout'
import { StatsStrip } from '@/components/workout/StatsStrip'

export const revalidate = 0 // always fresh - user expects immediate updates

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware guarantees auth, but session can expire between middleware check and here
  // (TOCTOU window), so defensive null check is still required
  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-medium text-[#F5F5F4]">Unauthorized</h1>
      </div>
    )
  }

  const program = await getActiveProgram(user.id)

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

  // Load profile, stats, and next day in parallel
  const [profile, streak, weeklyVolume, nextDay] = await Promise.all([
    getProfile(user.id),
    getStreakCount(user.id),
    getWeeklyVolume(user.id),
    getNextProgramDay(user.id, program.id, program.current_week),
  ])

  const weeksComplete = nextDay === null && program.days.length > 0

  return (
    <div className="space-y-6 px-4 py-6">
      <ProgramCard program={program} archetype={profile?.archetype ?? null} />

      <StatsStrip streak={streak} weeklyVolumeKg={weeklyVolume} />

      <TodayWorkout day={nextDay} weeksComplete={weeksComplete} />
    </div>
  )
}
