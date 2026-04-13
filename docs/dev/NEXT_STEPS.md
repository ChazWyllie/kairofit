# KairoFit - Next Steps

_Last updated: 2026-04-10. Baseline: `main` @ 2659e34. 327/327 tests passing._

---

## Milestone Status

| Milestone | Description                                      | Status   | Reference               |
| --------- | ------------------------------------------------ | -------- | ----------------------- |
| A         | Public landing page (Phase 10)                   | COMPLETE | PR #49 / commit 2659e34 |
| B1        | adjust-program-action                            | COMPLETE | PR #50                  |
| B2        | swap-exercise-action                             | COMPLETE | PR #52                  |
| B3        | delete-account-action                            | PENDING  | -                       |
| C         | Testing Layer 2 (property-based)                 | COMPLETE | commit c674c3f          |
| D         | Testing Layers 3+4 (LLM judge + golden profiles) | COMPLETE | commit c674c3f          |
| E         | Health data encryption + measurement logging     | PENDING  | -                       |

---

## Architecture Overview

### 2.1 - Request and Auth Flow

```
Browser
  └── Next.js Edge Middleware (src/middleware.ts)
       ├── PUBLIC_ROUTES
       │    ├── /                    (landing page)
       │    ├── /auth/*              (magic link callback)
       │    ├── /onboarding/*        (pre-auth quiz)
       │    ├── /api/webhooks        (Stripe - self-authenticating)
       │    └── /api/sync            (auth handled inside route)
       │         └── pass through → handler
       │
       └── PROTECTED /(app)/*
            └── Supabase SSR session check (createServerClient)
                 ├── valid session → forward request
                 └── no session → redirect /login

Server Action middleware chain (next-safe-action v7):
  Raw input
    → Zod schema validation          (src/lib/validation/schemas.ts)
    → Auth check                     (supabase.auth.getUser())
    → Rate limit check               (src/lib/utils/rate-limit.ts, Upstash Redis)
    → Business logic handler
    → PostHog analytics event        (after() - non-blocking, fires post-response)
```

### 2.2 - AI Generation Resilience Chain

```
User triggers program generation / adjustment
  └── safety-filter.ts
       └── Blocks prompt injections and unsafe content before any Claude call
            └── circuit-breaker.ts (Upstash Redis state)
                 │  Key: PROGRAM_GENERATION | ADJUSTMENT | DEBRIEF | INTAKE
                 │  Window: 60s | Threshold: 5 failures | Recovery: 300s
                 │
                 ├── OPEN → throw CircuitOpenError (skip all Claude calls)
                 └── CLOSED / HALF-OPEN
                      └── workout-generator.ts
                           ├── 1. Claude Sonnet 4.6 (primary)
                           │        structured output, ~2000-token cached system prompt
                           ├── 2. Claude Haiku 4.5 (fallback - Sonnet error or timeout)
                           ├── 3. Supabase exercise library query (fallback - Haiku error)
                           └── 4. Static fallback JSON (scripts/generate-fallback-programs.ts)
                                └── workout-validator.ts
                                     │  Enforces: volume caps (level-specific), rep ranges,
                                     │  rest periods, contraindications, set count limits
                                     └── quality-judge.ts (Haiku secondary judge)
                                          │  Scores 5 dimensions: safety, scientific accuracy,
                                          │  personalization, Kiro voice, completeness
                                          │  Threshold: 4/5 minimum to accept
                                          └── return { program, source, rationale }
                                               source: "sonnet" | "haiku" | "supabase" | "static"
```

### 2.3 - Offline-First Workout Logging Flow

```
User logs a set (online or offline)
  └── SetLogger.tsx
       └── logSetOffline(set)
            └── Dexie.js IndexedDB write (src/lib/offline/db.ts)
                 │  Always succeeds - no network dependency
                 │  Status: "pending" | "synced" | "failed"
                 └── navigator.serviceWorker.ready.sync.register("sync-workout-sets")

                              [network available]
                                      |
Serwist Service Worker (src/app/sw.ts)
  └── on "sync" event: "sync-workout-sets"
       └── syncPendingSets()
            └── query Dexie for pending rows
                 └── POST /api/sync/workout-sets (batched payload)
                      └── Supabase INSERT workout_sets
                           │  RLS: auth.uid() must own the workout_session
                           ├── success → mark Dexie rows synced; update SyncStatusDot
                           └── failure → leave as pending; retry on next sync event

UI feedback components:
  SyncStatusDot  ← live pending count from Dexie useLiveQuery()
  OfflineBanner  ← navigator.onLine + "online"/"offline" events
```

