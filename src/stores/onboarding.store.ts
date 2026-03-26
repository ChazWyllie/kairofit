/**
 * Onboarding Store (Zustand)
 *
 * Manages onboarding quiz state across all 22 screens.
 *
 * Key design decisions:
 * - auth_ready flag: screen 22 MUST await this before generating program
 *   (post-signup race condition fix - auth creation runs in background during screens 17-21)
 * - email is cleared after auth is established (PII cleanup - do not hold in memory past auth)
 * - total_steps is number not a literal (A/B test flexibility)
 */

import { create } from 'zustand'
import type {
  OnboardingState,
  FitnessGoal,
  ExperienceLevel,
  AgeRange,
  Gender,
  SessionDurationPreference,
  WorkSchedule,
  ActivityLevel,
  InjuryZone,
  Equipment,
  WorkoutTimePreference,
  SleepRange,
  KairoArchetype,
  Units,
} from '@/types'
import { TOTAL_STEPS } from '@/lib/onboarding/flow-config'

// ============================================================
// STORE ACTIONS
// ============================================================

interface OnboardingActions {
  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Phase 1 setters
  setGoal: (goal: FitnessGoal) => void
  setExperienceLevel: (level: ExperienceLevel) => void
  setTrainingRecency: (months: number | null) => void
  setAgeRange: (range: AgeRange) => void
  setGender: (gender: Gender) => void
  setDaysPerWeek: (days: number) => void
  setSessionDuration: (duration: SessionDurationPreference) => void

  // Phase 2 setters
  setObstacle: (obstacle: string) => void
  setWorkSchedule: (schedule: WorkSchedule) => void
  setActivityLevel: (level: ActivityLevel) => void
  setInjuries: (injuries: InjuryZone[]) => void
  setHeightCm: (height: number) => void
  setWeightKg: (weight: number) => void
  setBodyFatPct: (pct: number | null) => void
  setWhyNow: (reason: string) => void

  // Phase 3 setters
  setPsychScore: (index: 0 | 1 | 2 | 3, score: number) => void
  setArchetype: (archetype: KairoArchetype) => void

  // Email gate
  setEmail: (email: string) => void
  setAuthReady: (ready: boolean) => void
  clearEmailAfterAuth: () => void  // Call after auth session is confirmed

  // Phase 5 setters
  setEquipment: (equipment: Equipment[]) => void
  setSplitPreference: (split: string) => void
  setWorkoutTimePreference: (time: WorkoutTimePreference) => void
  setOtherTraining: (training: string[]) => void
  setSleepHoursRange: (range: SleepRange) => void
  setUnits: (units: Units) => void

  // Reset
  reset: () => void
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: OnboardingState = {
  current_step: 1,
  total_steps: TOTAL_STEPS,  // number, not a literal type

  goal: null,
  experience_level: null,
  training_recency_months: null,
  age_range: null,
  gender: null,
  days_per_week: null,
  session_duration_preference: null,

  obstacle: null,
  work_schedule: null,
  activity_level: null,
  injuries: [],
  height_cm: null,
  weight_kg: null,
  body_fat_pct: null,
  why_now: null,

  psych_scores: [3, 3, 3, 3],  // Default neutral
  archetype: null,

  email: null,
  auth_ready: false,

  equipment: [],
  split_preference: null,
  workout_time_preference: null,
  other_training: [],
  sleep_hours_range: null,

  units: 'metric',
}

// ============================================================
// STORE
// ============================================================

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set) => ({
  ...initialState,

  nextStep: () => set((state) => ({
    current_step: Math.min(state.current_step + 1, state.total_steps),
  })),

  prevStep: () => set((state) => ({
    current_step: Math.max(state.current_step - 1, 1),
  })),

  goToStep: (step) => set({ current_step: step }),

  // Phase 1
  setGoal: (goal) => set({ goal }),
  setExperienceLevel: (experience_level) => set({ experience_level }),
  setTrainingRecency: (training_recency_months) => set({ training_recency_months }),
  setAgeRange: (age_range) => set({ age_range }),
  setGender: (gender) => set({ gender }),
  setDaysPerWeek: (days_per_week) => set({ days_per_week }),
  setSessionDuration: (session_duration_preference) => set({ session_duration_preference }),

  // Phase 2
  setObstacle: (obstacle) => set({ obstacle }),
  setWorkSchedule: (work_schedule) => set({ work_schedule }),
  setActivityLevel: (activity_level) => set({ activity_level }),
  setInjuries: (injuries) => set({ injuries }),
  setHeightCm: (height_cm) => set({ height_cm }),
  setWeightKg: (weight_kg) => set({ weight_kg }),
  setBodyFatPct: (body_fat_pct) => set({ body_fat_pct }),
  setWhyNow: (why_now) => set({ why_now }),

  // Phase 3
  setPsychScore: (index, score) => set((state) => {
    const scores = [...state.psych_scores] as [number, number, number, number]
    scores[index] = score
    return { psych_scores: scores }
  }),
  setArchetype: (archetype) => set({ archetype }),

  // Email gate
  setEmail: (email) => set({ email }),
  setAuthReady: (auth_ready) => set({ auth_ready }),
  // Clear email from memory once auth is confirmed
  // Do not hold PII in client state longer than needed
  clearEmailAfterAuth: () => set({ email: null }),

  // Phase 5
  setEquipment: (equipment) => set({ equipment }),
  setSplitPreference: (split_preference) => set({ split_preference }),
  setWorkoutTimePreference: (workout_time_preference) => set({ workout_time_preference }),
  setOtherTraining: (other_training) => set({ other_training }),
  setSleepHoursRange: (sleep_hours_range) => set({ sleep_hours_range }),
  setUnits: (units) => set({ units }),

  reset: () => set(initialState),
}))
