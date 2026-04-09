# KairoFit - Next Steps

_Last updated: 2026-04-07. Reflects state after Phase 9 (PWA + offline) + pre-flight production audit._

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

### Test coverage (289/289 passing)

26 test files, 289 unit tests, all green.

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

### Phase 7: Testing Layers 2-5

CLAUDE.md defines a 5-layer testing roadmap. Only Layer 1 exists.

**Layer 2 - Property-based testing:**

- Install `fast-check`
- `src/lib/ai/workout-validator.test.ts` - generate random `UserProfile` objects, verify invariants
- Invariants: no program exceeds volume caps, no contraindicated exercises, all rest periods valid

**Layer 3 - LLM-as-judge:**

- `src/lib/ai/quality-judge.ts` - secondary Haiku call evaluates generation quality
- 5 dimensions: safety, scientific accuracy, personalization, Kiro voice, completeness
- Threshold: 4/5 minimum to accept

**Layer 4 - Snapshot regression:**

- `src/lib/ai/__tests__/golden-profiles/` - 50 expert-validated profiles
- Run generation against each, verify output is within acceptable deviation

**Layer 5 - A/B production:**

- PostHog `WORKOUT_COMPLETED` / `WORKOUT_STARTED` ratio per prompt version
- See `skills/posthog-event-taxonomy/` for event naming

---

### Phase 8: Analytics + PostHog

**Goal:** Instrument all critical user events before revenue launch.

**Events to implement** (see `skills/posthog-event-taxonomy/` for exact names):

- `ONBOARDING_STEP_COMPLETED` - with step name + archetype at reveal
- `PROGRAM_GENERATED` - with generation_model, experience_level
- `WORKOUT_STARTED` - with program_id, session_day_number
- `SET_LOGGED` - with exercise_name, reps, weight
- `WORKOUT_COMPLETED` - with session_duration, total_sets
- `KIRO_DEBRIEF_VIEWED` - with session_id

All analytics use `after()` so they never delay the user response.

---

### Phase 9: PWA + Offline

**Goal:** App installs to home screen, works offline during workouts.

**Already configured:** `@serwist/next` in `next.config.ts` (NOT `next-pwa`).

**To implement:**

- `src/lib/offline/db.ts` - Dexie.js schema for queued sets (see `skills/offline-sync-pattern/`)
- `src/lib/offline/sync.ts` - background sync queue with retry logic
- Service worker caches: exercise library, active program, static assets
- Offline banner component when network is unavailable

**Key constraint:** `framer-motion` components must be `'use client'`. LazyMotion with `domAnimation` bundle reduces bundle size.

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

---

## Pre-Flight Production Audit (2026-04-07)

Full audit of code integrity, security, performance, DevOps, and documentation.
Verdict: **Conditional GO** - 5 critical fixes required before first deploy.

### What passed

- Build: clean (`npm run build` succeeds)
- TypeScript: strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` - zero errors
- Linting: ESLint + Kiro voice lint + Prettier - all clean
- Tests: 289/289 unit tests passing across 26 test files
- Security headers: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff all configured
- Rate limiting: Upstash Redis-backed on all AI and auth endpoints
- Circuit breaker: Redis-backed (not memory) - survives Vercel cold starts
- Prompt caching: `cache_control: { type: 'ephemeral' }` on system prompt - saves ~40% AI cost
- Auth middleware: protects all (app) routes, refreshes session cookie
- Input validation: Zod at all system boundaries (server actions, sync route)
- PWA manifest: icons, shortcuts, categories all present
- CI pipeline: typecheck -> lint -> format -> audit -> test -> build -> e2e (4 jobs)

### Phase A: Critical Fixes (before deployment)

- [x] A1: Error boundaries - `global-error.tsx`, `(app)/error.tsx`, `not-found.tsx`
- [ ] A2: Error tracking - `@sentry/nextjs` with DSN in env (deferred until production env setup)
- [x] A3: Health check endpoint - `GET /api/health` pings Supabase + Redis, returns status
- [x] A4: SEO files - `robots.ts` and `sitemap.ts` under `src/app/`
- [ ] A5: Secret rotation - rotate all keys after first Vercel deploy

### Phase B: Optimization (first week)

- [x] B1: Loading states - `loading.tsx` skeleton screens for dashboard and workout routes
- [x] B2: E2E test suite - `e2e/onboarding.spec.ts`, `e2e/auth.spec.ts`, `e2e/offline.spec.ts`
- [ ] B3: Dependency audit - full upgrade chain needed (do in a dedicated PR): - `@supabase/ssr` 0.4.1 → 0.10.0 requires `@supabase/supabase-js` ~2.50 → ≥2.100.1 - `ai` v4 → v6 is breaking (streaming API changed); XSS only affects unused diff-viewer feature - `supabase` CLI 1.226 vulnerable to tar CVE; upgrade to 2.87.2 (test `db:push`, `db:seed` after)
- [ ] B4: Structured logging - replace `console.error` with logger that pipes to Sentry in prod
- [ ] B5: PostHog key - create project, set `NEXT_PUBLIC_POSTHOG_KEY` in Vercel
- [ ] B6: ESLint migration - requires full chain: ESLint 8 → 9 + `@typescript-eslint` v7 → v8
      Run: `npm install --save-dev eslint@^9 @typescript-eslint/eslint-plugin@^8 @typescript-eslint/parser@^8`
      Then: `npx @next/codemod@canary next-lint-to-eslint-cli .`

### Phase C: Post-Launch

- [ ] C1: Wire Vercel preview deploys to E2E CI job via `STAGING_URL` secret
- [ ] C2: Uptime monitoring on `/api/health`
- [ ] C3: Performance budget - target <200 kB first-load JS on workout routes
- [ ] C4: Enable GitHub Dependabot
- [ ] C5: Verify Supabase PITR backups on Pro plan
- [ ] C6: Rate limit alerting via Upstash webhook or PostHog event
