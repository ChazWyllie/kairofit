# KairoFit - Next Steps

_Last updated: 2026-04-09. Reflects state after Phase 10 (public landing page). 327/327 tests passing._

---

## What is built and working

### Foundation (Phase 0+0.5)

- Full DB schema + RLS + triggers (`supabase/migrations/001_initial_schema.sql`)
- Supabase client split: server (`createServerClient`) + browser (`createBrowserClient`)
- Query layer: `src/lib/db/queries/` - profiles, programs, exercises, sessions, recovery
- Action stubs: `workout.actions.ts`, `program.actions.ts`, `profile.actions.ts`
- App shell: layout with `BottomNav`, placeholder dashboard, middleware route protection
- Zustand stores: `onboarding.store.ts` (with `persist` middleware), `workout.store.ts`

### Auth infrastructure (Phase 1)

- `src/app/auth/callback/route.ts` - exchanges magic link code for session, redirects
- `src/app/(auth)/login/page.tsx` - magic link login form with `createAccountAction`
- `src/app/(auth)/signup/page.tsx` - signup form (reuses auth flow)
- `src/middleware.ts` - protects all `(app)` routes, redirects unauthenticated to `/login`

### Onboarding-to-dashboard flow (Phase 2)

- All 23 onboarding quiz screens complete (Steps 1-23)
- Step 17 (`email-gate`) - triggers `createAccountAction`, sends OTP magic link
- Step 23 (`program-building`) - awaits `auth_ready`, calls `persistOnboardingState` + `generateProgramAction`, redirects to `/dashboard`
- `src/actions/onboarding.actions.ts` - `createAccountAction` (OTP with origin allowlist), `persistOnboardingState` (Zod-validated, writes to profiles)
- `src/actions/program.actions.ts` - `generateProgramAction` (AI generation, rate-limited, resilience chain)
- `src/lib/ai/workout-generator.ts` - full AI generation with Sonnet/Haiku fallback + static fallback
- `src/lib/ai/workout-validator.ts` - post-generation constraint enforcement (volume caps, injuries, rep ranges)
- `src/app/(app)/dashboard/page.tsx` - minimal dashboard showing active program

### Security hardening

- `createAccountAction` origin allowlist prevents OTP token-hijacking via crafted Origin header
- `onboardingStateSchema.parse(state)` validates all client-supplied state at DB write boundary
- RLS enforced on all tables; no service role key exposed to client

### Test coverage (327/327 passing)

Test suite expanded through Phases 7-10. All 327 unit tests green. Includes property-based tests (Layer 2), quality-judge tests (Layer 3), and golden-profile regression tests (Layer 4).

### Analytics (Phase 8)

PostHog instrumentation across all critical user flows. Events fire via `after()` so they never delay responses.

- `ONBOARDING_STEP_COMPLETED`, `PROGRAM_GENERATED`, `WORKOUT_STARTED`, `SET_LOGGED`, `WORKOUT_COMPLETED`, `KIRO_DEBRIEF_VIEWED`
- `src/components/providers/PostHogProvider.tsx` - client-side PostHog init with pageview tracking
- All events use taxonomy defined in `skills/posthog-event-taxonomy/`

### PWA + Offline (Phase 9)

App installs to home screen and works offline during workouts.

- `@serwist/next` service worker (NOT next-pwa - incompatible with Turbopack)
- `src/lib/offline/db.ts` - Dexie.js IndexedDB schema for queued sets
- `src/components/workout/OfflineBanner.tsx` - network status indicator
- `src/components/workout/SyncStatusDot.tsx` - per-set sync state indicator
- `SetLogger` always writes via `logSetOffline()` first; background sync handles server persistence
- `public/sw.js` - compiled service worker asset

### Public Landing Page (Phase 10)

Marketing page at `/` converts new visitors to onboarding starters. Merged as PR #49 (commit 2659e34).

- `src/app/page.tsx` - landing page shell (Server Component)
- `src/components/marketing/LandingNav.tsx` - sticky nav with scroll state
- `src/components/marketing/HeroSection.tsx` - full-viewport hero with Framer Motion
- `src/components/marketing/ScienceHookSection.tsx` - 3-layer science transparency visual
- `src/components/marketing/HowItWorksSection.tsx` - 3-step numbered flow
- `src/components/marketing/FeaturesGrid.tsx` - 6 feature tiles
- `src/components/marketing/LandingCTA.tsx` - bottom full-width CTA
- `src/middleware.ts` - `'/'` added to `PUBLIC_ROUTES`
- axios patched to 1.15.0 (GHSA-3p68-rc4w-qgx5 SSRF fix)

### Testing Layers 2-4 (Phase 11 partial)

Completed in commit c674c3f alongside Phase 9 work.