### 2.4 - Database Schema

```
auth.users (Supabase managed)
  └── profiles (1:1, RLS: user owns row)
       ├── id, email, created_at, updated_at
       ├── experience_level (1-5), archetype (KairoArchetype enum)
       ├── kiro_persona_enabled boolean DEFAULT true
       └── [Milestone E] health fields - column-level pgcrypto encryption

programs (many per user, RLS: user owns)
  └── program_days (7 per program, indexed by day_of_week 0-6)
       └── program_exercises (ordered list, position column)
            └── exercises (shared library, ~150 seeded, RLS: read-only for all auth)
                 ├── muscle_groups[], equipment[], difficulty
                 ├── contraindications[] (injury flags)
                 └── science_rationale (Layer 1-3 display)

workout_sessions (1 per started workout, RLS: user owns)
  └── workout_sets (1 per logged set, RLS: user owns via session)
       ├── TRIGGER after INSERT → updates muscle_recovery (SRA curve decay)
       └── TRIGGER after INSERT → upserts personal_records (weight/reps PRs)

muscle_recovery (per user per muscle_group, RLS: user owns)
  └── muscle_group, last_trained_at, recovery_pct, updated_at

personal_records (per user per exercise, RLS: user owns)
  └── exercise_id, best_weight_kg, best_reps, achieved_at

[Milestone E] measurements (per user, RLS: user owns)
  ├── weight_kg_encrypted bytea (pgcrypto, AES, key derived from user_id + app secret)
  ├── body_fat_pct_encrypted bytea
  ├── encryption_key_version smallint (rotation support)
  └── measurement_date date
```

### 2.5 - Component Tree

```
app/layout.tsx
  └── Providers: PostHogProvider, ThemeProvider (dark only, no toggle)
       │
       ├── page.tsx  →  Marketing landing page  [Milestone A]
       │    └── src/components/marketing/
       │         ├── LandingNav.tsx
       │         ├── HeroSection.tsx
       │         ├── ScienceHookSection.tsx
       │         ├── HowItWorksSection.tsx
       │         ├── ArchetypeSection.tsx
       │         ├── FeaturesGrid.tsx
       │         └── LandingCTA.tsx
       │
       ├── (auth)/
       │    ├── login/page.tsx
       │    └── signup/page.tsx
       │         (no app shell - standalone layout)
       │
       ├── onboarding/[step]/page.tsx  →  22-screen wizard
       │    ├── src/components/onboarding/  (screen components per step)
       │    └── src/stores/onboarding.store.ts  (Zustand, persisted)
       │
       └── (app)/layout.tsx  →  Authenticated shell
            ├── dashboard/page.tsx
            │    ├── ProgramCard.tsx
            │    ├── TodayWorkout.tsx
            │    ├── StatsStrip.tsx
            │    └── RecoveryHeatmap.tsx
            │
            ├── workout/[sessionId]/page.tsx
            │    ├── WorkoutLogger.tsx  (orchestrator)
            │    ├── ExerciseCard.tsx
            │    ├── SetLogger.tsx      (writes Dexie-first)
            │    ├── RestTimer.tsx
            │    ├── OfflineBanner.tsx
            │    └── SyncStatusDot.tsx
            │
            ├── workout/[sessionId]/complete/page.tsx
            │    ├── StreakMilestone.tsx
            │    ├── RecoveryHeatmap.tsx
            │    ├── KiroDebrief.tsx    (streaming via useCompletion)
            │    └── ShareCard.tsx      (on demand)
            │
            └── settings/page.tsx  →  [Milestones B3 + E]
                 ├── DeleteAccountDialog.tsx  (Milestone B3 - to build)
                 ├── MeasurementLogger.tsx    (Milestone E - to build)
                 └── MeasurementHistory.tsx   (Milestone E - to build)
```

---

## Completed Milestones

### Milestone A - Public Landing Page (Phase 10, PR #49)

- `src/app/page.tsx` - 7-section landing page (server component)
- `src/components/marketing/` - LandingNav, HeroSection, ScienceHookSection, HowItWorksSection, ArchetypeSection, FeaturesGrid, LandingCTA
- axios patched 1.13.6 -> 1.15.0 (GHSA-3p68-rc4w-qgx5 SSRF)

### Milestone C - Testing Layer 2: Property-Based (commit c674c3f)

- `src/lib/ai/__tests__/workout-validator.test.ts` - `fast-check` generates random `UserProfile` objects; verifies volume caps, contraindications, and rep ranges hold universally

### Milestone D - Testing Layers 3+4: LLM Judge + Golden Profiles (commit c674c3f)

