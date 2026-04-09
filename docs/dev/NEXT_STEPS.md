# KairoFit - Next Steps

_Last updated: 2026-04-08. Reflects state after Phase 9 (PWA + offline-first). Phase 10 (landing page) in progress._

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

Test suite expanded through Phases 7-9. All 289 unit tests green.

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

### Phase 10: Landing Page (in progress)

**Goal:** Public marketing page at `/` that converts new visitors into onboarding starters. Currently unauthenticated visitors at `/` are redirected to `/auth/login` - this phase adds a real entry point.

**Sections (top to bottom):**

1. `LandingNav` - sticky header: wordmark left, "Sign in" + "Get started" right
2. `HeroSection` - full-viewport headline + sub + CTA -> `/onboarding`
3. `ScienceHookSection` - "Know why every rep" - visual mockup of 3-layer science transparency
4. `HowItWorksSection` - 3-step numbered flow: quiz -> Kiro builds program -> train with purpose
5. `FeaturesGrid` - 6 feature tiles (AI Coach, Recovery heatmap, Offline-first, Progressive overload, Adaptive volume, Science citations)
6. `LandingCTA` - bottom full-width CTA section with trust line

**Files to create:**

- `src/app/page.tsx` - landing page shell (Server Component)
- `src/components/marketing/LandingNav.tsx` - sticky nav (Client Component for scroll state)
- `src/components/marketing/HeroSection.tsx` - hero (Client Component for Framer Motion)
- `src/components/marketing/ScienceHookSection.tsx` - science section
- `src/components/marketing/HowItWorksSection.tsx` - how it works
- `src/components/marketing/FeaturesGrid.tsx` - features grid
- `src/components/marketing/LandingCTA.tsx` - final CTA

**Middleware change:** Add `'/'` to `PUBLIC_ROUTES` in `src/middleware.ts`.

**Constraints:**
- No em dashes anywhere in copy
- No motivational fluff ("crush it", "you've got this")
- Dark theme only - all design tokens from CLAUDE.md
- `framer-motion` only in Client Components
- All CTAs route to `/onboarding`; sign-in links to `/auth/login`

---

### Phase 11: Testing Layers 2-5 (deferred)

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
