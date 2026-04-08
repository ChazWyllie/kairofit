/**
 * Offline Sync - Client Side
 *
 * logSetOffline(): Write-local-first entry point for set logging.
 *   1. Write to IndexedDB (Dexie) immediately - always succeeds, even offline.
 *   2. Register a Background Sync event via the service worker.
 *   3. Fall back to syncPendingSets() if Background Sync API is unavailable (Safari).
 *
 * syncPendingSets(): Direct-fetch fallback.
 *   Reads pending sets from Dexie and POSTs them to /api/sync/workout-sets.
 *   Called when Background Sync API is unavailable, or can be called manually
 *   from an 'online' event listener.
 *
 * The service worker handles syncPendingSets via the 'sync-workout-sets' event
 * in src/app/sw.ts when connectivity returns after an offline session.
 *
 * See skills/offline-sync-pattern/SKILL.md for the full architecture.
 */

import db, { getPendingSets, markSetsAsSynced, markSetsAsFailed } from './db'
import type { LocalWorkoutSet } from './db'

// ============================================================
// TYPES
// ============================================================

type SetInput = Omit<LocalWorkoutSet, 'sync_status' | 'sync_attempts' | 'last_sync_attempt'>

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Write a workout set to IndexedDB and trigger background sync.
 * Always succeeds locally - network is optional.
 */
export async function logSetOffline(set: SetInput): Promise<void> {
  // Step 1: Write to Dexie with pending status
  await db.workout_sets.add({
    ...set,
    sync_status: 'pending',
    sync_attempts: 0,
    last_sync_attempt: null,
  })

  // Step 2: Register background sync if the API is available (Chrome, Edge, Android)
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready
      await (reg as unknown as { sync: { register(tag: string): Promise<void> } }).sync.register(
        'sync-workout-sets'
      )
      return
    } catch {
      // Background sync registration failed - fall through to direct sync
    }
  }

  // Step 3: Fallback - attempt immediate sync (Safari, Firefox, or SW registration failure)
  await syncPendingSets()
}

/**
 * Directly sync all pending sets to Supabase via the /api/sync/workout-sets route.
 * Skips when offline (navigator.onLine === false) to avoid a guaranteed failure.
 * Called as a fallback from logSetOffline() and can be wired to window 'online' events.
 */
export async function syncPendingSets(): Promise<void> {
  // Skip if we know we're offline - the SW will fire when we reconnect
  if (!navigator.onLine) {
    return
  }

  const pendingSets = await getPendingSets()

  if (pendingSets.length === 0) {
    return
  }

  let response: Response
  try {
    response = await fetch('/api/sync/workout-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sets: pendingSets }),
    })
  } catch {
    // Network error - mark all as failed so the UI shows the retry indicator
    await markSetsAsFailed(pendingSets.map((s) => s.id))
    return
  }

  if (!response.ok) {
    await markSetsAsFailed(pendingSets.map((s) => s.id))
    return
  }

  const result = (await response.json()) as { synced: string[]; failed: string[] }

  if (result.synced?.length > 0) {
    await markSetsAsSynced(result.synced)
  }

  if (result.failed?.length > 0) {
    await markSetsAsFailed(result.failed)
  }
}
