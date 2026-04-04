/**
 * Post-Workout Complete Page
 *
 * Server Component for the post-workout experience.
 * Renders in sequence:
 * 1. Streak + milestone animation
 * 2. Muscle recovery heatmap
 * 3. Kiro AI debrief (streaming)
 * 4. Shareable workout card (on-demand)
 *
 * Redirects to dashboard if session not found or not completed.
 */

import { redirect } from 'next/navigation'
import { getCompletedSessionSummary } from '@/lib/db/queries/sessions'
import { getMuscleRecovery } from '@/lib/db/queries/recovery'
import { getStreakCount } from '@/lib/db/queries/sessions'
import { createServerClient } from '@/lib/db/supabase'
import { StreakMilestone } from '@/components/workout/StreakMilestone'
import { RecoveryHeatmap } from '@/components/charts/RecoveryHeatmap'
import { KiroDebrief } from '@/components/ai/KiroDebrief'
import { ShareCard } from '@/components/social/ShareCard'

export default async function WorkoutCompletePage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  // Get authenticated user
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load session
  const session = await getCompletedSessionSummary(sessionId)
  if (!session) {
    redirect('/dashboard')
  }

  // Get streak and recovery data
  const [streak, muscleRecovery] = await Promise.all([
    getStreakCount(user.id),
    getMuscleRecovery(user.id),
  ])

  // Determine if this is a milestone streak
  const milestones = [7, 14, 30, 50, 100, 365]
  const isMilestone = milestones.includes(streak)

  // Convert duration to minutes
  const durationMinutes = session.duration_seconds
    ? Math.round(session.duration_seconds / 60)
    : null

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[#0A0A0B] p-4 pb-20">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-[#F5F5F4]">Workout Complete!</h1>
        <p className="mt-1 text-sm text-[#A1A19E]">
          {new Date(session.completed_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Streak + Milestone Animation */}
      <StreakMilestone streak={streak} isMilestone={isMilestone} />

      {/* Muscle Recovery Heatmap */}
      <RecoveryHeatmap recoveryData={muscleRecovery} />

      {/* Kiro's AI Debrief */}
      <KiroDebrief sessionId={sessionId} />

      {/* Share Card */}
      <ShareCard
        sessionId={sessionId}
        durationMinutes={durationMinutes}
        totalSets={session.total_sets}
        totalVolumeKg={session.total_volume_kg}
        musclesWorked={session.muscles_worked}
        streakDays={streak}
      />

      {/* Continue to Dashboard */}
      <div className="mt-2 flex flex-col gap-2">
        <a
          href="/dashboard"
          className="w-full rounded-lg bg-[#111113] px-4 py-3 text-center font-medium text-[#F5F5F4] transition-opacity hover:opacity-80"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}
