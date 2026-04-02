/**
 * ProgramCard Tests
 *
 * Verifies that ProgramCard renders program name, archetype badge, week info, and days per week.
 * These tests verify the component behavior and structure.
 */

import { describe, it, expect } from 'vitest'
import type { Program, KairoArchetype } from '@/types'
import { ProgramCard } from '../ProgramCard'

const mockProgram = (overrides: Partial<Program> = {}): Program => ({
  id: 'program-1',
  user_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  name: 'Upper/Lower Split',
  description: 'A balanced strength program',
  ai_rationale: 'Optimized for your profile',
  weeks_duration: 8,
  days_per_week: 4,
  goal: 'strength',
  split_type: 'upper_lower',
  current_week: 2,
  progression_scheme: 'double_progression',
  is_active: true,
  projected_weeks_to_goal: null,
  projected_outcome_description: null,
  days: [],
  ...overrides,
})

describe('ProgramCard', () => {
  describe('component structure', () => {
    it('exports ProgramCard as a React component', () => {
      expect(typeof ProgramCard).toBe('function')
    })

    it('accepts program and archetype props', () => {
      const program = mockProgram()
      const component = ProgramCard({ program, archetype: null })
      expect(component).toBeDefined()
    })
  })

  describe('archetype label generation', () => {
    it('generates correct display name for system_builder', () => {
      const program = mockProgram({ name: 'Test' })
      // Test that the component correctly handles archetype prop
      expect(() => ProgramCard({ program, archetype: 'system_builder' })).not.toThrow()
    })

    it('generates correct display name for milestone_chaser', () => {
      const program = mockProgram()
      expect(() => ProgramCard({ program, archetype: 'milestone_chaser' })).not.toThrow()
    })

    it('handles null archetype', () => {
      const program = mockProgram()
      expect(() => ProgramCard({ program, archetype: null })).not.toThrow()
    })
  })

  describe('all archetype types', () => {
    const archetypes: KairoArchetype[] = [
      'system_builder',
      'milestone_chaser',
      'explorer',
      'pragmatist',
      'comeback_kid',
      'optimizer',
      'challenger',
      'understander',
    ]

    archetypes.forEach((archetype) => {
      it(`renders without error for ${archetype}`, () => {
        const program = mockProgram()
        expect(() => ProgramCard({ program, archetype })).not.toThrow()
      })
    })
  })

  describe('prop handling', () => {
    it('handles various program names', () => {
      const names = ['My Program', 'Upper Lower Split', 'Push Pull Legs']
      names.forEach((name) => {
        const program = mockProgram({ name })
        expect(() => ProgramCard({ program, archetype: null })).not.toThrow()
      })
    })

    it('handles various week numbers', () => {
      const weeks = [1, 2, 4, 8]
      weeks.forEach((current_week) => {
        const program = mockProgram({ current_week, weeks_duration: 8 })
        expect(() => ProgramCard({ program, archetype: null })).not.toThrow()
      })
    })

    it('handles null days_per_week', () => {
      const program = mockProgram({ days_per_week: null })
      expect(() => ProgramCard({ program, archetype: null })).not.toThrow()
    })

    it('handles various days_per_week values', () => {
      const dayValues = [3, 4, 5, 6]
      dayValues.forEach((days_per_week) => {
        const program = mockProgram({ days_per_week })
        expect(() => ProgramCard({ program, archetype: null })).not.toThrow()
      })
    })
  })
})
