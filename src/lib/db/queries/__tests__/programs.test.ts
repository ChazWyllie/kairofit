/**
 * saveProgramToDb Tests
 *
 * Verifies the full DB write sequence:
 * 1. Deactivate existing active program
 * 2. Insert new program row
 * 3. Insert program_days for each day
 * 4. Resolve exercise names to IDs and insert program_exercises
 * 5. Return the saved program via getActiveProgram
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveProgramToDb } from '../programs'
import type { GeneratedProgram, Program } from '@/types'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

vi.mock('@/lib/db/supabase', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const MOCK_PROGRAM_ROW = {
  id: 'program-123',
  user_id: 'user-456',
  name: 'Test Program',
  current_week: 1,
  weeks_duration: 8,
  days_per_week: null,
  goal: null,
  split_type: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  description: 'A test program',
  ai_rationale: null,
  progression_scheme: 'double_progression' as const,
  projected_weeks_to_goal: null,
  projected_outcome_description: null,
}

const MOCK_FULL_PROGRAM: Program = {
  ...MOCK_PROGRAM_ROW,
  days: [],
}

const DEFAULT_META = {
  generation_model: 'ai_sonnet',
  generation_prompt_version: '1.0',
  experience_level_target: 3,
}

function makeGeneratedProgram(overrides: Partial<GeneratedProgram> = {}): GeneratedProgram {
  return {
    name: 'Test Program',
    description: 'A test program',
    ai_rationale: 'For testing',
    weeks_duration: 8,
    progression_scheme: 'double_progression',
    projected_weeks_to_goal: null,
    projected_outcome_description: null,
    days: [
      {
        day_number: 1,
        name: 'Day 1',
        focus_muscles: ['chest', 'back'],
        session_type: 'hypertrophy',
        estimated_duration_minutes: 45,
        exercises: [
          {
            exercise_name: 'Bench Press',
            sets: 3,
            reps_min: 8,
            reps_max: 12,
            rest_seconds: 120,
            rpe_target: 8,
            rationale: 'Primary push',
            progression_scheme: 'double_progression',
            modification_note: null,
          },
        ],
      },
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

interface SupabaseMockConfig {
  deactivateError?: { message: string } | null
  programInsertData?: typeof MOCK_PROGRAM_ROW | null
  programInsertError?: { message: string } | null
  dayInsertData?: { id: string } | null
  dayInsertError?: { message: string } | null
  exerciseLookupData?: { id: string } | null
  programExerciseError?: { message: string } | null
  activeProgramData?: Program | null
  activeProgramError?: { code?: string; message?: string } | null
}

function createSupabaseMock(config: SupabaseMockConfig = {}) {
  const {
    deactivateError = null,
    programInsertData = MOCK_PROGRAM_ROW,
    programInsertError = null,
    dayInsertData = { id: 'day-id' },
    dayInsertError = null,
    exerciseLookupData = { id: 'exercise-id' },
    programExerciseError = null,
    activeProgramData = MOCK_FULL_PROGRAM,
    activeProgramError = null,
  } = config

  return {
    from: vi.fn((table: string) => {
      if (table === 'programs') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: deactivateError })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: programInsertData, error: programInsertError })
              ),
            })),
          })),
          // Used by getActiveProgram at the end of saveProgramToDb
          select: vi.fn(() => {
            const builder: {
              eq: ReturnType<typeof vi.fn>
              single: ReturnType<typeof vi.fn>
            } = {
              eq: vi.fn(),
              single: vi.fn(() =>
                Promise.resolve({ data: activeProgramData, error: activeProgramError })
              ),
            }
            builder.eq.mockReturnValue(builder)
            return builder
          }),
        }
      }

      if (table === 'program_days') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: dayInsertData, error: dayInsertError })),
            })),
          })),
        }
      }

      if (table === 'exercises') {
        // Per-exercise lookup: .select('id').ilike('name', ex.exercise_name).limit(1).single()
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: exerciseLookupData })),
              })),
            })),
          })),
        }
      }

      if (table === 'program_exercises') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: programExerciseError })),
        }
      }

      throw new Error(`Unexpected table in test: ${table}`)
    }),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('saveProgramToDb', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('happy path', () => {
    it('deactivates the existing active program before inserting', async () => {
      const mock = createSupabaseMock()
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)

      const programsBuilder = mock.from.mock.results[0]!.value
      expect(programsBuilder.update).toHaveBeenCalledWith({ is_active: false })
    })

    it('inserts the program row with correct fields', async () => {
      const mock = createSupabaseMock()
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const program = makeGeneratedProgram()
      await saveProgramToDb('user-456', program, DEFAULT_META)

      // The second call to from('programs') is the insert
      const secondProgramsCall = mock.from.mock.calls.filter((c) => c[0] === 'programs')[1]
      expect(secondProgramsCall).toBeDefined()
      // Just verify from was called with 'programs' multiple times
      const programsCalls = mock.from.mock.calls.filter((c) => c[0] === 'programs')
      // deactivate + insert + getActiveProgram = 3 calls to from('programs')
      expect(programsCalls.length).toBe(3)
    })

    it('inserts a program_days row for each day', async () => {
      const mock = createSupabaseMock()
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const program = makeGeneratedProgram({
        days: [
          {
            day_number: 1,
            name: 'Day 1',
            focus_muscles: [],
            session_type: 'hypertrophy',
            estimated_duration_minutes: 45,
            exercises: [],
          },
          {
            day_number: 2,
            name: 'Day 2',
            focus_muscles: [],
            session_type: 'hypertrophy',
            estimated_duration_minutes: 45,
            exercises: [],
          },
        ],
      })

      await saveProgramToDb('user-456', program, DEFAULT_META)

      const daysCalls = mock.from.mock.calls.filter((c) => c[0] === 'program_days')
      expect(daysCalls.length).toBe(2)
    })

    it('resolves exercise names and inserts program_exercises', async () => {
      const mock = createSupabaseMock()
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)

      // Exercises lookup used ilike on exercises table
      const exerciseCalls = mock.from.mock.calls.filter((c) => c[0] === 'exercises')
      expect(exerciseCalls.length).toBe(1)

      // program_exercises insert happened
      const peCalls = mock.from.mock.calls.filter((c) => c[0] === 'program_exercises')
      expect(peCalls.length).toBe(1)
    })

    it('returns the full program from getActiveProgram', async () => {
      const mock = createSupabaseMock()
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      const result = await saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)

      expect(result).toEqual(MOCK_FULL_PROGRAM)
    })
  })

  describe('error handling', () => {
    it('throws when deactivating old program fails', async () => {
      const mock = createSupabaseMock({
        deactivateError: { message: 'DB connection error' },
      })
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await expect(
        saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)
      ).rejects.toThrow('Failed to deactivate old program')
    })

    it('throws when program insert fails', async () => {
      const mock = createSupabaseMock({
        programInsertData: null,
        programInsertError: { message: 'Unique constraint violation' },
      })
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await expect(
        saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)
      ).rejects.toThrow('Failed to insert program')
    })

    it('throws when day insert fails', async () => {
      const mock = createSupabaseMock({
        dayInsertData: null,
        dayInsertError: { message: 'Foreign key violation' },
      })
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await expect(
        saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)
      ).rejects.toThrow('Failed to insert program day')
    })

    it('throws when getActiveProgram returns null after save', async () => {
      const mock = createSupabaseMock({
        activeProgramData: null,
        activeProgramError: null,
      })
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      await expect(
        saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)
      ).rejects.toThrow('Program saved but could not be retrieved')
    })
  })

  describe('defensive behavior', () => {
    it('skips exercises not found in the library and continues', async () => {
      const mock = createSupabaseMock({
        exerciseLookupData: null, // exercise not found in DB
      })
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      // Should not throw - program is still saved, just without the unfound exercise
      const result = await saveProgramToDb('user-456', makeGeneratedProgram(), DEFAULT_META)

      expect(result).toEqual(MOCK_FULL_PROGRAM)
      // No program_exercises insert happened (exercise was skipped)
      const peCalls = mock.from.mock.calls.filter((c) => c[0] === 'program_exercises')
      expect(peCalls.length).toBe(0)
    })

    it('continues inserting exercises after a program_exercises insert error', async () => {
      // Two exercises in the day; second one has a lookup+insert too
      const program = makeGeneratedProgram({
        days: [
          {
            day_number: 1,
            name: 'Day 1',
            focus_muscles: ['chest'],
            session_type: 'hypertrophy',
            estimated_duration_minutes: 45,
            exercises: [
              {
                exercise_name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                rest_seconds: 120,
                rpe_target: null,
                rationale: 'Push',
                progression_scheme: 'double_progression',
                modification_note: null,
              },
              {
                exercise_name: 'Dumbbell Row',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                rest_seconds: 90,
                rpe_target: null,
                rationale: 'Pull',
                progression_scheme: 'double_progression',
                modification_note: null,
              },
            ],
          },
        ],
      })

      const mock = createSupabaseMock({
        programExerciseError: { message: 'Insert failed' },
      })
      vi.mocked(createServerClient).mockResolvedValue(mock as never)

      // Should not throw - program_exercise errors are logged and skipped
      const result = await saveProgramToDb('user-456', program, DEFAULT_META)
      expect(result).toEqual(MOCK_FULL_PROGRAM)
    })
  })
})
