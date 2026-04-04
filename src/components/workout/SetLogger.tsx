'use client'

/**
 * SetLogger
 *
 * Per-exercise set logging controls. Renders the target sets/reps,
 * already-logged sets, and +/- controls for reps and weight.
 *
 * Flow per set:
 * 1. addOptimisticSet (isPending: true) - immediate UI update
 * 2. logSetAction server call
 * 3. confirmSet (isPending: false) on success, removeSet on error
 * 4. startRestTimer after successful log
 */

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { logSetAction } from '@/actions/workout.actions'
import { useWorkoutStore } from '@/stores/workout.store'
import type { ProgramExercise, OptimisticWorkoutSet } from '@/types'

interface SetLoggerProps {
  programExercise: ProgramExercise
  sessionId: string
}

export function SetLogger({ programExercise, sessionId }: SetLoggerProps) {
  const [reps, setReps] = useState(programExercise.reps_max)
  const [weightKg, setWeightKg] = useState<number | null>(null)

  const { addOptimisticSet, confirmSet, removeSet, startRestTimer, logged_sets } = useWorkoutStore(
    (s) => ({
      addOptimisticSet: s.addOptimisticSet,
      confirmSet: s.confirmSet,
      removeSet: s.removeSet,
      startRestTimer: s.startRestTimer,
      logged_sets: s.logged_sets,
    })
  )

  const exerciseSets: OptimisticWorkoutSet[] =
    (logged_sets[programExercise.exercise_id] as OptimisticWorkoutSet[]) ?? []
  const nextSetNumber = exerciseSets.length + 1

  const { execute, isPending } = useAction(logSetAction, {
    onSuccess: ({ data }) => {
      if (!data) return
      confirmSet(programExercise.exercise_id, `temp-${nextSetNumber - 1}`, {
        id: data.id,
        session_id: sessionId,
        exercise_id: programExercise.exercise_id,
        program_exercise_id: programExercise.id,
        user_id: '',
        set_number: data.set_number,
        reps_completed: data.reps_completed,
        weight_kg: data.weight_kg ?? null,
        rpe: data.rpe ?? null,
        is_warmup: false,
        is_dropset: false,
        logged_at: data.logged_at ?? new Date().toISOString(),
      })
      startRestTimer(programExercise.rest_seconds, programExercise.exercise.name)
    },
    onError: () => {
      removeSet(programExercise.exercise_id, `temp-${nextSetNumber - 1}`)
    },
  })

  function handleLogSet() {
    const tempId = `temp-${nextSetNumber}`
    const tempSet = {
      id: tempId,
      session_id: sessionId,
      exercise_id: programExercise.exercise_id,
      program_exercise_id: programExercise.id,
      user_id: '',
      set_number: nextSetNumber,
      reps_completed: reps,
      weight_kg: weightKg,
      rpe: null,
      is_warmup: false,
      is_dropset: false,
      logged_at: new Date().toISOString(),
    }

    addOptimisticSet(programExercise.exercise_id, tempSet)

    execute({
      session_id: sessionId,
      exercise_id: programExercise.exercise_id,
      program_exercise_id: programExercise.id,
      set_number: nextSetNumber,
      reps_completed: reps,
      weight_kg: weightKg ?? undefined,
      is_warmup: false,
      is_dropset: false,
    })
  }

  const allSetsLogged = exerciseSets.length >= programExercise.sets

  return (
    <div className="flex flex-col gap-4">
      {/* Logged sets */}
      {exerciseSets.length > 0 && (
        <div className="flex flex-col gap-1">
          {exerciseSets.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                s.isPending ? 'bg-[#1A1A1F] opacity-60' : 'bg-[#111113]'
              }`}
            >
              <span className="text-[#A1A19E]">Set {i + 1}</span>
              <span className="text-[#F5F5F4]">
                {s.reps_completed} reps
                {s.weight_kg ? ` @ ${s.weight_kg}kg` : ''}
              </span>
              {s.isPending && <span className="text-xs text-[#6B6B68]">saving...</span>}
            </div>
          ))}
        </div>
      )}

      {/* Controls - hidden when all sets logged */}
      {!allSetsLogged && (
        <div className="flex flex-col gap-3 rounded-xl bg-[#111113] p-4">
          <p className="text-xs text-[#6B6B68]">
            Set {nextSetNumber} of {programExercise.sets} - target {programExercise.reps_min}-
            {programExercise.reps_max} reps
          </p>

          {/* Weight control */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-sm text-[#A1A19E]">Weight</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeightKg((w) => Math.max(0, (w ?? 0) - 2.5))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1F] text-[#F5F5F4] hover:bg-[#6366F1]/20"
              >
                -
              </button>
              <span className="w-14 text-center font-mono text-[#F5F5F4]">
                {weightKg !== null ? `${weightKg}kg` : 'BW'}
              </span>
              <button
                onClick={() => setWeightKg((w) => (w ?? 0) + 2.5)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1F] text-[#F5F5F4] hover:bg-[#6366F1]/20"
              >
                +
              </button>
            </div>
          </div>

          {/* Reps control */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-sm text-[#A1A19E]">Reps</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReps((r) => Math.max(0, r - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1F] text-[#F5F5F4] hover:bg-[#6366F1]/20"
              >
                -
              </button>
              <span className="w-14 text-center font-mono text-[#F5F5F4]">{reps}</span>
              <button
                onClick={() => setReps((r) => r + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1F] text-[#F5F5F4] hover:bg-[#6366F1]/20"
              >
                +
              </button>
            </div>
          </div>

          {/* Log button */}
          <button
            onClick={handleLogSet}
            disabled={isPending}
            className="mt-1 w-full rounded-lg bg-[#6366F1] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Logging...' : `Log Set ${nextSetNumber}`}
          </button>
        </div>
      )}

      {allSetsLogged && (
        <p className="text-center text-sm text-[#10B981]">
          All {programExercise.sets} sets complete
        </p>
      )}
    </div>
  )
}
