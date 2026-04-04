'use client'

/**
 * WorkoutLogger
 *
 * Client container for the active workout session.
 * Initializes the workout store on mount, renders exercises,
 * shows the RestTimer overlay, and handles session completion.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { completeSessionAction } from '@/actions/workout.actions'
import { useWorkoutStore } from '@/stores/workout.store'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { RestTimer } from '@/components/workout/RestTimer'
import type { ProgramDay } from '@/types'

interface WorkoutLoggerProps {
  sessionId: string
  programDayId: string | null
  programId: string | null
  programDay: ProgramDay | null
}

export function WorkoutLogger({
  sessionId,
  programDayId,
  programId,
  programDay,
}: WorkoutLoggerProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const { startWorkout, endWorkout, is_active } = useWorkoutStore((s) => ({
    startWorkout: s.startWorkout,
    endWorkout: s.endWorkout,
    is_active: s.is_active,
  }))

  // Initialize store if we're arriving fresh (e.g. page refresh)
  useEffect(() => {
    if (!is_active) {
      startWorkout(sessionId, programDayId, programId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { execute: complete, isPending: isCompleting } = useAction(completeSessionAction, {
    onSuccess: () => {
      endWorkout()
      router.push(`/workout/${sessionId}/complete`)
    },
  })

  const exercises = programDay?.exercises ?? []

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Day header */}
      {programDay && (
        <div className="rounded-xl bg-[#111113] p-4">
          <h2 className="font-semibold text-[#F5F5F4]">{programDay.name}</h2>
          {programDay.focus_muscles.length > 0 && (
            <p className="mt-0.5 text-xs text-[#6B6B68]">{programDay.focus_muscles.join(', ')}</p>
          )}
        </div>
      )}

      {/* Exercise list */}
      {exercises.length === 0 ? (
        <p className="text-center text-sm text-[#6B6B68]">No exercises loaded for this session.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {exercises.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => setActiveIndex(i)}
              className="w-full text-left"
              type="button"
            >
              <ExerciseCard
                programExercise={ex}
                sessionId={sessionId}
                isActive={i === activeIndex}
              />
            </button>
          ))}
        </div>
      )}

      {/* Rest timer overlay */}
      <RestTimer />

      {/* Complete workout - sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1A1A1F] bg-[#0A0A0B] p-4">
        <button
          onClick={() => complete({ session_id: sessionId })}
          disabled={isCompleting}
          className="w-full rounded-lg bg-[#10B981] py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isCompleting ? 'Finishing...' : 'Complete Workout'}
        </button>
      </div>
    </div>
  )
}