- `src/lib/ai/quality-judge.ts` - Haiku secondary judge, 5 dimensions, score >= 4/5 threshold
- `src/lib/ai/__tests__/quality-judge.test.ts` - 11 tests
- `src/lib/ai/__tests__/golden-profiles/` - 8 expert-validated profile fixtures
- `src/lib/ai/__tests__/golden-profiles.test.ts` - snapshot regression against golden profiles

### Phases 0-9 (Foundation through PWA+Offline)

**Foundation (Phases 0-0.5)**

- `supabase/migrations/001_initial_schema.sql` - full DB schema + RLS + triggers
- `src/lib/db/supabase.ts` - `createBrowserClient` + `createServerClient` split
- `src/lib/db/queries/` - typed query functions: profiles, programs, exercises, sessions, recovery, progression
- `src/middleware.ts` - auth route protection
- `src/stores/onboarding.store.ts`, `src/stores/workout.store.ts`

**Auth (Phase 1)**

- `src/app/auth/callback/route.ts` - magic link exchange
- `src/app/(auth)/login/page.tsx`, `signup/page.tsx`

**Onboarding (Phase 2)**

- `src/app/onboarding/` - all 22 screens; email gate at step 16; program generation at step 22
- `src/actions/onboarding.actions.ts` - `createAccountAction` (OTP + origin allowlist), `persistOnboardingState`
- `src/actions/program.actions.ts` - `generateProgramAction` (AI + rate limit + resilience chain)
- `src/lib/ai/workout-generator.ts` - Sonnet -> Haiku -> Supabase -> static fallback chain
- `src/lib/ai/workout-validator.ts` - post-generation constraint enforcement
- `src/lib/onboarding/archetypes.ts` - all 8 archetypes (source of truth)

**Dashboard + Workout Logging (Phases 3-4)**

- `src/app/(app)/dashboard/page.tsx` - parallel data fetching with `Promise.all`
- `src/components/workout/ProgramCard.tsx`, `TodayWorkout.tsx`, `StatsStrip.tsx`
- `src/app/(app)/workout/[sessionId]/page.tsx` + `WorkoutLogger.tsx`
- `src/components/workout/SetLogger.tsx`, `RestTimer.tsx`, `ExerciseCard.tsx`
- `src/actions/workout.actions.ts` - `startSessionAction`, `logSetAction`, `completeSessionAction`

**Post-Workout + Progressive Overload (Phases 5-6)**

- `src/app/(app)/workout/[sessionId]/complete/page.tsx` - streak, heatmap, Kiro debrief, share card
- `src/components/workout/StreakMilestone.tsx`, `src/components/charts/RecoveryHeatmap.tsx`
- `src/components/ai/KiroDebrief.tsx` - streaming inline via `useCompletion`
- `src/app/api/debrief/[sessionId]/route.ts` - SSE streaming, rate-limited
- `src/lib/db/queries/progression.ts` - `getProgressionSuggestionsForDay` (no N+1)
- `src/lib/utils/progressive-overload.ts` - linear / double_progression / rpe_based models

**Analytics + PWA + Offline (Phases 7-9)**

- `src/components/providers/PostHogProvider.tsx` - pageview tracking + event taxonomy
- `@serwist/next` service worker (NOT next-pwa; incompatible with Turbopack)
- `src/lib/offline/db.ts` - Dexie.js IndexedDB; `SetLogger` always writes via `logSetOffline()` first
- `src/components/workout/OfflineBanner.tsx`, `SyncStatusDot.tsx`

---

## Active Milestone B - Unblock Stubbed Server Actions

One focused PR per sub-milestone, each branching independently from `main`.

### Interfaces (all 4 stubs)

| Action                 | File                                 | Input                                                                          | Output                                           |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| `adjustProgramAction`  | `src/actions/program.actions.ts:104` | `{ programId: string, feedback: string }`                                      | `{ success: boolean, updatedProgram?: Program }` |
| `swapExerciseAction`   | `src/actions/program.actions.ts:123` | `{ programId: string, dayIndex: number, exerciseId: string, reason?: string }` | `{ success: boolean, newExerciseId?: string }`   |
| `deleteAccountAction`  | `src/actions/profile.actions.ts:93`  | `{ confirmation: 'DELETE' }`                                                   | `{ success: boolean }`                           |
| `logMeasurementAction` | `src/actions/profile.actions.ts:69`  | `{ weight_kg?: number, body_fat_pct?: number, measurement_date: string }`      | `{ success: boolean, measurementId?: string }`   |

`logMeasurementAction` is gated on Milestone E completion. The other three are unblocked now.

