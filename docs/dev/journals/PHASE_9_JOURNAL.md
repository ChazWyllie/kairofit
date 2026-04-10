# Phase 9 Development Journal: PWA + Offline-First Workout Logging

_Branch: `feat/phase-9-pwa-offline` | Date: 2026-04-07 | Author: kairo_

---

## 1. Context & Planning

### Initial Requirements

Phase 9 delivers the core gym-floor promise: the app works without internet. Users lose connectivity
in gyms constantly (basement location, metal Faraday cage, crowd congestion). Any set logging that
depends on a network call will fail silently or visibly at the worst possible moment.

**Required deliverables:**

- `src/lib/offline/sync.ts` - client-side sync orchestration (Dexie write + Background Sync)
- `OfflineBanner` - real-time online/offline indicator in the workout UI
- `SyncStatusDot` - shows pending set count so users know what's queued for sync
- SetLogger offline-first rewrite - removes server action dependency entirely
- PWA icons - `public/icons/icon-192.png` + `icon-512.png` for manifest

**Pre-existing infrastructure (not touched in Phase 9):**

- `src/lib/offline/db.ts` - Dexie schema with `LocalWorkoutSet`, `getPendingSets`,
  `markSetsAsSynced`, `markSetsAsFailed`, `getPendingSetsCount`
- `src/app/sw.ts` - Serwist service worker with `sync-workout-sets` Background Sync handler
- `src/app/api/sync/workout-sets/route.ts` - POST endpoint called by the service worker
- `src/app/manifest.ts` - PWA manifest referencing the icons

### Architecture Decision: Pure Offline-First

The key architectural question was whether `SetLogger` should:

**Option A (dual-write):** Try `logSetAction` server action first (online), fall back to Dexie (offline)

**Option B (pure offline-first):** Always write to Dexie via `logSetOffline()`, sync happens 100%
via Background Sync / `syncPendingSets` fallback

Chose **Option B**. Rationale:

1. Simpler - one code path, not two
2. No need to modify `logSetAction` or `logSetSchema` to accept a client-generated `id`
3. Consistent behavior regardless of connectivity state
4. The sync route already handles upsert with `onConflict: 'id'` - server writes are idempotent
5. Local confirmation is immediate (after Dexie write succeeds, not after server round-trip)

---

## 2. Implementation

### 2.1 `src/lib/offline/sync.ts`

Two exported functions:

**`logSetOffline(set: SetInput): Promise<void>`**

1. Write to Dexie with `sync_status: 'pending'`
2. If `SyncManager` available (Chrome/Edge/Android): register `'sync-workout-sets'` tag via SW
3. Otherwise (Safari/Firefox): call `syncPendingSets()` directly

**`syncPendingSets(): Promise<void>`**

- Skip if `navigator.onLine === false`
- POST all pending sets to `/api/sync/workout-sets`
- Call `markSetsAsSynced(synced)` / `markSetsAsFailed(failed)` based on response

The Background Sync API is not in the standard TypeScript `lib.dom.d.ts`. Required a type
assertion to access `reg.sync`:

```typescript
await (reg as unknown as { sync: { register(tag: string): Promise<void> } }).sync.register(
  'sync-workout-sets'
)
```

### 2.2 `SetLogger.tsx` Rewrite

Key changes from the previous server-action-based implementation:

- Removed `useAction(logSetAction, ...)` and all `isPending` from useAction
- Added `userId: string` prop (needed for `LocalWorkoutSet.user_id`)
- Added local `isLogging: boolean` state via `useState`
- UUID generation: `crypto.randomUUID()` per set - stable client-generated ID for dedup
- Flow: `addOptimisticSet` -> `logSetOffline()` -> `confirmSet` (on success) or `removeSet` (on failure)
- Rest timer fires after successful Dexie write, not after server confirmation

### 2.3 `userId` Threading

`LocalWorkoutSet.user_id` is required by the Dexie schema. The Zustand store doesn't hold `userId`.
The server component `page.tsx` has `session.user_id` from `getWorkoutSession`. Threading:

```
page.tsx (session.user_id)
  -> WorkoutLogger (userId prop)
    -> ExerciseCard (userId prop)
      -> SetLogger (userId prop)
```

### 2.4 `OfflineBanner.tsx`

- Uses `navigator.onLine` for initial state
- Listens to `window` `'online'` / `'offline'` events
- Returns `null` when online (zero layout impact)
- Shows a `role="status"` banner with amber background when offline

### 2.5 `SyncStatusDot.tsx`

- `useLiveQuery(() => getPendingSetsCount())` from `dexie-react-hooks`
- Returns `null` when count is `0` or `undefined` (loading state)
- Shows an orange dot + count with `role="status"` and descriptive `aria-label`
- Placed in WorkoutLogger's fixed bottom bar to the left of "Complete Workout"

### 2.6 PWA Icons

`public/icons/icon-192.png` and `icon-512.png` generated using Python's built-in `struct` and
`zlib` modules (no external dependencies). Solid `#0A0A0B` (near-black) background matching
the app's dark theme. Required by `src/app/manifest.ts` for Chrome's PWA install prompt.

---

## 3. Testing

All tests written TDD-first before implementation.

| File                                                     | Tests | Coverage                               |
| -------------------------------------------------------- | ----- | -------------------------------------- |
| `src/lib/offline/sync.test.ts`                           | 10    | logSetOffline (4), syncPendingSets (6) |
| `src/components/workout/OfflineBanner.test.tsx`          | 6     | render, online/offline events, aria    |
| `src/components/workout/SyncStatusDot.test.tsx`          | 5     | render, count, null states, aria       |
| `src/components/workout/__tests__/SetLogger.test.tsx`    | 5     | structure, prop variations             |
| `src/components/workout/__tests__/ExerciseCard.test.tsx` | 7     | structure, injury, rationale           |

Total project tests after Phase 9: **289 tests across 26 test files**.

### TypeScript Gotchas

1. **Background Sync API** not in `lib.dom.d.ts` - requires double cast:
   `(reg as unknown as { sync: { register(tag: string): Promise<void> } })`

2. **`window` cast** in tests - `(window as Record<string, unknown>)` rejected by strict TypeScript;
   requires `(window as unknown as Record<string, unknown>)`

3. **`mockAdd.mock.calls[0][0]`** - TypeScript considers index access possibly `undefined` on
   `calls` arrays; use `calls[0]!` non-null assertion

---

## 4. Decisions Log

| Decision                | Chosen                            | Rejected                                    | Reason                                                  |
| ----------------------- | --------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Sync architecture       | Pure offline-first (always Dexie) | Dual-write (online: server, offline: Dexie) | Simpler, consistent, server action unchanged            |
| UUID generation         | `crypto.randomUUID()`             | `temp-${nextSetNumber}`                     | Stable across Dexie/Supabase, dedup-safe                |
| userId source           | Prop threading from page.tsx      | Zustand store                               | Store doesn't hold userId; page.tsx has session.user_id |
| Icon generation         | Python struct/zlib (built-in)     | canvas npm, ImageMagick, PIL                | No external deps available in environment               |
| SyncStatusDot placement | Fixed bottom bar, left of button  | Inside ExerciseCard                         | Workout-level visibility, not per-exercise              |

---

## 5. PR

ChazWyllie/kairofit#43

**Verify baseline:** 289 tests passing, 0 type errors, 0 lint warnings.
