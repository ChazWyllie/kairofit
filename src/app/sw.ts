/**
 * Service Worker (Serwist)
 *
 * Handles offline caching and background sync for workout logging.
 * Built with @serwist/next - NOT next-pwa (incompatible with Turbopack).
 *
 * Background sync flow:
 * 1. User logs a set offline -> logSetOffline() writes to IndexedDB (Dexie)
 *    and registers a 'sync-workout-sets' background sync event
 * 2. When connectivity returns, browser fires the sync event
 * 3. syncWorkoutSets() reads pending sets from Dexie via getPendingSets()
 * 4. POSTs them to /api/sync/workout-sets as { sets: [...] }
 * 5. Route returns { synced: string[], failed: string[] }
 * 6. Service worker calls markSetsAsSynced() / markSetsAsFailed() in Dexie
 * 7. Pending indicator in UI updates via useLiveQuery
 *
 * See skills/offline-sync-pattern/SKILL.md for the full architecture.
 */

import { defaultCache } from '@serwist/next/worker'
import { installSerwist } from 'serwist'
import type { PrecacheEntry } from '@serwist/precaching'

// Import Dexie helpers - service worker runs in the same origin so IndexedDB is accessible
// Note: these are the helpers from src/lib/offline/db.ts
// In a real build, these would be bundled into the SW by Serwist's webpack plugin
import { getPendingSets, markSetsAsSynced, markSetsAsFailed } from '../lib/offline/db'

// SyncEvent is part of the Background Sync API and is not yet in lib.dom.d.ts
interface SyncEvent extends ExtendableEvent {
  readonly tag: string
}

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

// ============================================================
// BACKGROUND SYNC
// ============================================================

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-workout-sets') {
    event.waitUntil(syncWorkoutSets())
  }
})

async function syncWorkoutSets(): Promise<void> {
  // Step 1: Read all pending sets from IndexedDB
  const pendingSets = await getPendingSets()

  if (pendingSets.length === 0) {
    // Nothing to sync
    return
  }

  // Step 2: POST to the sync route with the sets as the request body
  // The route expects: { sets: LocalWorkoutSet[] }
  const response = await fetch('/api/sync/workout-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Service worker requests carry the browser's cookie automatically
    // so auth works without any extra headers
    body: JSON.stringify({ sets: pendingSets }),
  })

  if (!response.ok) {
    // Non-2xx response - mark all as failed and throw to trigger retry
    const setIds = pendingSets.map((s) => s.id)
    await markSetsAsFailed(setIds)
    throw new Error(`Sync failed with status ${response.status}`)
  }

  // Step 3: Parse the response and update IndexedDB accordingly
  // The route returns: { synced: string[], failed: string[] }
  const result = (await response.json()) as { synced: string[]; failed: string[] }

  const syncPromises: Promise<void>[] = []

  if (result.synced?.length > 0) {
    syncPromises.push(markSetsAsSynced(result.synced))
  }

  if (result.failed?.length > 0) {
    syncPromises.push(markSetsAsFailed(result.failed))
  }

  await Promise.all(syncPromises)

  // If any sets failed server-side, throw to trigger retry
  if (result.failed?.length > 0) {
    throw new Error(`${result.failed.length} sets failed to sync`)
  }
}

// ============================================================
// INSTALL
// ============================================================

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})
