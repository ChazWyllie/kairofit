/**
 * Workout Store Tests
 *
 * Tests for the Zustand active workout store state transitions:
 * - startWorkout / endWorkout lifecycle
 * - addOptimisticSet / confirmSet / removeSet optimistic UI pattern
 * - rest timer: startRestTimer / tickRestTimer / stopRestTimer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWorkoutStore } from '../workout.store'

// Reset store between tests
function resetStore() {
  useWorkoutStore.setState({
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
  })
}

const SESSION_ID = 'session-abc'
const PROGRAM_DAY_ID = 'day-abc'
const PROGRAM_ID = 'program-abc'
const EXERCISE_ID = 'exercise-abc'

function makeSet(overrides: Partial<{
  id: string
  session_id: string
  exercise_id: string
  program_exercise_id: string | null
  user_id: string
  set_number: number
  reps_completed: number
  weight_kg: number | null
  rpe: number | null
  is_warmup: boolean
  is_dropset: boolean
  logged_at: string
}> = {}) {
  return {
    id: 'set-temp-1',
    session_id: SESSION_ID,
    exercise_id: EXERCISE_ID,
    program_exercise_id: null,
    user_id: 'user-1',
    set_number: 1,
    reps_completed: 10,
    weight_kg: 80,
    rpe: null,
    is_warmup: false,
    is_dropset: false,
    logged_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('workout store', () => {
  beforeEach(resetStore)

  // -------------------------------------------------------------------------
  // startWorkout / endWorkout
  // -------------------------------------------------------------------------

  describe('startWorkout', () => {
    it('sets is_active to true with session and day IDs', () => {
      useWorkoutStore.getState().startWorkout(SESSION_ID, PROGRAM_DAY_ID, PROGRAM_ID)
      const state = useWorkoutStore.getState()

      expect(state.is_active).toBe(true)
      expect(state.session_id).toBe(SESSION_ID)
      expect(state.program_day_id).toBe(PROGRAM_DAY_ID)
    })

    it('sets started_at to a recent ISO timestamp', () => {
      const before = Date.now()
      useWorkoutStore.getState().startWorkout(SESSION_ID, PROGRAM_DAY_ID, PROGRAM_ID)
      const after = Date.now()

      const startedAt = useWorkoutStore.getState().started_at
      expect(startedAt).not.toBeNull()
      const ts = new Date(startedAt!).getTime()
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })

    it('resets current_exercise_index to 0', () => {
      useWorkoutStore.setState({ current_exercise_index: 3 })
      useWorkoutStore.getState().startWorkout(SESSION_ID, PROGRAM_DAY_ID, PROGRAM_ID)

      expect(useWorkoutStore.getState().current_exercise_index).toBe(0)
    })

    it('resets logged_sets to empty object', () => {
      const set = makeSet()
      useWorkoutStore.setState({ logged_sets: { [EXERCISE_ID]: [{ ...set, isPending: false }] } })
      useWorkoutStore.getState().startWorkout(SESSION_ID, PROGRAM_DAY_ID, PROGRAM_ID)

      expect(useWorkoutStore.getState().logged_sets).toEqual({})
    })

    it('works with null programDayId (freeform workout)', () => {
      useWorkoutStore.getState().startWorkout(SESSION_ID, null, null)

      expect(useWorkoutStore.getState().is_active).toBe(true)
      expect(useWorkoutStore.getState().program_day_id).toBeNull()
    })
  })

  describe('endWorkout', () => {
    it('resets all state to initial values', () => {
      useWorkoutStore.getState().startWorkout(SESSION_ID, PROGRAM_DAY_ID, PROGRAM_ID)
      useWorkoutStore.getState().endWorkout()

      const state = useWorkoutStore.getState()
      expect(state.is_active).toBe(false)
      expect(state.session_id).toBeNull()
      expect(state.logged_sets).toEqual({})
    })
  })

  // -------------------------------------------------------------------------
  // Optimistic set management
  // -------------------------------------------------------------------------

  describe('addOptimisticSet', () => {
    it('adds a set with isPending: true', () => {
      const set = makeSet()
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, set)

      const sets = useWorkoutStore.getState().logged_sets[EXERCISE_ID]
      expect(sets).toHaveLength(1)
      expect(sets![0]!.isPending).toBe(true)
      expect(sets![0]!.reps_completed).toBe(10)
    })

    it('appends multiple sets for the same exercise', () => {
      const set1 = makeSet({ id: 'set-1', set_number: 1 })
      const set2 = makeSet({ id: 'set-2', set_number: 2, reps_completed: 8 })

      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, set1)
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, set2)

      expect(useWorkoutStore.getState().logged_sets[EXERCISE_ID]).toHaveLength(2)
    })

    it('initializes a new key for each exercise', () => {
      const EXERCISE_2 = 'exercise-xyz'
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, makeSet())
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_2, makeSet({ exercise_id: EXERCISE_2 }))

      expect(Object.keys(useWorkoutStore.getState().logged_sets)).toHaveLength(2)
    })
  })

  describe('confirmSet', () => {
    it('replaces optimistic set with confirmed set and sets isPending: false', () => {
      const tempSet = makeSet({ id: 'temp-id' })
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, tempSet)

      const confirmedSet = makeSet({ id: 'server-id', reps_completed: 10 })
      useWorkoutStore.getState().confirmSet(EXERCISE_ID, 'temp-id', confirmedSet)

      const sets = useWorkoutStore.getState().logged_sets[EXERCISE_ID]!
      expect(sets).toHaveLength(1)
      expect(sets[0]!.id).toBe('server-id')
      expect(sets[0]!.isPending).toBe(false)
    })

    it('does not affect other sets when confirming one', () => {
      const set1 = makeSet({ id: 'temp-1', set_number: 1 })
      const set2 = makeSet({ id: 'temp-2', set_number: 2 })
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, set1)
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, set2)

      const confirmed1 = makeSet({ id: 'server-1', set_number: 1 })
      useWorkoutStore.getState().confirmSet(EXERCISE_ID, 'temp-1', confirmed1)

      const sets = useWorkoutStore.getState().logged_sets[EXERCISE_ID]!
      expect(sets[0]!.id).toBe('server-1')
      expect(sets[1]!.id).toBe('temp-2')
      expect(sets[1]!.isPending).toBe(true)
    })
  })

  describe('removeSet', () => {
    it('removes a set by ID', () => {
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, makeSet({ id: 'set-to-remove' }))
      useWorkoutStore.getState().removeSet(EXERCISE_ID, 'set-to-remove')

      expect(useWorkoutStore.getState().logged_sets[EXERCISE_ID]).toHaveLength(0)
    })

    it('only removes the specified set', () => {
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, makeSet({ id: 'set-1' }))
      useWorkoutStore.getState().addOptimisticSet(EXERCISE_ID, makeSet({ id: 'set-2' }))
      useWorkoutStore.getState().removeSet(EXERCISE_ID, 'set-1')

      const sets = useWorkoutStore.getState().logged_sets[EXERCISE_ID]!
      expect(sets).toHaveLength(1)
      expect(sets[0]!.id).toBe('set-2')
    })
  })

  // -------------------------------------------------------------------------
  // Rest timer
  // -------------------------------------------------------------------------

  describe('startRestTimer', () => {
    it('sets is_running: true with total and remaining seconds', () => {
      useWorkoutStore.getState().startRestTimer(90, 'Bench Press')

      const timer = useWorkoutStore.getState().rest_timer
      expect(timer.is_running).toBe(true)
      expect(timer.total_seconds).toBe(90)
      expect(timer.seconds_remaining).toBe(90)
      expect(timer.exercise_name).toBe('Bench Press')
    })
  })

  describe('tickRestTimer', () => {
    it('decrements seconds_remaining by 1', () => {
      useWorkoutStore.getState().startRestTimer(60, 'Squat')
      useWorkoutStore.getState().tickRestTimer()

      expect(useWorkoutStore.getState().rest_timer.seconds_remaining).toBe(59)
    })

    it('stops timer and sets seconds_remaining to 0 when reaching zero', () => {
      useWorkoutStore.setState({
        rest_timer: {
          is_running: true,
          seconds_remaining: 1,
          total_seconds: 60,
          exercise_name: 'Squat',
        },
      })

      useWorkoutStore.getState().tickRestTimer()

      const timer = useWorkoutStore.getState().rest_timer
      expect(timer.is_running).toBe(false)
      expect(timer.seconds_remaining).toBe(0)
    })

    it('triggers navigator.vibrate when timer completes', () => {
      const vibrateMock = vi.fn()
      Object.defineProperty(window, 'vibrate', { value: vibrateMock, writable: true })
      Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, writable: true })

      useWorkoutStore.setState({
        rest_timer: {
          is_running: true,
          seconds_remaining: 1,
          total_seconds: 60,
          exercise_name: 'Bench Press',
        },
      })

      useWorkoutStore.getState().tickRestTimer()

      expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100])
    })
  })

  describe('stopRestTimer', () => {
    it('sets is_running: false without resetting remaining time', () => {
      useWorkoutStore.getState().startRestTimer(90, 'Bench Press')
      useWorkoutStore.getState().tickRestTimer()
      useWorkoutStore.getState().stopRestTimer()

      const timer = useWorkoutStore.getState().rest_timer
      expect(timer.is_running).toBe(false)
      expect(timer.seconds_remaining).toBe(89) // still has remaining time
    })
  })

  describe('setCurrentExercise', () => {
    it('updates the current exercise index', () => {
      useWorkoutStore.getState().setCurrentExercise(2)
      expect(useWorkoutStore.getState().current_exercise_index).toBe(2)
    })
  })
})
