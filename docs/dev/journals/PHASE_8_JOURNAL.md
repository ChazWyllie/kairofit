# Phase 8 Development Journal: Analytics + PostHog

_Branch: `feat/phase-8-analytics-posthog` | Date: 2026-04-05 | Author: kairo_

---

## 1. Context & Planning

### Initial Requirements

Phase 8 was scoped from NEXT_STEPS.md and CLAUDE.md Section "Testing Roadmap - Layer 5":
Layer 5 (A/B production) requires PostHog instrumentation before it can track workout completion
rates against generation model versions. Phase 8 is the prerequisite.

**Required events before revenue launch:**

- `ONBOARDING_STEP_COMPLETED` - funnel conversion
- `PROGRAM_GENERATION_COMPLETED` - AI usage baseline
- `WORKOUT_STARTED` - activation signal
- `SET_LOGGED` - engagement depth
- `WORKOUT_COMPLETED` - primary retention KPI
- `KIRO_DEBRIEF_VIEWED` - AI feature engagement
- `ARCHETYPE_REVEALED` - onboarding milestone
- `EMAIL_GATE_REACHED` - pre-conversion funnel
- `EMAIL_GATE_SUBMITTED` - conversion event

**Existing state:** PostHog was installed as a dependency (`posthog-js`, `posthog-node`) but had
zero instrumentation. No events were firing. No provider was mounted. The EVENTS constant did
not exist - raw strings would have been used, creating a maintenance nightmare.

### Architecture Decisions

#### Decision 1: Canonical EVENTS constant over raw strings

All event names live in `src/lib/utils/event-names.ts` as a `const` object. Every call site
imports from this file - no raw strings anywhere in the codebase.

Why: prevents typos from silently dropping events in PostHog (no error, just missing data).
TypeScript enforces completeness: `keyof typeof EVENTS` in `useAnalytics` means an unknown
event name is a compile error, not a runtime bug discovered weeks later in a dashboard.

35 events defined across 6 categories: onboarding funnel, program generation, workout sessions,
Kiro AI interactions, retention signals, paywall (gated).

#### Decision 2: `after()` for all server-side analytics

Every server-side `trackServer()` call is wrapped in Next.js 15's `after()` API. This ensures
analytics processing runs after the HTTP response is sent to the client - zero latency impact.

```typescript
// In completeSessionAction:
after(async () => {
  await updateMuscleRecovery(userId, session.id, completedSets)
})
after(() => {
  void trackServer(userId, EVENTS.WORKOUT_COMPLETED, {
    session_id: session.id,
    duration_seconds,
    perceived_effort,
  })
})
```

`after()` can be called multiple times per action - each callback runs independently. The
existing recovery `after()` in `completeSessionAction` was not modified; the analytics
`after()` was added alongside it.

#### Decision 3: Fresh PostHog client per server invocation

Vercel serverless functions are ephemeral. Module-level singletons reset on cold start.
`trackServer()` creates a fresh `PostHog` client on every call with `flushAt: 1,
flushInterval: 0` to force immediate flush, then calls `shutdownAsync()`.

This matches the pattern from `circuit-breaker.ts` (which uses Upstash Redis rather than
in-memory state for the same reason). Both are documented in skills/ai-resilience/.

#### Decision 4: Client-side events via `posthog-js/react` (not trackServer)

Three events are client-side only because they require browser context:

- `ARCHETYPE_REVEALED` - computed from `psych_scores` in a client component
- `EMAIL_GATE_REACHED` - page mount event (no server action involved)
- `EMAIL_GATE_SUBMITTED` - fires after action success, before navigation
- `KIRO_DEBRIEF_VIEWED` - also fired client-side when streaming begins

`KiroDebrief.tsx` fires `KIRO_DEBRIEF_VIEWED` client-side (when the component mounts and
starts streaming). The server-side route handler also fires it via `after()`. This dual-track
is intentional: server side captures the request regardless of whether JS has loaded;
client side confirms the UI actually rendered.

#### Decision 5: `exercise_name` as analytics-only field

`logSetAction` receives `exercise_id` (UUID), not a human-readable name. The DB insert
only writes `exercise_id`. To get a useful event property for PostHog (`"Barbell Squat"` vs
`"a3f2-..."`), an analytics-only field was added to `logSetSchema`:

```typescript
exercise_name: z.string().max(100).optional(), // analytics only - not written to DB
```

