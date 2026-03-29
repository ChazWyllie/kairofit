/**
 * Onboarding Store Persist Tests
 *
 * Verifies that the Zustand persist middleware:
 * 1. Writes state to localStorage under 'kairofit-onboarding'
 * 2. Rehydrates state when rehydrate() is called
 * 3. Specific fields (goal, auth_ready) survive a simulated reload
 *
 * Uses jsdom's native localStorage (available in vitest jsdom env).
 * No localStorage mock needed - the store's persist middleware already
 * uses the real localStorage captured at module init.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore } from '../onboarding.store'

const PERSIST_KEY = 'kairofit-onboarding'

function getPersistedState(): Record<string, unknown> | null {
  const raw = localStorage.getItem(PERSIST_KEY)
  if (!raw) return null
  return JSON.parse(raw)
}

describe('onboarding store persist', () => {
  beforeEach(() => {
    localStorage.clear()
    useOnboardingStore.getState().reset()
  })

  it('uses persist key "kairofit-onboarding"', () => {
    useOnboardingStore.getState().setGoal('muscle')
    expect(getPersistedState()).not.toBeNull()
  })

  it('persists goal to localStorage when setGoal is called', () => {
    useOnboardingStore.getState().setGoal('muscle')
    expect(getPersistedState()?.state).toMatchObject({ goal: 'muscle' })
  })

  it('persists auth_ready to localStorage when setAuthReady is called', () => {
    useOnboardingStore.getState().setAuthReady(true)
    expect(getPersistedState()?.state).toMatchObject({ auth_ready: true })
  })

  it('rehydrates goal from localStorage on rehydrate()', async () => {
    const priorState = { state: { goal: 'endurance', auth_ready: false }, version: 0 }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(priorState))

    await useOnboardingStore.persist.rehydrate()

    expect(useOnboardingStore.getState().goal).toBe('endurance')
  })

  it('rehydrates auth_ready from localStorage on rehydrate()', async () => {
    const priorState = { state: { auth_ready: true }, version: 0 }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(priorState))

    await useOnboardingStore.persist.rehydrate()

    expect(useOnboardingStore.getState().auth_ready).toBe(true)
  })

  it('reset writes null goal to persisted state', () => {
    useOnboardingStore.getState().setGoal('strength')
    expect(getPersistedState()?.state).toMatchObject({ goal: 'strength' })

    useOnboardingStore.getState().reset()
    expect(getPersistedState()?.state).toMatchObject({ goal: null })
  })
})
