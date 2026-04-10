# Plan: Remaining Work in KairoFit Codebase

_Authored: 2026-04-09. Baseline: `feat/phase-10-landing-page` @ c9f25e3, 289/289 tests passing._

---

## Spec

KairoFit has completed Phases 0-9 (foundation, auth, onboarding, dashboard, workout logging, post-workout experience, progressive overload, analytics, PWA/offline). Phase 10 (public landing page) is in flight on `feat/phase-10-landing-page` with components committed. This plan closes out Phase 10 and sequences the remaining pre-launch work: unblocking stubbed Server Actions, removing dead code, advancing the testing roadmap (Layers 2-4), and delivering health data encryption + measurement logging. Paywall activation, social features, RAG, and the mobile wrapper remain deliberately out of scope.

**Assumption:** Phase 11 (Testing Layers 2-5) is sequenced after Phase 10 ships because the highest-risk gap is unblocking user-facing features (adjustment, swap, account deletion), not additional AI quality gates.

---

## Interfaces

### New / modified Server Actions

| Action                 | File                             | Status                                       | Shape                                                                                                                         |
| ---------------------- | -------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `adjustProgramAction`  | `src/actions/program.actions.ts` | **STUB** → implement                         | `{ programId: string, feedback: string } → { success: boolean, updatedProgram?: Program }`                                    |
| `swapExerciseAction`   | `src/actions/program.actions.ts` | **STUB** → implement                         | `{ programId: string, dayIndex: number, exerciseId: string, reason?: string } → { success: boolean, newExerciseId?: string }` |
| `deleteAccountAction`  | `src/actions/profile.actions.ts` | **STUB** → implement                         | `{ confirmation: 'DELETE' } → { success: boolean }` (cascade delete via RLS + auth.admin)                                     |
| `logMeasurementAction` | `src/actions/profile.actions.ts` | **STUB (blocked on encryption)** → implement | `{ weight_kg?, body_fat_pct?, measurement_date } → { success: boolean, measurementId?: string }`                              |

### API routes

No new public API routes. `/api/debrief/[sessionId]` already ships a full `streamText` implementation via Vercel AI SDK; the `generateDebrief()` stub in `src/lib/ai/workout-generator.ts` is **orphaned dead code** and will be removed.

### Database changes

| Migration                        | Purpose                                                                                                                                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `003_health_data_encryption.sql` | Add `pgcrypto` extension; add encrypted columns `weight_kg_encrypted`, `body_fat_pct_encrypted` to `measurements`; add `encryption_key_version smallint` for rotation; helper functions `encrypt_health_metric(value, user_id)`, `decrypt_health_metric(ciphertext, user_id)`; RLS policy updates |

### Components / pages

| Surface                                           | Status                                    | Notes                                         |
| ------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| `src/app/page.tsx` + `src/components/marketing/*` | Committed on `feat/phase-10-landing-page` | Needs `/verify` + PR + merge                  |
| `src/components/profile/DeleteAccountDialog.tsx`  | **NEW**                                   | Confirmation UX for `deleteAccountAction`     |
| `src/components/profile/MeasurementLogger.tsx`    | **NEW**                                   | Form consuming `logMeasurementAction`         |
| `src/app/(app)/settings/page.tsx`                 | **MODIFY**                                | Mount DeleteAccountDialog + measurement entry |

### Events / async

- `after()` PostHog events remain the pattern — new events on program adjustment (`PROGRAM_ADJUSTED`), exercise swap (`EXERCISE_SWAPPED`), account deletion (`ACCOUNT_DELETED`), measurement logged (`MEASUREMENT_LOGGED`). Add to `src/lib/utils/event-names.ts` under existing taxonomy.

---

## Milestones

Each milestone is an independently deployable PR, branched from `main` (except Milestone A which finishes the in-flight Phase 10 branch).

### Milestone A: Finalize Phase 10 Landing Page

