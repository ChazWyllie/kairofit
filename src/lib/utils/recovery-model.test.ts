/**
 * Recovery Model Tests
 *
 * Tests for the SRA curve implementation.
 * Uses sigmoid curve for non-linear recovery modeling.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateRecoveryPct,
  calculateRecoveryUpdates,
  isMuscleReadyToTrain,
} from './recovery-model'
import type { MuscleRecovery } from '@/types'

describe('calculateRecoveryPct', () => {
  it('returns 100 when never trained', () => {
    expect(calculateRecoveryPct('chest', null, 0)).toBe(100)
  })

  it('returns 0-5 immediately after training', () => {
    const justTrained = new Date()
    const pct = calculateRecoveryPct('chest', justTrained, 4)
    expect(pct).toBeLessThanOrEqual(5)
    expect(pct).toBeGreaterThanOrEqual(0)
  })

  it('returns ~40-60 at halfway through recovery window', () => {
    // chest = 72h recovery window, so halfway is 36h ago
    const halfRecovery = new Date(Date.now() - 36 * 60 * 60 * 1000)
    const pct = calculateRecoveryPct('chest', halfRecovery, 4)
    // Sigmoid should give roughly 50% at the midpoint
    expect(pct).toBeGreaterThan(30)
    expect(pct).toBeLessThan(70)
  })

  it('returns 90+ after full recovery window', () => {
    // chest = 72h, so 80h ago means fully recovered
    const fullyRecovered = new Date(Date.now() - 80 * 60 * 60 * 1000)
    const pct = calculateRecoveryPct('chest', fullyRecovered, 4)
    expect(pct).toBeGreaterThanOrEqual(90)
  })

  it('recovers faster for small muscles (biceps = 48h vs chest = 72h)', () => {
    // Train both 36h ago
    const trained36hAgo = new Date(Date.now() - 36 * 60 * 60 * 1000)
    const bicepsPct = calculateRecoveryPct('biceps', trained36hAgo, 3)
    const chestPct = calculateRecoveryPct('chest', trained36hAgo, 3)
    // At 36h: biceps (48h window) should be further along than chest (72h window)
    expect(bicepsPct).toBeGreaterThan(chestPct)
  })

  it('handles lower_back with longest recovery window (96h)', () => {
    const trained48hAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const lowerBackPct = calculateRecoveryPct('lower_back', trained48hAgo, 5)
    // At 48h into a 96h window, should be ~25-50% recovered
    expect(lowerBackPct).toBeGreaterThan(15)
    expect(lowerBackPct).toBeLessThan(65)
  })
})

describe('calculateRecoveryUpdates', () => {
  it('returns one entry per muscle worked', () => {
    const muscles = [
      { muscle: 'chest' as const, sets: 4 },
      { muscle: 'triceps' as const, sets: 3 },
    ]
    const updates = calculateRecoveryUpdates(muscles, new Date())
    expect(updates).toHaveLength(2)
  })

  it('sets estimated_recovery_pct to 0 immediately after training', () => {
    const now = new Date()
    const muscles = [{ muscle: 'back' as const, sets: 5 }]
    const updates = calculateRecoveryUpdates(muscles, now)
    expect(updates[0]?.estimated_recovery_pct).toBe(0)
  })

  it('includes last_trained_at as ISO string', () => {
    const completedAt = new Date('2026-01-01T10:00:00Z')
    const muscles = [{ muscle: 'quads' as const, sets: 4 }]
    const updates = calculateRecoveryUpdates(muscles, completedAt)
    expect(updates[0]?.last_trained_at).toBe('2026-01-01T10:00:00.000Z')
  })

  it('maps muscle to muscle_group in output', () => {
    const muscles = [{ muscle: 'biceps' as const, sets: 2 }]
    const updates = calculateRecoveryUpdates(muscles, new Date())
    expect(updates[0]?.muscle_group).toBe('biceps')
  })
})

describe('isMuscleReadyToTrain', () => {
  it('returns false if recovery is below minimum threshold', () => {
    const recovery: MuscleRecovery = {
      user_id: 'test',
      muscle_group: 'chest',
      last_trained_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      estimated_recovery_pct: 30,
      sets_this_week: 8,
      updated_at: new Date().toISOString(),
    }
    expect(isMuscleReadyToTrain(recovery, 50)).toBe(false)
  })

  it('returns true if recovery is above minimum threshold', () => {
    const recovery: MuscleRecovery = {
      user_id: 'test',
      muscle_group: 'chest',
      last_trained_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      estimated_recovery_pct: 85,
      sets_this_week: 8,
      updated_at: new Date().toISOString(),
    }
    expect(isMuscleReadyToTrain(recovery, 50)).toBe(true)
  })

  it('returns false if trained less than half the recovery window ago', () => {
    // chest = 72h, so less than 36h ago should block
    const recovery: MuscleRecovery = {
      user_id: 'test',
      muscle_group: 'chest',
      last_trained_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      estimated_recovery_pct: 75, // even if recovery_pct is high, time check blocks
      sets_this_week: 8,
      updated_at: new Date().toISOString(),
    }
    expect(isMuscleReadyToTrain(recovery, 50)).toBe(false)
  })

  it('returns true if trained more than half recovery window ago AND above threshold', () => {
    // chest = 72h, so 40h ago passes the time check
    const recovery: MuscleRecovery = {
      user_id: 'test',
      muscle_group: 'chest',
      last_trained_at: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
      estimated_recovery_pct: 60,
      sets_this_week: 8,
      updated_at: new Date().toISOString(),
    }
    expect(isMuscleReadyToTrain(recovery, 50)).toBe(true)
  })

  it('returns true if never trained', () => {
    const recovery: MuscleRecovery = {
      user_id: 'test',
      muscle_group: 'chest',
      last_trained_at: null,
      estimated_recovery_pct: 100,
      sets_this_week: 0,
      updated_at: new Date().toISOString(),
    }
    expect(isMuscleReadyToTrain(recovery, 50)).toBe(true)
  })
})
