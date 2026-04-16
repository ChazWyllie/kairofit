/**
 * Tests for src/lib/offline/sync.ts
 *
 * TDD: these tests are written BEFORE the implementation.
 * They define the contract for logSetOffline() and syncPendingSets().
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Dexie helpers before importing sync.ts so the module sees the mocks
vi.mock('@/lib/offline/db', () => ({
  getPendingSets: vi.fn(),
  markSetsAsSynced: vi.fn(),
  markSetsAsFailed: vi.fn(),
  default: {
    workout_sets: {
      add: vi.fn(),
    },
  },
}))

import db, { getPendingSets, markSetsAsSynced, markSetsAsFailed } from '@/lib/offline/db'
import { logSetOffline, syncPendingSets } from '@/lib/offline/sync'
import type { LocalWorkoutSet } from '@/lib/offline/db'

// Minimal set fixture - every required field except sync_status, sync_attempts, last_sync_attempt
const makeSet = (
  overrides: Partial<LocalWorkoutSet> = {}
): Omit<LocalWorkoutSet, 'sync_status' | 'sync_attempts' | 'last_sync_attempt'> => ({
  id: 'set-uuid-1',
  session_id: 'session-uuid-1',
  exercise_id: 'exercise-uuid-1',
  user_id: 'user-uuid-1',
  set_number: 1,
  reps_completed: 10,
  weight_kg: 80,
  rpe: null,
  is_warmup: false,
  is_dropset: false,
  logged_at: '2026-01-01T10:00:00.000Z',
  ...overrides,
})

const makePendingSet = (): LocalWorkoutSet => ({
  ...makeSet(),
  sync_status: 'pending',
  sync_attempts: 0,
  last_sync_attempt: null,
})

describe('logSetOffline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigator.onLine to true (online by default)
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    // Default: no pending sets so the syncPendingSets fallback is a no-op
    vi.mocked(getPendingSets).mockResolvedValue([])
    vi.mocked(markSetsAsSynced).mockResolvedValue(undefined)
    vi.mocked(markSetsAsFailed).mockResolvedValue(undefined)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ synced: [], failed: [] }),
    } as unknown as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should write the set to Dexie with sync_status: pending', async () => {
    const mockAdd = vi.mocked(db.workout_sets.add)
    mockAdd.mockResolvedValue('set-uuid-1')

    await logSetOffline(makeSet())

    expect(mockAdd).toHaveBeenCalledOnce()
    const written = mockAdd.mock.calls[0]![0] as LocalWorkoutSet
    expect(written.sync_status).toBe('pending')
    expect(written.sync_attempts).toBe(0)
    expect(written.last_sync_attempt).toBeNull()
  })

  it('should preserve all set fields when writing to Dexie', async () => {
    const mockAdd = vi.mocked(db.workout_sets.add)
    mockAdd.mockResolvedValue('set-uuid-1')

    const set = makeSet({ reps_completed: 12, weight_kg: 100, rpe: 8 })
    await logSetOffline(set)

    const written = mockAdd.mock.calls[0]![0] as LocalWorkoutSet
    expect(written.id).toBe(set.id)
    expect(written.session_id).toBe(set.session_id)
    expect(written.reps_completed).toBe(12)
    expect(written.weight_kg).toBe(100)
    expect(written.rpe).toBe(8)
  })

  it('should register background sync when SyncManager is available', async () => {
    const mockAdd = vi.mocked(db.workout_sets.add)
    mockAdd.mockResolvedValue('set-uuid-1')

    const mockRegister = vi.fn().mockResolvedValue(undefined)
    const mockReady = Promise.resolve({ sync: { register: mockRegister } })
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: mockReady },
      configurable: true,
    })
    Object.defineProperty(window, 'SyncManager', {
      value: class SyncManager {},
      configurable: true,
    })

    await logSetOffline(makeSet())

    expect(mockRegister).toHaveBeenCalledWith('sync-workout-sets')
  })

  it('should fall back to syncPendingSets when SyncManager is unavailable', async () => {
    const mockAdd = vi.mocked(db.workout_sets.add)
    mockAdd.mockResolvedValue('set-uuid-1')

    // Remove SyncManager from window
    const original = (window as unknown as Record<string, unknown>).SyncManager
    delete (window as unknown as Record<string, unknown>).SyncManager

    // Mock fetch for syncPendingSets fallback
    const mockPendingSets = [makePendingSet()]
    vi.mocked(getPendingSets).mockResolvedValue(mockPendingSets)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ synced: ['set-uuid-1'], failed: [] }),
    } as unknown as Response)
    vi.mocked(markSetsAsSynced).mockResolvedValue(undefined)

    await logSetOffline(makeSet())

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/sync/workout-sets',
      expect.objectContaining({ method: 'POST' })
    )

    // Restore
    if (original) (window as unknown as Record<string, unknown>).SyncManager = original
  })
})

describe('syncPendingSets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should do nothing when there are no pending sets', async () => {
    vi.mocked(getPendingSets).mockResolvedValue([])
    global.fetch = vi.fn()

    await syncPendingSets()

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should POST pending sets to /api/sync/workout-sets', async () => {
    const pendingSets = [makePendingSet()]
    vi.mocked(getPendingSets).mockResolvedValue(pendingSets)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ synced: ['set-uuid-1'], failed: [] }),
    } as unknown as Response)
    vi.mocked(markSetsAsSynced).mockResolvedValue(undefined)

    await syncPendingSets()

    expect(global.fetch).toHaveBeenCalledWith('/api/sync/workout-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sets: pendingSets }),
    })
  })

  it('should call markSetsAsSynced with synced IDs on success', async () => {
    vi.mocked(getPendingSets).mockResolvedValue([makePendingSet()])
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ synced: ['set-uuid-1'], failed: [] }),
    } as unknown as Response)
    vi.mocked(markSetsAsSynced).mockResolvedValue(undefined)

    await syncPendingSets()

    expect(markSetsAsSynced).toHaveBeenCalledWith(['set-uuid-1'])
    expect(markSetsAsFailed).not.toHaveBeenCalled()
  })

  it('should call markSetsAsFailed with failed IDs on partial failure', async () => {
    vi.mocked(getPendingSets).mockResolvedValue([makePendingSet()])
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ synced: [], failed: ['set-uuid-1'] }),
    } as unknown as Response)
    vi.mocked(markSetsAsFailed).mockResolvedValue(undefined)

    await syncPendingSets()

    expect(markSetsAsFailed).toHaveBeenCalledWith(['set-uuid-1'])
    expect(markSetsAsSynced).not.toHaveBeenCalled()
  })

  it('should call markSetsAsFailed for all sets on non-2xx response', async () => {
    const pendingSets = [makePendingSet()]
    vi.mocked(getPendingSets).mockResolvedValue(pendingSets)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    } as unknown as Response)
    vi.mocked(markSetsAsFailed).mockResolvedValue(undefined)

    await syncPendingSets()

    expect(markSetsAsFailed).toHaveBeenCalledWith(['set-uuid-1'])
    expect(markSetsAsSynced).not.toHaveBeenCalled()
  })

  it('should do nothing when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    global.fetch = vi.fn()

    await syncPendingSets()

    expect(global.fetch).not.toHaveBeenCalled()
  })
})
