# Plan: Remaining Work in KairoFit Codebase

_Authored: 2026-04-09. Last updated: 2026-04-09 (Milestone A merged)._
_Baseline: `main` @ 2659e34, 327/327 tests passing._

## Status

- [x] **Milestone A** - Phase 10 landing page merged as PR #49 (commit 2659e34)
- [ ] **Milestone B** - Unblock stubbed Server Actions (B1 adjust, B2 swap, B3 delete)
- [x] **Milestone C** - Testing Layer 2 (property-based) completed in commit c674c3f
- [x] **Milestone D** - Testing Layers 3+4 (quality-judge + golden profiles) completed in commit c674c3f
- [ ] **Milestone E** - Health data encryption + measurement logging

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

### Milestone A: Finalize Phase 10 Landing Page [COMPLETE]

Merged as PR #49 (commit 2659e34) on 2026-04-09.

- **Deliverables** (all complete)
  - [x] `/verify` passed on `feat/phase-10-landing-page`
  - [x] Orphaned `generateDebrief()` stub removed from `src/lib/ai/workout-generator.ts`
  - [x] CI green (typecheck, lint, lint:kiro, unit tests, build, E2E)
  - [x] Axios SSRF (GHSA-3p68-rc4w-qgx5) patched via `npm audit fix`
  - [x] PR #49 squash-merged to `main`; feature branch deleted
  - [x] `docs/dev/journals/PHASE_10_JOURNAL.md` published
- **Acceptance criteria** (all met)
  - [x] `/` renders landing page for unauthenticated users
  - [x] All 6 landing sections present and responsive
  - [x] `npm run lint:kiro` passes
  - [x] 327/327 tests green

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

### Milestone C: Testing Layer 2 — Property-Based [COMPLETE]

Completed in commit c674c3f (`test(ai): add Phase 7 testing layers 2-4`).

- **Delivered**
  - `fast-check` installed as dev dependency
  - `src/lib/ai/__tests__/workout-validator.test.ts` — property-based invariants for the validator
  - Landed alongside Milestones D1/D2 in the same commit

### Milestone D: Testing Layers 3 + 4 — LLM Judge + Snapshot Regression [COMPLETE]

Completed in commit c674c3f.

- **Delivered**
  - `src/lib/ai/quality-judge.ts` + `src/lib/ai/__tests__/quality-judge.test.ts` (11 tests)
  - `src/lib/ai/__tests__/golden-profiles/` fixtures + `src/lib/ai/__tests__/golden-profiles.test.ts` (8 tests)
  - Both suites run under the standard `npm test` command, contributing to the 327-test baseline

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