- `src/lib/ai/__tests__/workout-validator.test.ts` - property-based tests via `fast-check` (Layer 2)
- `src/lib/ai/quality-judge.ts` - Haiku secondary-judge for 5 quality dimensions (Layer 3)
- `src/lib/ai/__tests__/quality-judge.test.ts` - 11 tests for quality judge (Layer 3)
- `src/lib/ai/__tests__/golden-profiles/` - expert-validated profile fixtures (Layer 4)
- `src/lib/ai/__tests__/golden-profiles.test.ts` - 8 snapshot regression tests (Layer 4)

Layer 5 (A/B production via PostHog ratio tracking) remains deferred.

### Dashboard UI (Phase 3)

Real home screen replacing the placeholder. Built on `feature/phase-3-dashboard`, merged via PR.

- `src/app/(app)/dashboard/page.tsx` - server component, parallel data fetching with `Promise.all`
- `src/components/workout/ProgramCard.tsx` - program name, archetype badge, week X of Y
- `src/components/workout/TodayWorkout.tsx` - next unlogged day with exercise list; handles week-complete and no-program states
- `src/components/workout/StatsStrip.tsx` - streak (orange if >0) and weekly volume
- `src/lib/db/queries/sessions.ts` - added `getNextProgramDay` (returns first unlogged day in current week)

### Workout Logging (Phase 4)

Full set-logging flow. Users start a session, log reps/weight per exercise, use the rest timer, and complete the session.

- `src/app/(app)/workout/[sessionId]/page.tsx` + `WorkoutLogger.tsx` - active workout view
- `src/components/workout/SetLogger.tsx`, `RestTimer.tsx`, `ExerciseCard.tsx`, `StartWorkoutButton.tsx`
- `src/actions/workout.actions.ts` - `startSessionAction`, `logSetAction`, `completeSessionAction`
- `completeSessionAction` uses `after()` to update muscle recovery non-blocking

### Post-Workout Experience (Phase 5)

Four-step post-workout sequence. Rendered at `/workout/[sessionId]/complete`.

- `src/app/(app)/workout/[sessionId]/complete/page.tsx` - server component, loads session data
- `src/components/workout/StreakMilestone.tsx` - streak count + milestone animation (Framer Motion)
- `src/components/charts/RecoveryHeatmap.tsx` - 13-muscle recovery visualization
- `src/components/ai/KiroDebrief.tsx` - streaming inline Kiro debrief via `useCompletion`
- `src/components/social/ShareCard.tsx` - on-demand shareable workout card
- `src/app/api/debrief/[sessionId]/route.ts` - SSE streaming endpoint, rate-limited
- `src/lib/db/queries/sessions.ts` - `getCompletedSessionSummary` + `getStreakCount`

### Progressive Overload (Phase 6)

Deterministic next-session targets displayed inline on each exercise card during a workout.

- `src/lib/db/queries/sessions.ts` - added `getRecentPerformance(userId, exerciseId, limit?)` - fetches last N work sets from completed sessions
- `src/lib/db/queries/progression.ts` - NEW: `getProgressionSuggestionsForDay(userId, programDay)` - accepts ProgramDay directly (avoids N+1), orchestrates per-exercise suggestions
- `src/lib/utils/progressive-overload.ts` - `ProgressionResult` now includes `units: 'metric' | 'imperial'` so the UI renders the correct weight suffix
- `src/components/workout/ExerciseCard.tsx` - added `progression?: ProgressionResult` prop + `ProgressionHint` sub-component (uses `progression.units` for kg/lbs label)
- `src/app/(app)/workout/[sessionId]/WorkoutLogger.tsx` - threads `suggestions` prop from page through to each ExerciseCard
- `src/app/(app)/workout/[sessionId]/page.tsx` - fetches programDay then passes it to getProgressionSuggestionsForDay (no duplicate DB call)

**Three progression models** (scheme set per-exercise by AI at generation time):

- `linear` - add weight every session when all reps hit (levels 1-2 typical)
- `double_progression` - increase reps within range, then bump weight and reset (level 3 typical)
- `rpe_based` - maintain/increase/decrease based on average RPE vs. target zone 7-9 (levels 4-5 typical)

No DB migration required - suggestions are computed at render time and displayed as hints only.

---

## What to build next

### Milestone B: Unblock stubbed Server Actions

Three stubs remain in the action layer. Each ships as its own focused PR.

**B1 - Program adjustment** (`src/actions/program.actions.ts:104`):

- Implement `adjustProgramAction` via Claude (currently returns a stub)
- Rate-limited, same resilience chain as `generateProgramAction`
- Branch: `feat/adjust-program-action`

**B2 - Exercise swap** (`src/actions/program.actions.ts:123`):

- Implement `swapExerciseAction` - substitution reasoning via Kiro
- Passes through `safety-filter.ts` and `workout-validator.ts`
- Branch: `feat/swap-exercise-action`

**B3 - Account deletion** (`src/actions/profile.actions.ts:93`):

- Implement full account deletion (profile + program + sessions cascade via DB triggers)
- Branch: `feat/delete-account-action`

---

### Milestone E: Health data encryption + measurement logging

