/**
 * Event Names Tests
 *
 * Validates the EVENTS constant:
 * - All values are non-empty strings
 * - No duplicate values (typos create silent silent mis-mapping)
 * - Critical Phase 8 events are present with correct string values
 */

import { describe, it, expect } from 'vitest'
import { EVENTS } from '../event-names'

describe('EVENTS', () => {
  it('exports a non-empty object', () => {
    expect(Object.keys(EVENTS).length).toBeGreaterThan(0)
  })

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(EVENTS)) {
      expect(typeof value, `EVENTS.${key}`).toBe('string')
      expect(value.length, `EVENTS.${key} is empty`).toBeGreaterThan(0)
    }
  })

  it('has no duplicate values', () => {
    const values = Object.values(EVENTS)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  it('uses SCREAMING_SNAKE_CASE for all values', () => {
    for (const [key, value] of Object.entries(EVENTS)) {
      expect(value, `EVENTS.${key} does not match SCREAMING_SNAKE_CASE`).toMatch(
        /^[A-Z][A-Z0-9_]+$/
      )
    }
  })

  // Critical Phase 8 events
  it('includes ONBOARDING_STEP_COMPLETED', () => {
    expect(EVENTS.ONBOARDING_STEP_COMPLETED).toBe('ONBOARDING_STEP_COMPLETED')
  })

  it('includes PROGRAM_GENERATION_COMPLETED', () => {
    expect(EVENTS.PROGRAM_GENERATION_COMPLETED).toBe('PROGRAM_GENERATION_COMPLETED')
  })

  it('includes WORKOUT_STARTED', () => {
    expect(EVENTS.WORKOUT_STARTED).toBe('WORKOUT_STARTED')
  })

  it('includes SET_LOGGED', () => {
    expect(EVENTS.SET_LOGGED).toBe('SET_LOGGED')
  })

  it('includes WORKOUT_COMPLETED', () => {
    expect(EVENTS.WORKOUT_COMPLETED).toBe('WORKOUT_COMPLETED')
  })

  it('includes KIRO_DEBRIEF_VIEWED', () => {
    expect(EVENTS.KIRO_DEBRIEF_VIEWED).toBe('KIRO_DEBRIEF_VIEWED')
  })

  it('includes ARCHETYPE_REVEALED', () => {
    expect(EVENTS.ARCHETYPE_REVEALED).toBe('ARCHETYPE_REVEALED')
  })

  it('includes EMAIL_GATE_REACHED', () => {
    expect(EVENTS.EMAIL_GATE_REACHED).toBe('EMAIL_GATE_REACHED')
  })

  it('includes EMAIL_GATE_SUBMITTED', () => {
    expect(EVENTS.EMAIL_GATE_SUBMITTED).toBe('EMAIL_GATE_SUBMITTED')
  })
})
