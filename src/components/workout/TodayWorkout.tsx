/**
 * TodayWorkout Component
 *
 * Displays the next workout day with exercises, or status message if week is complete.
 * Pure display component - no data fetching.
 */

import type { ProgramDay } from '@/types'
import { StartWorkoutButton } from './StartWorkoutButton'

interface TodayWorkoutProps {
  day: ProgramDay | null
  weeksComplete: boolean
}

export function TodayWorkout({ day, weeksComplete }: TodayWorkoutProps) {
  if (day) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#F5F5F4]">{day.name}</h3>
          {day.focus_muscles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {day.focus_muscles.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded-full bg-[#1A1A1F] px-2.5 py-1 text-xs text-[#A1A19E]"
                >
                  {muscle}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {day.exercises.map((exercise) => (
            <div key={exercise.id} className="rounded-lg border border-[#1A1A1F] bg-[#0A0A0B] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#F5F5F4]">{exercise.exercise.name}</p>
                  <p className="mt-1 text-sm text-[#A1A19E]">
                    {exercise.sets} x {exercise.reps_min}-{exercise.reps_max}
                  </p>
                  <p className="text-xs text-[#6B6B68]">{exercise.rest_seconds}s rest</p>
                </div>
              </div>
              {exercise.rationale && (
                <p className="mt-2 text-sm text-[#A1A19E]">{exercise.rationale}</p>
              )}
            </div>
          ))}
        </div>

        <StartWorkoutButton programDayId={day.id} programId={day.program_id} />
      </div>
    )
  }

  if (weeksComplete) {
    return (
      <div className="rounded-lg border border-[#1A1A1F] bg-[#111113] p-6 text-center">
        <p className="text-lg font-semibold text-[#F5F5F4]">All sessions this week are done.</p>
        <p className="mt-2 text-sm text-[#A1A19E]">Your next week starts on Monday.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#1A1A1F] bg-[#111113] p-6 text-center">
      <p className="text-sm text-[#6B6B68]">No workout scheduled.</p>
    </div>
  )
}