- **Deliverables**
  - Run `/verify` on `feat/phase-10-landing-page` (typecheck, lint, `lint:kiro`, tests, format:check)
  - Fix any verification findings
  - Remove orphaned `generateDebrief()` stub from `src/lib/ai/workout-generator.ts` (dead code cleanup, single commit)
  - Push branch, open PR against `main`, monitor CI
  - Merge + generate PHASE_10_JOURNAL.md, update NEXT_STEPS.md
- **Acceptance criteria**
  - `/` renders landing page for unauthenticated users (no redirect to `/auth/login`)
  - All 6 landing sections (Nav, Hero, ScienceHook, HowItWorks, FeaturesGrid, CTA) present and responsive
  - `npm run lint:kiro` passes (no em dashes, no banned phrases)
  - 289+ tests green, no new console.log warnings
  - PR merged to `main`

### Milestone B: Unblock Stubbed Server Actions

- **Deliverables** (one PR per action to honor the "one focused PR" rule)
  - **B1** `feat/adjust-program-action`: Implement `adjustProgramAction` — resilience chain (Sonnet → Haiku → static), Zod validation, rate limit `RATE_LIMIT_KEYS.AI_ADJUSTMENT`, circuit breaker key `ADJUSTMENT`, `workout-validator` post-check, `PROGRAM_ADJUSTED` event
  - **B2** `feat/swap-exercise-action`: Implement `swapExerciseAction` — deterministic candidate pool from exercise library filtered by muscle group + equipment + contraindications, Kiro picks with rationale, `EXERCISE_SWAPPED` event
  - **B3** `feat/delete-account-action`: Implement `deleteAccountAction` — cascade via `supabase.auth.admin.deleteUser` (server-only), cleanup Dexie + PostHog identify reset, `ACCOUNT_DELETED` event
- **Acceptance criteria**
  - Each action has TDD-first unit tests (happy, rate-limit, safety-fail, circuit-open, Zod-fail)
  - Integration test using local Supabase branch proves cascade delete
  - No stubs remain in `program.actions.ts` or `profile.actions.ts` (except `logMeasurementAction` which is gated on Milestone E)
  - All 3 PRs merged, 289+ tests green

### Milestone C: Testing Layer 2 — Property-Based

- **Deliverables**
  - Install `fast-check` as dev dependency
  - `src/lib/ai/__tests__/workout-validator.property.test.ts` — generators for `UserProfile`, run 1000 iterations per invariant
  - Invariants: (a) no program exceeds level-specific volume cap, (b) no contraindicated exercise assigned given injury list, (c) all rest periods within 30-300s, (d) rep ranges match scheme, (e) archetype-specific rules preserved
  - Document property-test patterns in `skills/property-based-testing/SKILL.md` (new skill)
- **Acceptance criteria**
  - 5 invariant properties green, each with ≥500 iterations
  - `npm run test:coverage` shows workout-validator.ts at ≥90% branch coverage
  - Zero new `any` types; all generators typed with `fast-check`'s `fc.Arbitrary<T>`

### Milestone D: Testing Layers 3 + 4 — LLM Judge + Snapshot Regression

- **Deliverables**
  - **D1** Layer 3: `src/lib/ai/quality-judge.ts` — Haiku call scoring 5 dimensions (safety, scientific accuracy, personalization, Kiro voice, completeness), threshold 4/5, integration with `generateProgramAction` as non-blocking telemetry (not acceptance gate initially)
  - **D2** Layer 4: `src/lib/ai/__tests__/golden-profiles/` — 15 seed profiles (not 50 — full set is scope creep), snapshot assertion harness, deviation tolerance for volume ±10% and exercise count ±1
- **Acceptance criteria**
  - Judge returns scores within 2s p95 on Haiku
  - Golden profile suite runs in CI via `npm run test:golden`
  - Drift alert: quality-judge score < 4/5 triggers PostHog event `AI_QUALITY_BELOW_THRESHOLD`

### Milestone E: Health Data Encryption + Measurement Logging

