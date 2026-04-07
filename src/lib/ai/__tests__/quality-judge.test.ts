/**
 * Quality Judge Tests - Layer 3 LLM-as-judge
 *
 * These tests verify that the quality judge correctly:
 * 1. Parses structured dimension scores from a Haiku response
 * 2. Computes the average and sets passed = (average >= 4)
 * 3. Logs a console.warn when the score is below threshold
 *
 * The Anthropic SDK is fully mocked - no live API calls.
 * The production module (quality-judge.ts) does not exist yet.
 * All tests in this file will FAIL until the GREEN phase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// MOCK @anthropic-ai/sdk
// Must be hoisted above the import under test.
// ============================================================

const mockMessagesCreate = vi.hoisted(() => vi.fn())

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate },
  })),
}))

// ============================================================
// IMPORT UNDER TEST (does not exist yet - RED)
// ============================================================

import { judgeWorkoutQuality } from '../quality-judge'
import type { GeneratedProgram } from '@/types'
import validProgram from './fixtures/valid-program.json'

// ============================================================
// TEST HELPERS
// ============================================================

/**
 * Builds a mock Anthropic messages.create response whose text content
 * contains a JSON block with the five dimension scores.
 */
function makeHaikuResponse(scores: {
  safety: number
  scientific_accuracy: number
  personalization: number
  kiro_voice: number
  completeness: number
}) {
  const json = JSON.stringify(scores)
  return {
    content: [
      {
        type: 'text',
        text: `Here is my evaluation of the workout program:\n\`\`\`json\n${json}\n\`\`\``,
      },
    ],
  }
}

// ============================================================
// SCORE PARSING
// ============================================================

describe('judgeWorkoutQuality - score parsing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses all five dimension scores from Haiku JSON response', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 5,
        scientific_accuracy: 4,
        personalization: 4,
        kiro_voice: 5,
        completeness: 4,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(result.safety).toBe(5)
    expect(result.scientific_accuracy).toBe(4)
    expect(result.personalization).toBe(4)
    expect(result.kiro_voice).toBe(5)
    expect(result.completeness).toBe(4)
  })

  it('computes average correctly across five dimensions', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 5,
        scientific_accuracy: 3,
        personalization: 4,
        kiro_voice: 4,
        completeness: 4,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    // (5 + 3 + 4 + 4 + 4) / 5 = 4.0
    expect(result.average).toBeCloseTo(4.0)
  })

  it('returns the raw Haiku response text alongside the scores', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 4,
        scientific_accuracy: 4,
        personalization: 4,
        kiro_voice: 4,
        completeness: 4,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(typeof result.raw_response).toBe('string')
    expect(result.raw_response.length).toBeGreaterThan(0)
  })
})

// ============================================================
// PASS / FAIL THRESHOLD (average >= 4)
// ============================================================

describe('judgeWorkoutQuality - pass threshold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks passed = true when average is exactly 4.0', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 4,
        scientific_accuracy: 4,
        personalization: 4,
        kiro_voice: 4,
        completeness: 4,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(result.passed).toBe(true)
  })

  it('marks passed = true when average is above 4.0', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 5,
        scientific_accuracy: 5,
        personalization: 5,
        kiro_voice: 5,
        completeness: 5,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(result.passed).toBe(true)
    expect(result.average).toBe(5)
  })

  it('marks passed = false when average is below 4.0', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 3,
        scientific_accuracy: 3,
        personalization: 3,
        kiro_voice: 4,
        completeness: 3,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    // (3 + 3 + 3 + 4 + 3) / 5 = 3.2
    expect(result.passed).toBe(false)
    expect(result.average).toBeCloseTo(3.2)
  })

  it('marks passed = false when a safety score is 1 even if average >= 4', async () => {
    // Safety failures should block regardless of other scores
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 1,
        scientific_accuracy: 5,
        personalization: 5,
        kiro_voice: 5,
        completeness: 5,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    // Average = (1+5+5+5+5)/5 = 4.2, but safety = 1 should force passed = false
    expect(result.passed).toBe(false)
  })
})

// ============================================================
// WARNING LOGGING
// ============================================================

describe('judgeWorkoutQuality - warning logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls console.warn when the score does not pass', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 2,
        scientific_accuracy: 3,
        personalization: 3,
        kiro_voice: 3,
        completeness: 2,
      })
    )

    const result = await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(result.passed).toBe(false)
    expect(warnSpy).toHaveBeenCalledOnce()
    // Warning should include the average score for debugging
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/quality/i)

    warnSpy.mockRestore()
  })

  it('does NOT call console.warn when the score passes', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 5,
        scientific_accuracy: 4,
        personalization: 4,
        kiro_voice: 4,
        completeness: 4,
      })
    )

    await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})

// ============================================================
// SDK CALL VERIFICATION
// ============================================================

describe('judgeWorkoutQuality - SDK usage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls the Anthropic SDK with the haiku model', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 4,
        scientific_accuracy: 4,
        personalization: 4,
        kiro_voice: 4,
        completeness: 4,
      })
    )

    await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(mockMessagesCreate).toHaveBeenCalledOnce()
    const callArgs = mockMessagesCreate.mock.calls[0]?.[0]
    expect(callArgs?.model).toMatch(/haiku/i)
  })

  it('makes exactly one SDK call per judgeWorkoutQuality invocation', async () => {
    mockMessagesCreate.mockResolvedValue(
      makeHaikuResponse({
        safety: 4,
        scientific_accuracy: 4,
        personalization: 4,
        kiro_voice: 4,
        completeness: 4,
      })
    )

    await judgeWorkoutQuality(validProgram as GeneratedProgram, {
      experienceLevel: 3,
      goals: ['muscle'],
      injuries: [],
    })

    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
  })
})
