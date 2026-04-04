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

  // Load program day and progression suggestions in parallel.
  // Progression suggestions are best-effort - a failure returns an empty object
  // so the rest of the page still renders normally.
  const [programDay, suggestions] = await Promise.all([
    session.program_day_id ? getProgramDay(session.program_day_id) : null,
    session.program_day_id && session.user_id
      ? getProgressionSuggestionsForDay(session.user_id, session.program_day_id)
      : Promise.resolve({}),
  ])

  return (
    <div className="min-h-screen bg-[#0A0A0B] px-4 py-6">
      <WorkoutLogger
        sessionId={session.id}
        programDayId={session.program_day_id}
        programId={session.program_id}
        programDay={programDay}
        suggestions={suggestions}
      />
    </div>
  )
}