- **Deliverables**
  - Migration `003_health_data_encryption.sql` with `pgcrypto`, encrypted columns, helper functions, RLS policies (with WITH CHECK)
  - `src/lib/db/encryption.ts` — helper wrapping `encrypt_health_metric` / `decrypt_health_metric`
  - Implement `logMeasurementAction` using encryption helper
  - Build `MeasurementLogger.tsx` form + `MeasurementHistory.tsx` reader component
  - Mount in `src/app/(app)/settings/page.tsx`
  - Update `skills/health-data-encryption/SKILL.md` with real-world example
- **Acceptance criteria**
  - Measurements round-trip via encryption helper (integration test against local Supabase)
  - RLS denies cross-user reads even with service role bypassed in test
  - Zero plaintext health values in `measurements` table after migration
  - `MEASUREMENT_LOGGED` event captured

---

## Risks

| Risk                                                                                                          | Likelihood | Impact | Mitigation                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adjustProgramAction` mutates program mid-week causing lost workout history                                   | Medium     | High   | Write to new program version; keep old version for completed sessions; migration adds `program_version` column referenced by sessions                            |
| `deleteAccountAction` race with in-flight Dexie sync leaves orphaned IndexedDB data                           | Medium     | Medium | Delete auth user last; flush Dexie via `clearAllData()` on client before calling action; action returns `{ revoke_sessions: true }` so middleware signs user out |
| `pgcrypto` encryption key management: storing key in env var is single point of failure                       | High       | High   | Use `pgsodium` (Supabase managed) OR Vault pattern with key rotation + `encryption_key_version` column; document recovery story before enabling in prod          |
| Property-based tests surface latent validator bugs that require fixes in `workout-validator.ts` (scope creep) | Medium     | Medium | Time-box Milestone C bug fixes to 1 session; defer any found bugs to a followup PR with a failing test                                                           |
| Golden profile snapshots drift on every prompt tweak causing false CI failures                                | Medium     | Low    | Use deviation tolerance not strict equality; document snapshot-update procedure in journal                                                                       |

---

## Acceptance Criteria

Global "done" for this plan:

- [ ] Landing page live on `/` in production, CTAs route to `/onboarding`
- [ ] Zero stubbed Server Actions in `src/actions/` (verified via `grep -rn "TODO: Implement" src/actions/`)
- [ ] Orphaned `generateDebrief` removed from `workout-generator.ts`
- [ ] Testing Layers 2, 3, 4 scaffolded with passing tests
- [ ] Measurements table uses encrypted columns; plaintext columns dropped
- [ ] `docs/dev/NEXT_STEPS.md` updated to reflect Phase 10-13 completion
- [ ] Phase journals published in `docs/dev/journals/` for each milestone
- [ ] 289+ tests green after each milestone PR merges
- [ ] No em dashes introduced anywhere (`npm run lint:kiro` passes)
- [ ] All PRs merged to `main` via squash-merge, feature branches deleted

---

## Out of scope

The following are explicitly **not** part of this plan:

- **Phase 12 Social features** — leaderboards, friends, activity feed (blocked on `NEXT_PUBLIC_SOCIAL_ENABLED` flag + schema design)
- **Stripe paywall activation** — Stripe integration exists; flipping `NEXT_PUBLIC_PAYWALL_ENABLED=true` is a separate launch decision gated on retention data
- **Testing Layer 5 (A/B production)** — requires paywall + real traffic
- **RAG / pgvector knowledge base** — deferred per CLAUDE.md "RAG Decision" section; trigger is >15% swap rate or system prompt >4000 tokens
- **Capacitor mobile wrapper** — post-revenue roadmap item
- **Nutrition / Wearables features** — flagged off, not scaffolded
- **Light theme / accessibility audit beyond WCAG AA** — dark theme is permanent per CLAUDE.md
- **Localization / i18n** — English only at launch
- **Observability stack (Sentry, Datadog)** — PostHog is sufficient pre-launch