- `supabase/migrations/003_health_data_encryption.sql` - column-level encryption for health fields
- `logMeasurementAction` - implement stub at `src/actions/profile.actions.ts:69`
- `src/components/profile/MeasurementLogger.tsx` - UI for logging weight/body fat
- `src/components/profile/MeasurementHistory.tsx` - chart of measurements over time
- See `skills/health-data-encryption/SKILL.md`

---

### Phase 11: Testing Layer 5 (remaining)

Layers 2-4 are complete (see "What is built and working" above). Layer 5 remains:

**Layer 5 - A/B production:**

- PostHog `WORKOUT_COMPLETED` / `WORKOUT_STARTED` ratio per prompt version
- See `skills/posthog-event-taxonomy/` for event naming

---

## Key files reference

| File                                          | Status                           | Purpose                                         |
| --------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| `src/lib/ai/workout-generator.ts`             | Complete                         | AI generation with resilience chain             |
| `src/lib/ai/workout-validator.ts`             | Complete                         | Post-generation constraint enforcement          |
| `src/lib/ai/safety-filter.ts`                 | Complete                         | Input safety check before every Claude call     |
| `src/lib/utils/progressive-overload.ts`       | Complete                         | Deterministic overload calculations             |
| `src/lib/utils/recovery-model.ts`             | Complete                         | SRA curve per muscle group                      |
| `src/lib/db/supabase.ts`                      | Complete                         | Browser + server Supabase clients               |
| `src/middleware.ts`                           | Complete                         | Auth route protection                           |
| `src/stores/onboarding.store.ts`              | Complete                         | Onboarding quiz state with localStorage persist |
| `src/stores/workout.store.ts`                 | Complete                         | Active workout state                            |
| `src/actions/onboarding.actions.ts`           | Complete                         | OTP send, persist onboarding state              |
| `src/actions/program.actions.ts`              | Complete (stubs for adjust/swap) | AI program generation                           |
| `src/actions/workout.actions.ts`              | Complete (Phase 4)               | startSession, logSet, completeSession           |
| `src/app/onboarding/`                         | Complete                         | All 23 screens                                  |
| `src/app/(app)/dashboard/page.tsx`            | Complete (Phase 3)               | Dashboard with parallel data fetching           |
| `src/components/workout/ProgramCard.tsx`      | Complete (Phase 3)               | Program name, archetype badge, week X/Y         |
| `src/components/workout/TodayWorkout.tsx`     | Complete (Phase 3)               | Next unlogged day; handles week-complete/empty  |
| `src/components/workout/StatsStrip.tsx`       | Complete (Phase 3)               | Streak and weekly volume display                |
| `src/app/(app)/workout/[sessionId]/`          | Complete (Phase 4)               | Active workout logger (page + WorkoutLogger)    |
| `src/components/workout/SetLogger.tsx`        | Complete (Phase 4)               | Reps/weight +/- controls with optimistic UI     |
| `src/components/workout/RestTimer.tsx`        | Complete (Phase 4)               | Countdown timer after each set                  |
| `src/components/workout/ExerciseCard.tsx`     | Complete (Phase 4+6)             | Target vs actual display + progression hint     |
| `src/app/(app)/workout/[sessionId]/complete/` | Complete (Phase 5)               | Post-workout experience server page             |
| `src/components/workout/StreakMilestone.tsx`  | Complete (Phase 5)               | Streak count + milestone animation              |
| `src/components/charts/RecoveryHeatmap.tsx`   | Complete (Phase 5)               | 13-muscle recovery heatmap                      |
| `src/components/ai/KiroDebrief.tsx`           | Complete (Phase 5)               | Streaming inline AI debrief                     |
| `src/components/social/ShareCard.tsx`         | Complete (Phase 5)               | On-demand shareable workout card                |
| `src/app/api/debrief/[sessionId]/route.ts`    | Complete (Phase 5)               | SSE streaming debrief endpoint                  |
| `src/lib/db/queries/progression.ts`           | Complete (Phase 6)               | getProgressionSuggestionsForDay orchestrator    |
| `src/app/(app)/workout/[sessionId]/page.tsx`  | Complete (Phase 4+6)             | Parallel fetch: session + progression hints     |
| `supabase/migrations/001_initial_schema.sql`  | Complete                         | Full DB schema + RLS + triggers                 |
| `src/app/page.tsx`                            | Complete (Phase 10)              | Public landing page shell                       |
| `src/components/marketing/LandingNav.tsx`     | Complete (Phase 10)              | Sticky nav with scroll state                    |
| `src/components/marketing/HeroSection.tsx`    | Complete (Phase 10)              | Full-viewport hero with Framer Motion           |
| `src/components/marketing/FeaturesGrid.tsx`   | Complete (Phase 10)              | 6-tile feature showcase                         |
| `src/lib/ai/quality-judge.ts`                 | Complete (Phase 11 Layer 3)      | Haiku secondary judge for generation quality    |
| `src/lib/ai/__tests__/golden-profiles/`       | Complete (Phase 11 Layer 4)      | Expert-validated profile fixtures               |

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
