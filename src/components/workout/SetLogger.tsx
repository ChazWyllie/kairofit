'use client'

/**
 * SetLogger
 *
 * Per-exercise set logging controls. Renders the target sets/reps,
 * already-logged sets, and +/- controls for reps and weight.
 *
 * Offline-first flow per set:
 * 1. Generate a stable UUID (crypto.randomUUID) for dedup
 * 2. addOptimisticSet (isPending: true) - immediate UI update
 * 3. logSetOffline() - writes to IndexedDB, triggers background sync
 * 4. confirmSet (isPending: false) - saved locally, sync is background
 * 5. startRestTimer
 *
 * If the Dexie write fails (e.g. storage full), the optimistic set is removed.
 */

import { useState } from 'react'
import { logSetOffline } from '@/lib/offline/sync'
import { useWorkoutStore } from '@/stores/workout.store'
import type { ProgramExercise, OptimisticWorkoutSet } from '@/types'

interface SetLoggerProps {
  programExercise: ProgramExercise
  sessionId: string
  userId: string
}

export function SetLogger({ programExercise, sessionId, userId }: SetLoggerProps) {
  const [reps, setReps] = useState(programExercise.reps_max)
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [isLogging, setIsLogging] = useState(false)

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

  async function handleLogSet() {
    const setId = crypto.randomUUID()
    const now = new Date().toISOString()

    const set = {
      id: setId,
      session_id: sessionId,
      exercise_id: programExercise.exercise_id,
      program_exercise_id: programExercise.id,
      user_id: userId,
      set_number: nextSetNumber,
      reps_completed: reps,
      weight_kg: weightKg,
      rpe: null,
      is_warmup: false,
      is_dropset: false,
      logged_at: now,
    }

    addOptimisticSet(programExercise.exercise_id, set)
    setIsLogging(true)

    try {
      // Writes to IndexedDB and triggers background sync (or direct sync fallback)
      await logSetOffline(set)
      confirmSet(programExercise.exercise_id, setId, set)
      startRestTimer(programExercise.rest_seconds, programExercise.exercise.name)
    } catch {
      // IndexedDB write failed (storage full?) - remove the optimistic set
      removeSet(programExercise.exercise_id, setId)
    } finally {
      setIsLogging(false)
    }
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
            onClick={() => void handleLogSet()}
            disabled={isLogging}
            className="mt-1 w-full rounded-lg bg-[#6366F1] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLogging ? 'Logging...' : `Log Set ${nextSetNumber}`}
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