**PostHog events to add to `src/lib/utils/event-names.ts`:**
`PROGRAM_ADJUSTED`, `EXERCISE_SWAPPED`, `ACCOUNT_DELETED`, `MEASUREMENT_LOGGED`

---

### Milestone B1 - `feat/adjust-program-action` - COMPLETE

**PR:** ChazWyllie/kairofit#50 - merged 2026-04-11

**Deliverables:**

- [x] Implement `adjustProgramAction` stub in `src/actions/program.actions.ts`
- [x] Resilience chain: Sonnet -> Haiku; circuit breaker key `CIRCUITS.ADJUSTMENT`; rate limit key `RATE_LIMIT_KEYS.AI_ADJUST`
- [x] `checkInputSafety` called before every Claude call
- [x] `validateWorkoutProgram` post-check with conservative defaults `(rawProgram, 3, [], [])`
- [x] Version-copy strategy: `saveProgramToDb` deactivates old, saves adjusted as new active
- [x] `PROGRAM_ADJUSTED` PostHog event via `after()` (non-blocking)
- [x] `getProgramById(programId, userId)` added to `src/lib/db/queries/programs.ts` (RLS-scoped)

**Unit tests (TDD-first) - 5/5 passing:**

- [x] happy path: returns `updatedProgram` with valid shape
- [x] rate-limit hit: returns `serverError`
- [x] safety-filter rejection: returns `serverError`
- [x] circuit-open: returns `serverError`
- [x] Zod validation failure: returns `validationErrors`

**Acceptance criteria:**

- [x] TDD-first: tests written before implementation
- [x] `npm test` 332/332 green
- [x] `npm run lint:kiro` passes
- [x] `npm run typecheck` passes
- [x] Stub replaced with real implementation

---

### Milestone B2 - `feat/swap-exercise-action`

**Deliverables:**

- Implement `swapExerciseAction` stub in `src/actions/program.actions.ts:123`
- Deterministic candidate pool: filter exercise library by muscle group + equipment + contraindications
- Kiro picks with rationale via Claude; output passes through `safety-filter.ts`
- No network call if no valid substitute exists (return `{ success: false, newExerciseId: undefined }`)

**Unit tests (TDD-first):**

- [ ] happy path: returns `newExerciseId` from valid candidate pool
- [ ] no valid substitute: returns `{ success: false }` without erroring
- [ ] contraindicated request: safety filter blocks; returns `{ success: false, error: "contraindicated" }`

**Acceptance criteria:**

- [ ] TDD-first: tests written before implementation
- [ ] `npm test` 327+ green
- [ ] Stub at `program.actions.ts:123` replaced

---

### Milestone B3 - `feat/delete-account-action`

**Deliverables:**

- Implement `deleteAccountAction` stub in `src/actions/profile.actions.ts:93`
- Server-only `supabase.auth.admin.deleteUser` (cascade deletes all user data via FK)
- Action returns `{ success: true, revoke_sessions: true }` so middleware signs user out
- New `src/components/profile/DeleteAccountDialog.tsx` - confirmation input UX ("type DELETE to confirm")
- Mount `DeleteAccountDialog` in `src/app/(app)/settings/page.tsx`
- Client must flush Dexie via `clearAllData()` before calling the action (race guard - see Risks)
- Integration test against local Supabase branch: confirms cascade delete removes sessions + sets

**Acceptance criteria:**

- [ ] TDD-first: tests written before implementation
- [ ] `npm test` 327+ green
- [ ] Dialog requires typing "DELETE" before button enables
- [ ] Dexie flush confirmed before server action call
- [ ] Cascade delete verified in integration test
- [ ] Stub at `profile.actions.ts:93` replaced

---

## Active Milestone E - Health Data Encryption + Measurement Logging

### Database Migration - `supabase/migrations/003_health_data_encryption.sql`

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted columns on measurements table
ALTER TABLE measurements
  ADD COLUMN weight_kg_encrypted bytea,
  ADD COLUMN body_fat_pct_encrypted bytea,
  ADD COLUMN encryption_key_version smallint NOT NULL DEFAULT 1;

-- Helper functions (key derived from user_id + ENCRYPTION_SECRET env var)
CREATE FUNCTION encrypt_health_metric(value numeric, user_id uuid) RETURNS bytea ...
CREATE FUNCTION decrypt_health_metric(ciphertext bytea, user_id uuid) RETURNS numeric ...