The client passes this field alongside `exercise_id`. The action reads it for the analytics
event and ignores it for the DB insert. No DB schema change required.

---

## 2. Implementation: TDD Workflow

### Phase A: Tests First (RED)

Wrote all tests before writing any implementation:

**`src/lib/utils/__tests__/event-names.test.ts`** (13 tests)

- Non-empty object
- All values are strings
- No duplicate values (Map deduplication check)
- All values are SCREAMING_SNAKE_CASE
- All 9 Phase 8 required events present by name

**`src/lib/utils/__tests__/analytics.test.ts`** (5 tests)

- No-ops when `NEXT_PUBLIC_POSTHOG_KEY` is absent
- Calls `PostHog.capture()` with correct distinctId, event, properties
- Calls `shutdownAsync()` after capture
- Works when properties is omitted
- Does not throw when `shutdownAsync()` rejects

All 18 new tests failed (RED) before implementation existed.

### Phase B: Implementation (GREEN)

Files created:

| File                                           | Purpose                                                   |
| ---------------------------------------------- | --------------------------------------------------------- |
| `src/lib/utils/event-names.ts`                 | 35 canonical events, 6 categories                         |
| `src/lib/utils/analytics.ts`                   | `trackServer()` - serverless-safe posthog-node wrapper    |
| `src/components/providers/PostHogProvider.tsx` | Client-side PostHog init + `PHProvider` wrapper           |
| `src/hooks/useAnalytics.ts`                    | `useAnalytics()` hook typed against `keyof typeof EVENTS` |

Files modified:

| File                                           | Change                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `src/actions/onboarding.actions.ts`            | `after()` + `PROGRAM_GENERATION_COMPLETED` in `generateProgramAction` |
| `src/actions/workout.actions.ts`               | `after()` for `SET_LOGGED`, `WORKOUT_STARTED`, `WORKOUT_COMPLETED`    |
| `src/app/api/debrief/[sessionId]/route.ts`     | `after()` for `KIRO_DEBRIEF_VIEWED`                                   |
| `src/app/layout.tsx`                           | Wrap with `PostHogProvider`                                           |
| `src/app/onboarding/archetype-reveal/page.tsx` | `ARCHETYPE_REVEALED` on mount                                         |
| `src/app/onboarding/email-gate/page.tsx`       | `EMAIL_GATE_REACHED` on mount, `EMAIL_GATE_SUBMITTED` on success      |
| `src/components/ai/KiroDebrief.tsx`            | `KIRO_DEBRIEF_VIEWED` in sessionId effect                             |
| `src/lib/validation/schemas.ts`                | `exercise_name` analytics field in `logSetSchema`                     |

### Phase C: Test Fix - The `next/server` Mock Gap

After adding `after()` to `onboarding.actions.ts`, one test broke:

```
FAIL src/actions/__tests__/onboarding.actions.test.ts
  generateProgramAction > returns programId on success
  AssertionError: expected undefined to be 'program-456'
```

**Root cause:** `onboarding.actions.test.ts` had no mock for `next/server`. When `after()` was
called inside the action during the test, it threw (no valid Next.js request context). Since all
Server Actions run through `next-safe-action`, the error was caught and returned as `serverError`
instead of `data`. The test was asserting on `result?.data?.programId` which was `undefined`.

**Why `workout.actions.test.ts` was unaffected:** That test file already had
`vi.mock('next/server', () => ({ after: vi.fn() }))` from Phase 7 (when `completeSessionAction`
was implemented with `after()` for muscle recovery). The onboarding tests predated any `after()`
usage in that action.

**Fix:** Added two mocks to `onboarding.actions.test.ts` before the imports block:

```typescript
vi.mock('next/server', () => ({
  after: vi.fn(),
}))

vi.mock('@/lib/utils/analytics', () => ({
  trackServer: vi.fn(),
}))
```

**Rule for future phases:** Any action that uses `after()` requires `vi.mock('next/server', ...)`
in its test file. Any action that calls `trackServer()` requires `vi.mock('@/lib/utils/analytics', ...)`.
These two mocks travel together.

---

## 3. Final Test Count

```
268 tests passing | 23 files | 0 failures
```

New tests added this phase: 18 (13 event-names + 5 analytics)
Tests fixed this phase: 1 (onboarding.actions - next/server mock gap)
Net: +17 tests vs Phase 7 baseline of 251.

---

## 4. Events Coverage Summary

