/**
 * Onboarding Actions Tests
 *
 * Tests for:
 * - createAccountAction: unauthenticated OTP send
 * - generateProgramAction: AI generation + DB save (authenticated)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (must be declared before imports that use them)
// ---------------------------------------------------------------------------

vi.mock('@/lib/db/supabase', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('@/lib/ai/workout-generator', () => ({
  generateProgram: vi.fn(),
}))

vi.mock('@/lib/db/queries/profiles', () => ({
  getProfileForGeneration: vi.fn(),
  saveOnboardingData: vi.fn(),
}))

vi.mock('@/lib/db/queries/programs', () => ({
  saveProgramToDb: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => 'http://localhost:3000'),
  })),
}))

vi.mock('next/server', () => ({
  after: vi.fn(),
}))

vi.mock('@/lib/utils/analytics', () => ({
  trackServer: vi.fn(),
}))

import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { generateProgram } from '@/lib/ai/workout-generator'
import { getProfileForGeneration, saveOnboardingData } from '@/lib/db/queries/profiles'
import { saveProgramToDb } from '@/lib/db/queries/programs'
import {
  createAccountAction,
  generateProgramAction,
  persistOnboardingState,
} from '../onboarding.actions'
import type { UserProfile, GeneratedProgram, Program, OnboardingState } from '@/types'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-123', email: 'test@example.com' }

const MOCK_ONBOARDING_STATE: OnboardingState = {
  current_step: 23,
  total_steps: 23,
  goal: 'muscle',
  experience_level: 3,
  training_recency_months: 2,
  age_range: '24-29',
  gender: 'male',
  days_per_week: 4,
  session_duration_preference: '45-60',
  obstacle: 'time',
  work_schedule: '9-5',
  activity_level: 'sedentary',
  injuries: [],
  height_cm: 180,
  weight_kg: 80,
  body_fat_pct: null,
  why_now: 'new_start',
  psych_scores: [4, 3, 2, 5],
  archetype: 'system_builder',
  email: 'test@example.com',
  auth_ready: true,
  equipment: ['dumbbells', 'barbells'],
  split_preference: 'upper_lower',
  workout_time_preference: 'morning',
  other_training: [],
  sleep_hours_range: '7-8',
  units: 'metric',
}

const MOCK_PROFILE: Partial<UserProfile> = {
  id: 'user-123',
  goal: 'muscle',
  experience_level: 3,
  days_per_week: 4,
  equipment: ['dumbbells', 'barbells'],
  injuries: [],
}

const MOCK_GENERATED_PROGRAM: GeneratedProgram = {
  name: 'Test Program',
  description: 'AI generated program',
  ai_rationale: 'Research-backed',
  weeks_duration: 8,
  progression_scheme: 'double_progression',
  projected_weeks_to_goal: 10,
  projected_outcome_description: 'Strength gains',
  days: [],
}

const MOCK_SAVED_PROGRAM: Partial<Program> = {
  id: 'program-456',
  user_id: 'user-123',
  name: 'Test Program',
  is_active: true,
  days: [],
}

// ---------------------------------------------------------------------------
// createAccountAction
// ---------------------------------------------------------------------------

describe('createAccountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      },
    } as never)
  })

  it('calls signInWithOtp with shouldCreateUser: true for valid email', async () => {
    const result = await createAccountAction({ email: 'valid@example.com' })

    const supabase = await vi.mocked(createServerClient).mock.results[0]!.value
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'valid@example.com',
        options: expect.objectContaining({ shouldCreateUser: true }),
      })
    )
    expect(result?.data?.success).toBe(true)
  })

  it('returns validation error for invalid email', async () => {
    const result = await createAccountAction({ email: 'not-an-email' })

    expect(result?.validationErrors).toBeDefined()
    expect(vi.mocked(createServerClient)).not.toHaveBeenCalled()
  })

  it('throws when Supabase OTP returns an error', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        signInWithOtp: vi.fn().mockResolvedValue({
          error: { message: 'Email rate limit exceeded' },
        }),
      },
    } as never)

    const result = await createAccountAction({ email: 'valid@example.com' })

    // next-safe-action catches the thrown error and returns it as serverError
    expect(result?.serverError).toBeDefined()
  })

  it('throws when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('Too Many Requests'))

    const result = await createAccountAction({ email: 'valid@example.com' })

    expect(result?.serverError).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// generateProgramAction
// ---------------------------------------------------------------------------

describe('generateProgramAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue(undefined)
    vi.mocked(generateProgram).mockResolvedValue({
      program: MOCK_GENERATED_PROGRAM,
      source: 'ai_sonnet',
    })
    vi.mocked(saveProgramToDb).mockResolvedValue(MOCK_SAVED_PROGRAM as Program)
    vi.mocked(getProfileForGeneration).mockResolvedValue(MOCK_PROFILE as UserProfile)
  })

  it('returns serverError when user is not authenticated', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('No session'),
        }),
      },
    } as never)

    const result = await generateProgramAction({ confirm_generation: true })

    expect(result?.serverError).toBeDefined()
  })

  it('returns serverError when profile is not found', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)
    vi.mocked(getProfileForGeneration).mockResolvedValue(null)

    const result = await generateProgramAction({ confirm_generation: true })

    expect(result?.serverError).toBeDefined()
  })

  it('calls generateProgram with the user profile', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)

    await generateProgramAction({ confirm_generation: true })

    expect(vi.mocked(generateProgram)).toHaveBeenCalledWith(MOCK_PROFILE)
  })

  it('calls saveProgramToDb with userId, program, and meta', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)

    await generateProgramAction({ confirm_generation: true })

    expect(vi.mocked(saveProgramToDb)).toHaveBeenCalledWith(
      'user-123',
      MOCK_GENERATED_PROGRAM,
      expect.objectContaining({
        generation_model: 'ai_sonnet',
        experience_level_target: 3,
      })
    )
  })

  it('returns programId on success', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)

    const result = await generateProgramAction({ confirm_generation: true })

    expect(result?.data?.programId).toBe('program-456')
  })

  it('returns serverError when AI generation throws', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)
    vi.mocked(generateProgram).mockRejectedValue(new Error('AI service unavailable'))

    const result = await generateProgramAction({ confirm_generation: true })

    expect(result?.serverError).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// persistOnboardingState
// ---------------------------------------------------------------------------

describe('persistOnboardingState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(saveOnboardingData).mockResolvedValue(undefined)
  })

  it('calls saveOnboardingData with the authenticated user id and state', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)

    await persistOnboardingState(MOCK_ONBOARDING_STATE)

    // total_steps is UI-only state (wizard progress bar); onboardingStateSchema strips it before DB write
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { total_steps: _total, ...expectedState } = MOCK_ONBOARDING_STATE
    expect(vi.mocked(saveOnboardingData)).toHaveBeenCalledWith('user-123', expectedState)
  })

  it('throws Authentication required when there is no session', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('No session'),
        }),
      },
    } as never)

    await expect(persistOnboardingState(MOCK_ONBOARDING_STATE)).rejects.toThrow(
      'Authentication required'
    )
  })

  it('propagates errors thrown by saveOnboardingData', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: MOCK_USER },
          error: null,
        }),
      },
    } as never)
    vi.mocked(saveOnboardingData).mockRejectedValue(new Error('DB write failed'))

    await expect(persistOnboardingState(MOCK_ONBOARDING_STATE)).rejects.toThrow('DB write failed')
  })
})