-- RLS: both USING and WITH CHECK on all write-capable policies
-- See skills/rls-migration-checklist/ for the FOR ALL + WITH CHECK requirement
```

### New Code

| File                                            | Purpose                                                  |
| ----------------------------------------------- | -------------------------------------------------------- |
| `src/lib/db/encryption.ts`                      | TypeScript wrapper for encrypt/decrypt helpers           |
| `src/actions/profile.actions.ts:69`             | Implement `logMeasurementAction` using encryption helper |
| `src/components/profile/MeasurementLogger.tsx`  | Form: weight + body fat input with date                  |
| `src/components/profile/MeasurementHistory.tsx` | Chart: decrypted measurement history                     |

Mount `MeasurementLogger` and `MeasurementHistory` in `src/app/(app)/settings/page.tsx`.

### Acceptance Criteria

- [ ] Measurements round-trip via encryption (integration test against local Supabase)
- [ ] RLS denies cross-user reads even with direct SQL access in test environment
- [ ] Zero plaintext health values in `measurements` table post-migration
- [ ] `MEASUREMENT_LOGGED` PostHog event captured
- [ ] `skills/health-data-encryption/SKILL.md` updated with real implementation example
- [ ] `logMeasurementAction` stub at `profile.actions.ts:69` replaced

---

## Risks

| Risk                                                                                | Likelihood | Impact | Mitigation                                                                                                                  |
| ----------------------------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `adjustProgramAction` mutates program mid-week, losing workout history              | Medium     | High   | Write to new program version; keep old version for completed sessions                                                       |
| `deleteAccountAction` race with in-flight Dexie sync leaves orphaned IndexedDB data | Medium     | Medium | Flush Dexie client-side before calling action; action returns `revoke_sessions: true`                                       |
| `pgcrypto` key stored in env var is single point of failure                         | High       | High   | Use `pgsodium` (Supabase managed) or Vault pattern with `encryption_key_version`; document recovery before enabling in prod |

---

## Out of Scope

- Phase 12 social features (leaderboards, friends) - blocked on `NEXT_PUBLIC_SOCIAL_ENABLED` + schema
- Stripe paywall activation - separate launch decision gated on retention data
- Testing Layer 5 (A/B production) - requires real traffic
- RAG / pgvector - deferred; trigger is >15% swap rate or system prompt >4000 tokens
- Capacitor mobile wrapper - post-revenue
- Nutrition / Wearables - flagged off, not scaffolded
- Light theme - dark theme is permanent
- Localization / i18n - English only at launch

---

## Key Files Reference

| File                                         | Purpose                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/actions/program.actions.ts`             | `generateProgramAction` + stubs for `adjustProgramAction` / `swapExerciseAction` |
| `src/actions/profile.actions.ts`             | Profile read/write + stubs for `deleteAccountAction` / `logMeasurementAction`    |
| `src/lib/ai/workout-generator.ts`            | AI generation resilience chain (Sonnet -> Haiku -> Supabase -> static)           |
| `src/lib/ai/workout-validator.ts`            | Post-generation constraint enforcement (volume caps, injuries, rep ranges)       |
| `src/lib/ai/safety-filter.ts`                | Input safety check before every Claude call                                      |
| `src/lib/ai/circuit-breaker.ts`              | Redis-backed circuit breaker (Upstash) - NOT in-memory                           |
| `src/lib/ai/quality-judge.ts`                | Haiku secondary judge for generation quality                                     |
| `src/lib/utils/progressive-overload.ts`      | Deterministic overload calculations                                              |
| `src/lib/utils/recovery-model.ts`            | SRA curve per muscle group                                                       |
| `src/lib/utils/rate-limit.ts`                | Upstash Redis rate limiting                                                      |
| `src/lib/onboarding/archetypes.ts`           | All 8 archetypes (source of truth)                                               |
| `src/lib/offline/db.ts`                      | Dexie.js IndexedDB schema                                                        |
| `src/middleware.ts`                          | Auth route protection + PUBLIC_ROUTES                                            |
| `src/app/page.tsx`                           | Public landing page (Milestone A)                                                |
| `supabase/migrations/001_initial_schema.sql` | Full DB schema + RLS + triggers                                                  |
| `src/lib/utils/event-names.ts`               | PostHog event name constants (add B/E events here)                               |

---

## How to Run Locally

```bash
git clone <repo-url>
cd kairofit
npm install

cp .env.example .env.local
# Required: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
# Required: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
# Required: NEXT_PUBLIC_APP_URL (e.g. http://localhost:3000)

npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push        # apply schema + triggers
npm run db:types       # generate TypeScript types <- REQUIRED before dev
npm run db:seed        # seed exercise library

npm run dev            # localhost:3000
```

`npm run db:types` MUST run after `db:push`. Skipping it causes a TypeScript missing-module error.
