/**
 * Offline Database (Dexie.js / IndexedDB)
 *
 * Schema mirrors the Supabase tables for workout logging.
 * Offline-first: write here first, sync to Supabase when connected.
 *
 * See skills/offline-sync-pattern/SKILL.md for the full implementation guide.
 *
 * TODO: Implement sync.ts to drain pending sets to Supabase
 */

import Dexie, { type Table } from 'dexie'

// ============================================================
// LOCAL TYPES (offline versions of DB types)
// ============================================================

export interface LocalWorkoutSet {
  id: string                  // Client-generated UUID (stable across sync)
  session_id: string
  exercise_id: string
  user_id: string
  set_number: number
  reps_completed: number
  weight_kg: number | null
  rpe: number | null
  is_warmup: boolean
  is_dropset: boolean
  logged_at: string           // ISO timestamp
  sync_status: 'pending' | 'synced' | 'failed'
  sync_attempts: number
  last_sync_attempt: string | null
}

export interface LocalWorkoutSession {
  id: string                  // Client-generated UUID
  user_id: string
  program_day_id: string | null
  program_id: string | null
  started_at: string
  status: 'in_progress' | 'completed' | 'skipped'
  sync_status: 'pending' | 'synced' | 'failed'
  sync_attempts: number
}

// ============================================================
// DATABASE DEFINITION
// ============================================================

class KairoFitOfflineDB extends Dexie {
  workout_sets!: Table<LocalWorkoutSet, string>
  workout_sessions!: Table<LocalWorkoutSession, string>

  constructor() {
    super('kairofit_offline')

    this.version(1).stores({
      // Indexed fields: id (primary), plus fields used in WHERE clauses
      workout_sets: 'id, session_id, user_id, sync_status, logged_at',
      workout_sessions: 'id, user_id, sync_status, started_at',
    })
  }
}

// Export singleton instance
const db = new KairoFitOfflineDB()
export default db

// ============================================================
// HELPERS
// ============================================================

/**
 * Get count of sets pending sync.
 * Used for the sync status indicator in the workout UI.
 */
export async function getPendingSetsCount(): Promise<number> {
  return db.workout_sets.where('sync_status').equals('pending').count()
}

/**
 * Get all pending sets for sync.
 * Called by the background sync handler.
 */
export async function getPendingSets(): Promise<LocalWorkoutSet[]> {
  return db.workout_sets.where('sync_status').equals('pending').toArray()
}

/**
 * Mark sets as synced after successful Supabase write.
 */
export async function markSetsAsSynced(setIds: string[]): Promise<void> {
  await db.workout_sets
    .where('id')
    .anyOf(setIds)
    .modify({ sync_status: 'synced' })
}

/**
 * Mark sets as failed after a sync error.
 */
export async function markSetsAsFailed(setIds: string[]): Promise<void> {
  await db.workout_sets
    .where('id')
    .anyOf(setIds)
    .modify((set: LocalWorkoutSet) => {
      set.sync_status = 'failed'
      set.sync_attempts = (set.sync_attempts || 0) + 1
      set.last_sync_attempt = new Date().toISOString()
    })
}
