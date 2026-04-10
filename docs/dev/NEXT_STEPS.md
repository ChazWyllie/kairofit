# KairoFit - Next Steps

_Last updated: 2026-04-10. Baseline: `main` @ f00b208. 327/327 tests passing._

---

## Milestone Status

| Milestone | Status | Reference |
|-----------|--------|-----------|
| A - Phase 10 landing page | COMPLETE | PR #49 / commit 2659e34 |
| B - Unblock stubbed Server Actions (B1/B2/B3) | PENDING | - |
| C - Testing Layer 2 (property-based) | COMPLETE | commit c674c3f |
| D - Testing Layers 3+4 (LLM judge + golden profiles) | COMPLETE | commit c674c3f |
| E - Health data encryption + measurement logging | PENDING | - |

---

## What is built and working

### Foundation (Phases 0-0.5)

- `supabase/migrations/001_initial_schema.sql` - full DB schema + RLS + triggers
- `src/lib/db/supabase.ts` - browser (`createBrowserClient`) + server (`createServerClient`) split
- `src/lib/db/queries/` - typed query functions: profiles, programs, exercises, sessions, recovery, progression
- `src/middleware.ts` - auth route protection; `PUBLIC_ROUTES` includes `/`, `/auth/*`, `/onboarding`
- `src/stores/onboarding.store.ts`, `src/stores/workout.store.ts` - Zustand stores

### Auth (Phase 1)

- `src/app/auth/callback/route.ts` - magic link exchange
- `src/app/(auth)/login/page.tsx`, `signup/page.tsx`

### Onboarding (Phase 2)

- `src/app/onboarding/` - all 23 screens; email gate at step 16; program generation at step 23
- `src/actions/onboarding.actions.ts` - `createAccountAction` (OTP + origin allowlist), `persistOnboardingState`
- `src/actions/program.actions.ts` - `generateProgramAction` (AI + rate limit + resilience chain)
- `src/lib/ai/workout-generator.ts` - Sonnet -> Haiku -> Supabase -> static fallback chain
- `src/lib/ai/workout-validator.ts` - post-generation constraint enforcement (volume caps, injuries, rep ranges)
- `src/lib/onboarding/archetypes.ts` - all 8 archetypes (System Builder, Milestone Chaser, Explorer, Pragmatist, Comeback Kid, Optimizer, Challenger, Understander)

### Dashboard + Workout Logging (Phases 3-4)

- `src/app/(app)/dashboard/page.tsx` - parallel data fetching with `Promise.all`
- `src/components/workout/ProgramCard.tsx`, `TodayWorkout.tsx`, `StatsStrip.tsx`
- `src/app/(app)/workout/[sessionId]/page.tsx` + `WorkoutLogger.tsx`
- `src/components/workout/SetLogger.tsx`, `RestTimer.tsx`, `ExerciseCard.tsx`
- `src/actions/workout.actions.ts` - `startSessionAction`, `logSetAction`, `completeSessionAction`

### Post-Workout + Progressive Overload (Phases 5-6)

- `src/app/(app)/workout/[sessionId]/complete/page.tsx` - streak, heatmap, Kiro debrief, share card
- `src/components/workout/StreakMilestone.tsx`, `src/components/charts/RecoveryHeatmap.tsx`
- `src/components/ai/KiroDebrief.tsx` - streaming inline via `useCompletion`
- `src/app/api/debrief/[sessionId]/route.ts` - SSE streaming, rate-limited
- `src/lib/db/queries/progression.ts` - `getProgressionSuggestionsForDay` (no N+1)
- `src/lib/utils/progressive-overload.ts` - linear / double_progression / rpe_based models

### Analytics + PWA + Offline (Phases 7-9)

- `src/components/providers/PostHogProvider.tsx` - pageview tracking + event taxonomy
- `@serwist/next` service worker (NOT next-pwa; incompatible with Turbopack)
- `src/lib/offline/db.ts` - Dexie.js IndexedDB; `SetLogger` always writes via `logSetOffline()` first
- `src/components/workout/OfflineBanner.tsx`, `SyncStatusDot.tsx`

### Public Landing Page (Phase 10 - PR #49)

- `src/app/page.tsx` - 7-section landing page (Nav, Hero, ScienceHook, HowItWorks, Archetypes, Features, CTA)
- `src/components/marketing/` - LandingNav, HeroSection, ScienceHookSection, HowItWorksSection, ArchetypeSection, FeaturesGrid, LandingCTA
- axios patched 1.13.6 -> 1.15.0 (GHSA-3p68-rc4w-qgx5 SSRF)

### Testing Layers 2-4 (commit c674c3f)

- `src/lib/ai/__tests__/workout-validator.test.ts` - property-based via `fast-check` (Layer 2)
- `src/lib/ai/quality-judge.ts` + `quality-judge.test.ts` - Haiku secondary judge, 11 tests (Layer 3)
- `src/lib/ai/__tests__/golden-profiles/` + `golden-profiles.test.ts` - 8 snapshot regression tests (Layer 4)

---

## Active Work

### Milestone B: Unblock Stubbed Server Actions

One focused PR per action (B1, B2, B3 branch independently from `main`).

**Interfaces (all 4 stubs):**

| Action | File | Shape |
|--------|------|-------|
| `adjustProgramAction` | `src/actions/program.actions.ts:104` | `{ programId: string, feedback: string }` -> `{ success: boolean, updatedProgram?: Program }` |
| `swapExerciseAction` | `src/actions/program.actions.ts:123` | `{ programId: string, dayIndex: number, exerciseId: string, reason?: string }` -> `{ success: boolean, newExerciseId?: string }` |
| `deleteAccountAction` | `src/actions/profile.actions.ts:93` | `{ confirmation: 'DELETE' }` -> `{ success: boolean }` (cascade via `auth.admin.deleteUser`) |
| `logMeasurementAction` | `src/actions/profile.actions.ts:69` | `{ weight_kg?, body_fat_pct?, measurement_date }` -> `{ success: boolean, measurementId?: string }` (blocked on Milestone E) |

