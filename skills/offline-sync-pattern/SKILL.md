---
name: offline-sync-pattern
description: >
  Offline-first workout logging patterns using Dexie.js and Serwist background sync.
  Use this skill when building any feature that needs to work without internet connectivity,
  specifically the active workout logger. Triggers when: working in src/lib/offline/,
  implementing set logging, building the workout session UI, or any time you need data
  to persist locally before syncing. This is a core MVP differentiator - gyms have poor
  connectivity and the app must work reliably offline.
---

# Offline Sync Pattern

Offline workout logging is a core KairoFit differentiator.
The app must work with zero connectivity during a gym session.
Sets log instantly, sync to Supabase when connectivity returns.

## Architecture Decision: Write-Local-First

1. User logs a set -> write to IndexedDB immediately (Dexie.js)
2. Register a Background Sync event with the service worker (Serwist)
3. When connectivity returns, service worker fires sync event
4. Sync queue sends all pending sets to Supabase
5. Update IndexedDB records as synced

**Conflict resolution decision:** Last-write-wins for workout sets.
Sets are append-only during a session. If two devices are somehow both logging
the same session (edge case), the last write wins. Document this to users in the sync UI.

## Dexie Schema (mirrors Supabase tables)

```typescript
// src/lib/offline/db.ts
import Dexie, { type EntityTable } from 'dexie'

interface LocalWorkoutSet {
  id: string              // UUID generated client-side
  session_id: string
  exercise_id: string
  user_id: string
  set_number: number
  reps_completed: number
  weight_kg?: number
  rpe?: number
  is_warmup: boolean
  is_dropset: boolean
  logged_at: string       // ISO timestamp
  sync_status: 'pending' | 'synced' | 'failed'
  sync_attempts: number
  last_sync_attempt?: string
}

interface LocalWorkoutSession {
  id: string
  user_id: string
  program_day_id?: string
  program_id?: string
  started_at: string
  status: 'in_progress' | 'completed' | 'skipped'
  sync_status: 'pending' | 'synced' | 'failed'
}

const db = new Dexie('kairofit') as Dexie & {
  workout_sets: EntityTable<LocalWorkoutSet, 'id'>
  workout_sessions: EntityTable<LocalWorkoutSession, 'id'>
}

db.version(1).stores({
  workout_sets: 'id, session_id, user_id, sync_status, logged_at',
  workout_sessions: 'id, user_id, sync_status, started_at',
})

export default db
export type { LocalWorkoutSet, LocalWorkoutSession }
```

## Write Pattern (set logging)

```typescript
// src/lib/offline/sync.ts
import db from './db'
import type { LocalWorkoutSet } from './db'

export async function logSetOffline(setData: Omit<LocalWorkoutSet, 'sync_status' | 'sync_attempts'>): Promise<void> {
  // Write to IndexedDB first (always succeeds, even offline)
  await db.workout_sets.add({
    ...setData,
    sync_status: 'pending',
    sync_attempts: 0,
  })

  // Register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready
    await reg.sync.register('sync-workout-sets')
  } else {
    // Fallback: attempt immediate sync if Background Sync API unavailable
    await syncPendingSets()
  }
}
```

## Background Sync Handler (Serwist service worker)

```typescript
// src/app/sw.ts
import { defaultCache } from '@serwist/next/worker'
import { installSerwist } from '@serwist/sw'

declare const self: ServiceWorkerGlobalScope

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workout-sets') {
    event.waitUntil(syncWorkoutSets())
  }
})

async function syncWorkoutSets() {
  // Call the sync endpoint which reads from IndexedDB and POSTs to Supabase
  const response = await fetch('/api/sync/workout-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Sync failed - will retry')
  }
}

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
})
```

## UUID Reassignment on Sync

When a session is created offline, it gets a client-generated UUID.
When it syncs to Supabase, Supabase may generate a new UUID (if using server-side generation).

Decision: Use client-generated UUIDs for all offline records.
The INSERT uses the client UUID. Supabase accepts it because the column is `uuid DEFAULT uuid_generate_v4()` but we provide the value explicitly.

This means the UUID is stable across offline and online states - no reassignment needed.

## Sync Status UI

Show sync status in the workout logger:

```typescript
// In the active workout component
const pendingSets = useLiveQuery(() =>
  db.workout_sets.where('sync_status').equals('pending').count()
)

// Display:
// - Green dot: all synced
// - Orange dot: X sets pending sync
// - Red dot: sync failed, tap to retry
```

## Handling the Multi-Device Edge Case

If a user starts a session on their phone, then opens the app on a tablet:
- The session exists in Supabase (if created while online)
- The tablet shows the session as in-progress
- Both devices can log sets to the same session
- Last-write-wins on sync

This is acceptable behavior. Document it in the UI as "Syncing from another device".

## Caching Strategy for Exercises and Programs

The exercise library and the user's active program are cached using Serwist's runtime caching.

```typescript
// In sw.ts runtime caching config:
// Exercise library: Cache First (changes rarely, stale is fine)
// Active program: Network First with 5-second timeout (want fresh data if possible)
// User profile: Network First (subscription status must be current)
```

## Testing Offline Behavior

1. Open Chrome DevTools -> Network -> set to Offline
2. Start a workout session
3. Log several sets - they should appear immediately with a "pending sync" indicator
4. Set network back to Online
5. Verify sets appear in Supabase within 5 seconds

The background sync event fires automatically when connectivity returns.
