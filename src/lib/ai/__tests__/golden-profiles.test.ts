/**
 * Golden Profile Regression Tests - Layer 4
 *
 * Each fixture in ./golden-profiles/ is a hand-crafted expert program paired
 * with its expected validation result. Running validateWorkoutProgram against
 * these profiles acts as a regression suite: if the validator's rules change in
 * a way that would reject a previously-valid program (or accept a previously-
 * invalid one), these tests will catch it.
 *
 * No live API calls. No mocks. Pure deterministic validator logic.
 *
 * Adding a new golden profile:
 *   1. Create the JSON fixture in ./golden-profiles/
 *   2. Import it below and add it to the PROFILES array.
 *   3. Set expectations.valid and expectations.error_count accurately.
 */

import { describe, it, expect } from 'vitest'
import { validateWorkoutProgram } from '../workout-validator'
import type { GeneratedProgram, ExperienceLevel, InjuryZone, Equipment } from '@/types'

// ============================================================
// GOLDEN PROFILE FIXTURES
// ============================================================

import profile01 from './golden-profiles/01-beginner-bodyweight.json'
import profile02 from './golden-profiles/02-beginner-dumbbells.json'
import profile03 from './golden-profiles/03-intermediate-push-pull-legs.json'
import profile04 from './golden-profiles/04-advanced-strength.json'
import profile05 from './golden-profiles/05-lower-back-injury.json'
import profile06 from './golden-profiles/06-shoulder-injury.json'
import profile07 from './golden-profiles/07-minimal-equipment.json'
import profile08 from './golden-profiles/08-experienced-fat-loss.json'

// ============================================================
// PROFILE REGISTRY
// ============================================================

const PROFILES = [
  profile01,
  profile02,
  profile03,
  profile04,
  profile05,
  profile06,
  profile07,
  profile08,
] as const

// ============================================================
// REGRESSION SUITE
// ============================================================

describe('golden profile regression (Layer 4)', () => {
  for (const profile of PROFILES) {
    it(profile.description, () => {
      const result = validateWorkoutProgram(
        profile.program as unknown as GeneratedProgram,
        profile.profile.experience_level as ExperienceLevel,
        profile.profile.injuries as InjuryZone[],
        profile.profile.equipment as Equipment[]
      )

      expect(result.valid).toBe(profile.expectations.valid)
      expect(result.errors).toHaveLength(profile.expectations.error_count)
    })
  }
})
