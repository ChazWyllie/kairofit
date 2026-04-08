/**
 * Workout Session Page
 *
 * Server Component: loads session + program day data, then passes to
 * the WorkoutLogger client container for interactive set logging.
 */

import { notFound } from 'next/navigation'
import { getWorkoutSession } from '@/lib/db/queries/sessions'
import { getProgramDay } from '@/lib/db/queries/sessions'
import { getProgressionSuggestionsForDay } from '@/lib/db/queries/progression'
import { WorkoutLogger } from './WorkoutLogger'

interface WorkoutPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { sessionId } = await params

  const session = await getWorkoutSession(sessionId)

  if (!session) {
    notFound()
  }

  // Load program day first - suggestions reuse it to avoid a second DB round-trip.
  const programDay = session.program_day_id ? await getProgramDay(session.program_day_id) : null

  // Progression suggestions are best-effort - failure returns an empty object.
  const suggestions =
    programDay && session.user_id
      ? await getProgressionSuggestionsForDay(session.user_id, programDay)
      : {}

  return (
    <div className="min-h-screen bg-[#0A0A0B] px-4 py-6">
      <WorkoutLogger
        sessionId={session.id}
        userId={session.user_id}
        programDayId={session.program_day_id}
        programId={session.program_id}
        programDay={programDay}
        suggestions={suggestions}
      />
    </div>
  )
}
