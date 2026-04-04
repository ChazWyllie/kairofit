/**
 * Workout Session Page
 *
 * Server Component: loads session + program day data, then passes to
 * the WorkoutLogger client container for interactive set logging.
 */

import { notFound } from 'next/navigation'
import { getWorkoutSession } from '@/lib/db/queries/sessions'
import { getProgramDay } from '@/lib/db/queries/sessions'
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

  // Load the program day so WorkoutLogger can render exercises
  const programDay = session.program_day_id
    ? await getProgramDay(session.program_day_id)
    : null

  return (
    <div className="min-h-screen bg-[#0A0A0B] px-4 py-6">
      <WorkoutLogger
        sessionId={session.id}
        programDayId={session.program_day_id}
        programId={session.program_id}
        programDay={programDay}
      />
    </div>
  )
}