**PostHog events to add to `src/lib/utils/event-names.ts`:** `PROGRAM_ADJUSTED`, `EXERCISE_SWAPPED`, `ACCOUNT_DELETED`, `MEASUREMENT_LOGGED`

**B1 - `feat/adjust-program-action`:**
- Resilience chain: Sonnet -> Haiku -> static; circuit breaker key `ADJUSTMENT`; rate limit key `RATE_LIMIT_KEYS.AI_ADJUSTMENT`
- Zod validation + `workout-validator` post-check
- Unit tests: happy, rate-limit, safety-fail, circuit-open, Zod-fail

**B2 - `feat/swap-exercise-action`:**
- Deterministic candidate pool from exercise library (filter by muscle group + equipment + contraindications)
- Kiro picks with rationale via Claude; passes through `safety-filter.ts`
- Unit tests: happy, no-valid-substitute, contraindicated-request

**B3 - `feat/delete-account-action`:**
- Server-only `supabase.auth.admin.deleteUser`; flush Dexie via `clearAllData()` client-side before calling
- Action returns `{ revoke_sessions: true }` so middleware signs user out
- New `src/components/profile/DeleteAccountDialog.tsx` - confirmation UX
- Mount in `src/app/(app)/settings/page.tsx`
- Integration test against local Supabase branch: confirms cascade delete

**Acceptance criteria (per PR):**
- [ ] TDD-first: tests written before implementation
- [ ] `npm test` 327+ green after merge
- [ ] No stubs remain in `program.actions.ts` / `profile.actions.ts` (except `logMeasurementAction` gated on Milestone E)
- [ ] `npm run lint:kiro` passes

---

### Milestone E: Health Data Encryption + Measurement Logging

**Database migration - `supabase/migrations/003_health_data_encryption.sql`:**
- `CREATE EXTENSION IF NOT EXISTS pgcrypto`
- Encrypted columns on `measurements`: `weight_kg_encrypted`, `body_fat_pct_encrypted`
- `encryption_key_version smallint` for rotation
- Helper functions: `encrypt_health_metric(value, user_id)`, `decrypt_health_metric(ciphertext, user_id)`
- Updated RLS policies with both `USING` and `WITH CHECK` (see `skills/rls-migration-checklist/`)

**New code:**
- `src/lib/db/encryption.ts` - TypeScript wrapper for encrypt/decrypt helpers
- Implement `logMeasurementAction` using encryption helper
- `src/components/profile/MeasurementLogger.tsx` - form
- `src/components/profile/MeasurementHistory.tsx` - chart reader
- Mount both in `src/app/(app)/settings/page.tsx`

**Acceptance criteria:**
- [ ] Measurements round-trip via encryption (integration test against local Supabase)
- [ ] RLS denies cross-user reads even in test environment
- [ ] Zero plaintext health values in `measurements` table post-migration
- [ ] `MEASUREMENT_LOGGED` event captured
- [ ] `skills/health-data-encryption/SKILL.md` updated with real implementation example

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `adjustProgramAction` mutates program mid-week, losing workout history | Medium | High | Write to new program version; keep old version for completed sessions |
| `deleteAccountAction` race with in-flight Dexie sync leaves orphaned IndexedDB data | Medium | Medium | Flush Dexie client-side before calling action; action returns `revoke_sessions: true` |
| `pgcrypto` key stored in env var is single point of failure | High | High | Use `pgsodium` (Supabase managed) or Vault pattern with `encryption_key_version`; document recovery before enabling in prod |

---

## Out of scope

- Phase 12 social features (leaderboards, friends) - blocked on `NEXT_PUBLIC_SOCIAL_ENABLED` + schema
- Stripe paywall activation - separate launch decision gated on retention data
- Testing Layer 5 (A/B production) - requires real traffic
- RAG / pgvector - deferred per CLAUDE.md; trigger is >15% swap rate or system prompt >4000 tokens
- Capacitor mobile wrapper - post-revenue
- Nutrition / Wearables - flagged off, not scaffolded
- Light theme - dark theme is permanent per CLAUDE.md
- Localization / i18n - English only at launch

---

## Key files reference

| File | Purpose |
|------|---------|
| `src/lib/ai/workout-generator.ts` | AI generation with resilience chain |
| `src/lib/ai/workout-validator.ts` | Post-generation constraint enforcement |
| `src/lib/ai/safety-filter.ts` | Input safety check before every Claude call |
| `src/lib/ai/circuit-breaker.ts` | Redis-backed circuit breaker (Upstash) |
| `src/lib/ai/quality-judge.ts` | Haiku secondary judge for generation quality |
| `src/lib/utils/progressive-overload.ts` | Deterministic overload calculations |
| `src/lib/utils/recovery-model.ts` | SRA curve per muscle group |
| `src/lib/utils/rate-limit.ts` | Upstash Redis rate limiting |
| `src/lib/onboarding/archetypes.ts` | All 8 archetypes (source of truth) |
| `src/actions/program.actions.ts` | generateProgram + stubs for adjust/swap |
| `src/actions/profile.actions.ts` | Profile read/write + stubs for delete/measurement |
| `src/app/page.tsx` | Public landing page (Phase 10) |
| `src/middleware.ts` | Auth route protection + PUBLIC_ROUTES |
| `supabase/migrations/001_initial_schema.sql` | Full DB schema + RLS + triggers |

---

## How to run locally

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
