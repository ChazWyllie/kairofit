/**
 * Active Workout Store (Zustand)
 *
 * Client-side state for the active workout logger.
 * All set logging goes through this store first (optimistic UI),
 * then syncs to IndexedDB offline store, then to Supabase.
 */

import { create } from 'zustand'
import type { ActiveWorkoutState, WorkoutSet, OptimisticWorkoutSet } from '@/types'

interface WorkoutActions {
  startWorkout: (sessionId: string, programDayId: string | null, programId: string | null) => void
  endWorkout: () => void
  addOptimisticSet: (exerciseId: string, set: WorkoutSet) => void  // wraps in OptimisticWorkoutSet with isPending:true
  confirmSet: (exerciseId: string, tempId: string, confirmedSet: WorkoutSet) => void
  removeSet: (exerciseId: string, setId: string) => void
  setCurrentExercise: (index: number) => void
  startRestTimer: (totalSeconds: number, exerciseName: string) => void
  tickRestTimer: () => void
  stopRestTimer: () => void
}

const initialState: ActiveWorkoutState = {
  session_id: null,
  program_day_id: null,
  is_active: false,
  started_at: null,
  current_exercise_index: 0,
  logged_sets: {},
  rest_timer: {
    is_running: false,
    seconds_remaining: 0,
    total_seconds: 0,
    exercise_name: null,
  },
}

export const useWorkoutStore = create<ActiveWorkoutState & WorkoutActions>((set) => ({
  ...initialState,

  startWorkout: (sessionId, programDayId, _programId) => set({
    session_id: sessionId,
    program_day_id: programDayId,
    is_active: true,
    started_at: new Date().toISOString(),
    current_exercise_index: 0,
    logged_sets: {},
  }),

  endWorkout: () => set(initialState),

  // Add set with isPending=true for optimistic UI
  addOptimisticSet: (exerciseId, set_) => set((state) => ({
    logged_sets: {
      ...state.logged_sets,
      [exerciseId]: [...(state.logged_sets[exerciseId] || []), { ...set_, isPending: true } as OptimisticWorkoutSet],
    },
  })),

  // Replace optimistic set with confirmed server response
  confirmSet: (exerciseId, tempId, confirmedSet) => set((state) => ({
    logged_sets: {
      ...state.logged_sets,
      // Confirmed set from server has no isPending - cast back to OptimisticWorkoutSet
      [exerciseId]: (state.logged_sets[exerciseId] || []).map((s) =>
        s.id === tempId ? { ...confirmedSet, isPending: false } as OptimisticWorkoutSet : s
      ),
    },
  })),

  removeSet: (exerciseId, setId) => set((state) => ({
    logged_sets: {
      ...state.logged_sets,
      [exerciseId]: (state.logged_sets[exerciseId] || []).filter((s) => s.id !== setId),
    },
  })),

  setCurrentExercise: (index) => set({ current_exercise_index: index }),

  startRestTimer: (totalSeconds, exerciseName) => set({
    rest_timer: {
      is_running: true,
      seconds_remaining: totalSeconds,
      total_seconds: totalSeconds,
      exercise_name: exerciseName,
    },
  }),

  tickRestTimer: () => set((state) => {
    const remaining = state.rest_timer.seconds_remaining - 1
    if (remaining <= 0) {
      // Haptic feedback when timer completes
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])  // Double pulse at timer end
      }
      return {
        rest_timer: { ...state.rest_timer, is_running: false, seconds_remaining: 0 },
      }
    }
    return {
      rest_timer: { ...state.rest_timer, seconds_remaining: remaining },
    }
  }),

  stopRestTimer: () => set((state) => ({
    rest_timer: { ...state.rest_timer, is_running: false },
  })),
}))
