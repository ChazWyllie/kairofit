'use client'

/**
 * StartWorkoutButton
 *
 * Calls startSessionAction, initializes the workout store, then navigates
 * to the active workout logger at /workout/[sessionId].
 *
 * Replaces the disabled placeholder button in TodayWorkout.tsx.
 */

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { startSessionAction } from '@/actions/workout.actions'
import { useWorkoutStore } from '@/stores/workout.store'

interface StartWorkoutButtonProps {
  programDayId: string | null
  programId: string | null
}

export function StartWorkoutButton({ programDayId, programId }: StartWorkoutButtonProps) {
  const router = useRouter()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)

  const { execute, isPending } = useAction(startSessionAction, {
    onSuccess: ({ data }) => {
      if (!data) return
      startWorkout(data.id, programDayId, programId)
      router.push(`/workout/${data.id}`)
    },
  })

  function handleClick() {
    execute({
      program_day_id: programDayId ?? undefined,
      program_id: programId ?? undefined,
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? 'Starting...' : 'Start Workout'}
    </button>
  )
}
