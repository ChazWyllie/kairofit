# KairoFit - Next Steps

_Last updated: 2026-04-01. Reflects state after Phase 2 (auth + onboarding-to-dashboard) completion._

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

### Test coverage (73/73 passing)

- `src/lib/db/queries/__tests__/programs.test.ts` - saveProgramToDb coverage
- `src/actions/__tests__/onboarding.actions.test.ts` - createAccountAction + persistOnboardingState
- `src/stores/__tests__/onboarding.store.test.ts` - store state transitions
- `src/lib/ai/__tests__/workout-validator.test.ts` - constraint enforcement
- `src/lib/utils/__tests__/progressive-overload.test.ts` - overload calculations

---

## What to build next

### Phase 3: Dashboard + Active Program UI

The current dashboard is a minimal placeholder. Build the real home screen.

**Goal:** User opens app, sees today's workout and their active program at a glance.

**Files to create/modify:**

- `src/app/(app)/dashboard/page.tsx` - server component, loads active program
- `src/components/workout/ProgramCard.tsx` - shows program name, archetype, week X/Y
- `src/components/workout/TodayWorkout.tsx` - today's session with exercise list
- `src/components/charts/ProgressChart.tsx` - lightweight weekly volume chart

**Data needed:**

- `getActiveProgram(userId)` - already in `src/lib/db/queries/programs.ts`
- `getRecentSessions(userId, limit)` - add to `src/lib/db/queries/sessions.ts`

**Acceptance criteria:**

- [ ] Dashboard loads active program name, week number, days
- [ ] Today's session shows exercise list with sets/reps/weight targets
- [ ] Empty state if no program exists ("Generating your program...")
- [ ] TypeScript clean, 80%+ test coverage

---

### Phase 4: Workout Logging (Set Logger)

The core revenue-driving feature. Users log sets in real time.

**Goal:** User can start a session, log each set with reps/weight, rest between sets, and complete the session.

**Files to create:**

- `src/app/(app)/workout/[sessionId]/page.tsx` - active workout view
- `src/components/workout/SetLogger.tsx` - +/- controls for reps and weight
- `src/components/workout/RestTimer.tsx` - countdown timer after each set
- `src/components/workout/ExerciseCard.tsx` - shows target, logs actual

**Actions to implement** (stubs exist in `workout.actions.ts`):

- `startSessionAction` - creates session row, returns sessionId
- `logSetAction` - inserts set into `workout_sets` with reps/weight/rpe
- `completeSessionAction` - marks session complete, triggers `after()` hooks

**Offline-first:** See `skills/offline-sync-pattern/` - sets queue to IndexedDB first, sync in background.

**Acceptance criteria:**

- [ ] Start workout from dashboard - session created in DB
- [ ] Log sets with reps and weight - persisted (online) or queued (offline)
- [ ] Rest timer countdown with haptic feedback on mobile
- [ ] Complete workout - session marked done, redirect to post-workout

---

### Phase 5: Post-Workout Experience

The four-step post-workout sequence defined in CLAUDE.md.

**Goal:** After completing a session, show streak animation, recovery heatmap update, Kiro debrief, and optional share card.

**Files to create:**

- `src/app/(app)/workout/complete/page.tsx` - post-workout flow container
- `src/components/workout/StreakAnimation.tsx` - streak + milestone badge
- `src/components/charts/RecoveryHeatmap.tsx` - muscle recovery visualization
- `src/components/ai/KiroDebrief.tsx` - streaming inline AI debrief (not a popup)
- `src/components/social/ShareCard.tsx` - shareable workout card (on demand)

**Sequence:**

1. Streak + milestone animation (Framer Motion, must be `'use client'`)
2. Recovery heatmap update (SRA curve - see `src/lib/utils/recovery-model.ts`)
3. Kiro AI debrief (streaming via Vercel AI SDK, inline text)
4. Share card (on demand only - see `src/lib/utils/workout-share.ts`)

**Kiro voice rules:** Direct, specific numbers, no motivational fluff. See `skills/kiro-output-auditor/`.

---

### Phase 6: Progressive Overload + Adaptive Programming

The intelligence that makes KairoFit defensible vs. FitBod.

**Goal:** Program automatically adjusts based on logged performance. Next session targets are personalized.

**Files to create/modify:**

- `src/lib/utils/progressive-overload.ts` - deterministic overload calculations (exists, verify complete)
- `src/lib/db/queries/sessions.ts` - add `getRecentPerformance(userId, exerciseId)` query
- `src/actions/program.actions.ts` - add `adjustProgramAction` (stub exists)

**Logic:**

- If user hit all reps at top of range for 2+ sessions: increase weight by micro-increment
- If user missed bottom of rep range: hold weight, flag for review
- Deload trigger: 4 weeks of linear progression or explicit fatigue signal

All calculations in `src/lib/utils/` - deterministic code owns programming logic, Kiro owns language.

---

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

| File | Status | Purpose |
| ---- | ------ | ------- |
| `src/lib/ai/workout-generator.ts` | Complete | AI generation with resilience chain |
| `src/lib/ai/workout-validator.ts` | Complete | Post-generation constraint enforcement |
| `src/lib/ai/safety-filter.ts` | Complete | Input safety check before every Claude call |
| `src/lib/utils/progressive-overload.ts` | Complete | Deterministic overload calculations |
| `src/lib/utils/recovery-model.ts` | Complete | SRA curve per muscle group |
| `src/lib/db/supabase.ts` | Complete | Browser + server Supabase clients |
| `src/middleware.ts` | Complete | Auth route protection |
| `src/stores/onboarding.store.ts` | Complete | Onboarding quiz state with localStorage persist |
| `src/stores/workout.store.ts` | Complete | Active workout state |
| `src/actions/onboarding.actions.ts` | Complete | OTP send, persist onboarding state |
| `src/actions/program.actions.ts` | Complete (stubs for adjust/swap) | AI program generation |
| `src/actions/workout.actions.ts` | Stubs | Set logging, session management |
| `src/app/onboarding/` | Complete | All 23 screens |
| `src/app/(app)/dashboard/` | Minimal | Home screen placeholder |
| `supabase/migrations/001_initial_schema.sql` | Complete | Full DB schema + RLS + triggers |

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