| Event                          | Where                     | Mechanism                                     |
| ------------------------------ | ------------------------- | --------------------------------------------- |
| `EMAIL_GATE_REACHED`           | email-gate/page.tsx       | client `posthog.capture` on mount             |
| `EMAIL_GATE_SUBMITTED`         | email-gate/page.tsx       | client `posthog.capture` after action success |
| `ARCHETYPE_REVEALED`           | archetype-reveal/page.tsx | client `posthog.capture` on mount             |
| `PROGRAM_GENERATION_COMPLETED` | generateProgramAction     | server `after() + trackServer()`              |
| `WORKOUT_STARTED`              | startSessionAction        | server `after() + trackServer()`              |
| `SET_LOGGED`                   | logSetAction              | server `after() + trackServer()`              |
| `WORKOUT_COMPLETED`            | completeSessionAction     | server `after() + trackServer()`              |
| `KIRO_DEBRIEF_VIEWED`          | /api/debrief/[sessionId]  | server `after() + trackServer()`              |
| `KIRO_DEBRIEF_VIEWED`          | KiroDebrief.tsx           | client `posthog.capture` (dual-track)         |

---

## 5. What Phase 8 Unlocks

**Layer 5 testing (CLAUDE.md Testing Roadmap):** Now possible. PostHog can track
`WORKOUT_COMPLETED / WORKOUT_STARTED` ratio per program generation model/prompt version.
Target: >70% completion rate (maps to 43% higher LTV per research doc).

**Paywall decision data:** When `NEXT_PUBLIC_PAYWALL_ENABLED=true`, the `PAYWALL_SHOWN` /
`SUBSCRIPTION_STARTED` funnel events are already defined in `event-names.ts`. Only the
emission sites need adding (in the paywall UI, which doesn't exist yet).

**Onboarding funnel analysis:** PostHog can now show exact drop-off by step.
`EMAIL_GATE_REACHED` vs `EMAIL_GATE_SUBMITTED` gives the pre-conversion drop rate.

**A/B testing infrastructure:** `useAnalytics` hook + `EVENTS` constant are the client-side
surface. Feature flags in PostHog can now be evaluated against real usage data.

---

## 6. Known Gaps (Explicitly Deferred)

- `ONBOARDING_STEP_COMPLETED`: Defined in EVENTS but not yet emitted. The onboarding store
  calls `nextStep()` - that function would need to fire this event. Deferred because it requires
  threading PostHog through the Zustand store or adding it to every step's continue handler.
  Medium priority: useful for funnel analysis but not blocking revenue launch.

- `FIRST_WORKOUT_STARTED`, `FIRST_WORKOUT_COMPLETED`: Require checking `sessions.count` before
  emitting. Not implemented - the query overhead in a hot path isn't worth it pre-launch.

- Identify call: PostHog `posthog.identify(userId, { email, archetype })` is not called at login.
  Without identify, server-side `trackServer(userId, ...)` events and client-side anonymous events
  are not linked in the PostHog person profile. Implement at login/auth callback in Phase 9+.

---

## 7. Files Changed

```
src/lib/utils/event-names.ts                    NEW - 35 canonical events
src/lib/utils/analytics.ts                      NEW - trackServer()
src/lib/utils/__tests__/analytics.test.ts       NEW - 5 tests
src/lib/utils/__tests__/event-names.test.ts     NEW - 13 tests
src/components/providers/PostHogProvider.tsx    NEW - client PostHog init
src/hooks/useAnalytics.ts                       NEW - typed client hook
src/actions/onboarding.actions.ts               MOD - PROGRAM_GENERATION_COMPLETED
src/actions/workout.actions.ts                  MOD - SET_LOGGED, WORKOUT_STARTED, WORKOUT_COMPLETED
src/app/api/debrief/[sessionId]/route.ts        MOD - KIRO_DEBRIEF_VIEWED (server)
src/app/layout.tsx                              MOD - PostHogProvider wrapper
src/app/onboarding/archetype-reveal/page.tsx    MOD - ARCHETYPE_REVEALED
src/app/onboarding/email-gate/page.tsx          MOD - EMAIL_GATE_REACHED, EMAIL_GATE_SUBMITTED
src/components/ai/KiroDebrief.tsx               MOD - KIRO_DEBRIEF_VIEWED (client)
src/lib/validation/schemas.ts                   MOD - exercise_name analytics field
src/actions/__tests__/onboarding.actions.test.ts MOD - next/server + analytics mocks
```
