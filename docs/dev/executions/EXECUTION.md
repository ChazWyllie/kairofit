# ECE Execution Workflow (Revised)

An autonomous AI developer workflow for structured, test-first feature development with clear quality gates and output standards.

---

## Phase 0: Pre-Execution Intake (5-15 min)

**Gate: Can you summarize scope in 3 sentences?**

- [ ] Requirement clarity: Is the ask clear enough to code, or does it need refinement?
- [ ] Dependency check: Does this block or get blocked by other work?
- [ ] Success criteria: What does "done" mean? (test coverage, performance, UX acceptance)
- [ ] Risk assessment: What could break? Database migration? API contract change? Backward compatibility?

**Outputs:**

- One-liner PRD (e.g., "Add real-time score sync to dashboard without blocking UI")
- Acceptance criteria list (3–5 measurable items, not "make it work")
- Known blockers or dependencies

**Exit condition:** Team or reviewer signs off on scope. If unclear, iterate intake—don't code yet.

---

## Phase 1: Design & Test Planning (10–30 min)

**Command: `/plan review`**

Run this to parse requirements, validate architecture, and outline test strategy:

```bash
# What you'll see:
# - File structure (what gets created/modified)
# - API surface (new endpoints, data models, breaking changes)
# - Test coverage plan (unit, integration, edge cases)
# - Rollback risk assessment
```

**Create a local `PHASE_PLAN.md` capturing:**

```markdown
## Architecture

- Core files affected: [app/components/Score.tsx, lib/api/sync.ts, ...]
- Database changes: None | Schema migration | New table
- API changes: Breaking | Additive | None

## Test Strategy

- Unit tests: [score calculation, sync retry logic]
- Integration tests: [dashboard + backend sync]
- E2E tests: [user performs action, sees update in <2s]
- Edge cases: [offline mode, concurrent requests, malformed payloads]

## Rollback Plan

- If tests fail catastrophically: revert to commit X
- If performance degrades: feature flag to disable real-time sync
```

**Exit condition:** You have a concrete test plan and understand failure modes. Proceed to Phase 2.

---

## Phase 2: Test-First Implementation (30 min–2 hours)

**Command: `/tdd setup`**

1. **Configure test baseline:**

   ```bash
   npm test -- --coverage --watchAll=false
   # Expected: 0% coverage (starting point)
   ```

2. **Create scaffold test file(s):**
   - For `lib/sync.ts`, create `__tests__/sync.test.ts` with red tests
   - Import the module you're building (it doesn't exist yet—this is the point)
   - Write 3–5 focused test cases covering happy path + edge cases

3. **Example scaffold:**

   ```typescript
   // __tests__/sync.test.ts
   import { syncScore } from '../lib/sync'

   describe('syncScore', () => {
     it('should POST score to /api/scores with user context', async () => {
       const result = await syncScore({ userId: '123', score: 95 })
       expect(result.status).toBe('synced')
     })

     it('should retry with exponential backoff on network error', async () => {
       // Mock fetch to fail twice, then succeed
       const result = await syncScore({ userId: '123', score: 95 })
       expect(result.attempts).toBe(3)
     })

     it('should throw on invalid payload', async () => {
       expect(() => syncScore({ userId: '', score: 95 })).toThrow('Invalid userId')
     })
   })
   ```

4. **Verify baseline:** Run tests. They should all fail (red state).

**Exit condition:** Test file exists, tests are failing as expected. You're ready to code.

---

## Phase 3: Feature Branch & Implementation (1–4 hours)

**Step 1: Create feature branch**

```bash
git checkout -b feat/phase-8-real-time-score-sync
git push -u origin feat/phase-8-real-time-score-sync
```

**Step 2: Code to pass tests (TDD loop)**

For each test:

1. Read the test
2. Write minimal code to make it pass
3. Run `npm test` (confirm it passes)
4. Move to next test
5. Refactor if patterns emerge

**Step 3: Commit incrementally with Conventional Commits**

```bash
# After making 1 test pass
git commit -m "feat(sync): implement basic POST to /api/scores"

# After retry logic
git commit -m "feat(sync): add exponential backoff on network errors"

# After validation
git commit -m "feat(sync): add input validation for userId and score"

# Type-ahead or type safety
git commit -m "test(sync): add TypeScript strict mode checks"

# Cleanup
git commit -m "refactor(sync): extract retry logic to shared utility"
```

**Never commit without passing tests.** If a test breaks, fix the code before committing.

**Exit condition:** All tests pass locally (`npm test` shows 0 failures). Coverage is 80%+ for new code.

---

## Phase 4: PR & Code Review (10–20 min)

**Step 1: Draft PR via `gh`**

```bash
gh pr create --title "feat: real-time score sync with exponential backoff" \
  --body "
## Overview
Enables live score updates on dashboard without blocking UI.

## Changes
- New sync API: POST /api/scores with userId + score
- Retry logic: exponential backoff (100ms, 200ms, 500ms)
- Input validation: rejects empty userId, score < 0

## Testing
- 8 unit tests (all passing)
- Integration test with mock backend (passes)
- Coverage: 82% (sync module)

## Breaking Changes
None. Feature is additive.

## Migration Notes
None required.
"
```

**Step 2: Automated review via `/code-review`**

```bash
# Linting
npm run lint -- --fix

# Type checking
npm run type-check

# Test coverage report
npm test -- --coverage

# Security scan (if available)
npm audit
```

**Step 3: Summary**

Create a `REVIEW_LOG.md`:

```markdown
## Code Review Findings

### Linting

- Result: 0 errors, 0 warnings
- Command: `npm run lint`

### Type Safety

- Result: TypeScript strict mode: 0 errors
- Command: `npm run type-check`

### Test Coverage

- Overall: 82% (target: 80%+)
- New module (sync.ts): 95%
- Uncovered: error recovery edge case (acceptable for MVP)

### Security

- npm audit: 0 vulnerabilities
- No hardcoded secrets or PII in code

### Severity Breakdown

- **Critical:** 0
- **High:** 0
- **Medium:** 0
- **Low:** 0
```

**Exit condition:** PR is open, review is complete, no blocking issues.

---

## Phase 5: CI/CD Pipeline Monitoring (5–30 min)

**Step 1: Monitor GitHub Actions**

```bash
# Watch the build in real-time
gh run watch

# Or check status
gh run list --branch feat/phase-8-real-time-score-sync --limit 1
```

**Step 2: If CI passes:**

```
✅ All checks passed
   - Tests (8/8)
   - Linting (0 errors)
   - Type check (0 errors)
   - Build (success)
```

**Step 3: If CI fails:**

```bash
# Fetch logs
gh run view <run-id> --log

# Parse the error:
# Example: "FAIL: syncScore test - fetch is not defined"

# Root cause: Mock not set up for fetch
# Fix: Update test setup to mock global fetch

# Patch & retry
git commit -m "fix(test): mock fetch in sync test setup"
git push

# Re-run
gh run watch
```

**Repeat until all checks pass.**

**Exit condition:** GitHub Actions shows all green. No failures in logs.

---

## Phase 6: Merge & Documentation (10–15 min)

**Step 1: Squash merge to main (if desired)**

```bash
# Option A: Squash (one commit per feature)
gh pr merge --squash

# Option B: Create merge commit
gh pr merge --create-merge-commit
```

**Step 2: Update documentation**

```bash
# If API changed:
# - Update API_DOCS.md or Swagger spec
# - Add endpoint: POST /api/scores

# If architecture changed:
# - Update ARCHITECTURE.md
# - Note: Real-time sync uses exponential backoff strategy

# If setup changed:
# - Update SETUP.md or .env.example
```

**Command: `/update-docs`**

Use this to auto-generate or validate that docs reflect the code:

```markdown
### Files Updated

- docs/api.md (added POST /api/scores endpoint)
- docs/architecture.md (noted retry strategy)

### Verification

- Docs pass link validation ✓
- Examples run without error ✓
- Diagrams up-to-date ✓
```

**Exit condition:** Docs are current. No references to old behavior or missing endpoints.

---

## Phase 7: Post-Execution Learning (5–10 min)

**Command: `/learn`**

Capture insights to avoid repeating mistakes or missing patterns:

```markdown
## What Went Well

- TDD forced us to think about error cases early
- Exponential backoff logic was simpler than expected
- Type safety caught 2 potential bugs before runtime

## What Was Blockers

- Mocking global fetch took 10 min to figure out (now documented)
- API contract wasn't spec'd until mid-implementation (added to intake checklist)

## Patterns to Replicate

- Scaffold tests before coding (saves 20% debugging time)
- Conventional commits make PR diffs scannable
- Early coverage threshold prevents technical debt

## Improvements for Next Feature

1. Add mock setup template to test scaffold
2. Require API spec in Phase 0 intake
3. Block PR merge if coverage drops below baseline
```

**Exit condition:** Retrospective is logged. Next feature starts with these insights baked in.

---

## Output: Development Journal

After all phases, generate a SINGLE markdown file:

### Template Structure

```markdown
# Development Journal: Real-Time Score Sync

## Phase Summary

- Phase 0 (Intake): 10 min
- Phase 1 (Planning): 15 min
- Phase 2 (TDD Setup): 5 min
- Phase 3 (Implementation): 90 min
- Phase 4 (PR & Review): 12 min
- Phase 5 (CI/CD): 8 min
- Phase 6 (Merge & Docs): 10 min
- Phase 7 (Learning): 5 min

**Total: 155 min (~2.6 hours)**

---

## Context & Acceptance Criteria

### Requirement

Enable real-time dashboard score updates without blocking the UI.

### Acceptance Criteria

1. Score syncs to backend within 2 seconds of user action
2. UI remains responsive during sync (no blocking calls)
3. Sync retries on network failure (max 3 attempts, exponential backoff)
4. Invalid payloads are rejected with clear error messages

---

## Architecture & Design Decisions

### File Structure Created

- `lib/sync.ts` - Core sync logic
- `__tests__/sync.test.ts` - Test suite
- `app/components/Score.tsx` - Dashboard component (modified)

### API Contract
```

POST /api/scores
Request: { userId: string, score: number }
Response: { status: 'synced' | 'queued', timestamp: ISO8601 }
Errors: 400 (validation), 500 (server), 503 (rate limit)

````

### Retry Strategy
- Attempt 1: immediate
- Attempt 2: 100ms delay
- Attempt 3: 300ms delay
- Backoff formula: `baseDelay * (2 ^ attempt)`

---

## Implementation Deep Dive

### Test-Driven Loop

#### Test 1: Basic POST
```typescript
it('should POST score to /api/scores', async () => {
  const result = await syncScore({ userId: '123', score: 95 });
  expect(result.status).toBe('synced');
});
````

**Implementation:**

```typescript
export async function syncScore(payload) {
  const response = await fetch('/api/scores', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.json()
}
```

**Result:** ✓ Passes

#### Test 2: Retry on Failure

```typescript
it('should retry with exponential backoff', async () => {
  // Mock fetch: fail twice, then succeed
  const result = await syncScore({ userId: '123', score: 95 })
  expect(result.attempts).toBe(3)
})
```

**Implementation:** [retry logic added]
**Result:** ✓ Passes

#### Test 3: Input Validation

```typescript
it('should reject empty userId', () => {
  expect(() => syncScore({ userId: '', score: 95 })).toThrow('Invalid userId')
})
```

**Implementation:** [validation logic added]
**Result:** ✓ Passes

### Test Coverage Report

```
Statements   : 82.4% ( 47/57 )
Branches     : 78.9% ( 15/19 )
Functions    : 90.0% ( 9/10 )
Lines        : 83.3% ( 45/54 )

Uncovered:
- Error recovery fallback (acceptable for MVP)
```

---

## Quality Assurance

### Code Review Findings

| Category      | Result | Details                      |
| ------------- | ------ | ---------------------------- |
| Linting       | ✓ Pass | 0 errors, 0 warnings         |
| Type Safety   | ✓ Pass | TypeScript strict mode clean |
| Test Coverage | ✓ Pass | 82% (target: 80%)            |
| Security      | ✓ Pass | npm audit: 0 vulnerabilities |
| Performance   | ✓ Pass | No new slowdowns detected    |

### Edge Cases Identified & Handled

| Case                | Handling                                    | Test |
| ------------------- | ------------------------------------------- | ---- |
| Network timeout     | Retry with exponential backoff (3x)         | ✓    |
| Malformed payload   | Validate userId & score before POST         | ✓    |
| Rate limiting (429) | Queue for retry, don't expose to UI         | ✓    |
| Offline mode        | Use IndexedDB queue (Phase 8.2 future work) | —    |

---

## CI/CD Pipeline

### GitHub Actions Configuration Used

- Node.js 18
- npm ci && npm test
- npm run lint
- npm run type-check
- npm run build

### Build Artifacts

- Test results: `coverage/index.html`
- Build output: `.next/` directory

### Deployment

- Vercel auto-deployment triggered on merge to main
- Feature deployed to production within 3 minutes
- No environment variables or secrets required

---

## Knowledge Artifacts

### Documentation Updated

- `docs/api.md` - Added POST /api/scores endpoint spec
- `docs/architecture.md` - Documented retry strategy pattern
- `README.md` - Updated feature checklist

### Patterns Captured

1. **TDD scaffold template** - Saved to `.templates/test-scaffold.ts`
2. **Retry utility** - Extracted to `lib/retry.ts` for reuse
3. **Fetch wrapper** - Added to `lib/http.ts` with built-in error handling

### Reusable Decisions

- Use exponential backoff for all async operations (networking, DB)
- Mock global fetch in tests via jest setup
- Require acceptance criteria in every PR

---

## Metrics & Retrospective

### Time Breakdown

- Intake & planning: 25 min (16%)
- Implementation: 90 min (58%)
- Review & CI/CD: 20 min (13%)
- Docs & learning: 20 min (13%)

### Issues Found & Resolved

1. **Typo in API route** - Caught by type checker, fixed before PR
2. **Missing userId validation** - Found during test planning, implemented in Phase 3
3. **Race condition in retry** - Discovered in integration test, resolved with async/await

### Coverage Analysis

- Statements: 82.4% (goal: 80%+) ✓
- Branches: 78.9% (acceptable for MVP)
- Edge case coverage: 90%+ (retry + validation)

### Performance Impact

- Sync latency: 50ms (happy path), 400ms (with retries)
- No measurable impact on dashboard render time
- Memory usage: <5MB per sync operation

### What To Do Differently Next Time

1. Define API contract in Phase 0 (saves mid-implementation clarification)
2. Create mock setup template to reduce test boilerplate
3. Add coverage baseline to pre-commit hook (prevents regressions)
4. Schedule retrospective immediately after merge (capture insights while fresh)

---

## Sign-Off

- **Feature branch:** feat/phase-8-real-time-score-sync
- **PR:** #234
- **Merge commit:** abc1234
- **Deployed:** 2026-04-11 14:22 UTC
- **Reviewed by:** @claude
- **Status:** ✓ Complete & Production Ready

````

---

## Workflow Meta-Rules

### When to Stop / Abort

- **Abort if:** Test suite can't be written (requirement is too vague) → return to Phase 0
- **Abort if:** Implementation fails 80%+ of tests → code is fundamentally wrong, revert and re-plan
- **Ship with caution if:** Coverage drops below 75% → document the risk, tag PR with `risk:coverage`
- **Ship with caution if:** CI takes >5 min → investigate performance, may indicate test suite bloat

### When to Escalate

- API contract changes mid-Phase 3 → pause, return to Phase 1, align on contract
- Database migration fails in CI → pause, get DBA sign-off, test in staging first
- Security scan flags a vulnerability → fix immediately before merge, don't ship

### Shortcuts & When They're OK

- **Squash commits** (Phase 6) only if feature is small (<200 lines, single responsibility)
- **Skip `/learn` phase** only if feature is trivial (true only rarely)
- **Reduce test coverage to 75%** only for experimental features with feature flag

---

## Commands Cheat Sheet

```bash
# Phase 1: Planning
/plan review

# Phase 2: Setup
/tdd setup

# Phase 3: Implementation
npm test --watch           # TDD loop
git commit -m "feat(...)"  # Incremental commits

# Phase 4: PR & Review
gh pr create --title "..."
/code-review

# Phase 5: CI/CD
gh run watch
gh run view <run-id> --log

# Phase 6: Merge & Docs
gh pr merge --squash
/update-docs

# Phase 7: Learning
/learn
````

---

## FAQ & Troubleshooting

### Q: Tests pass locally but fail in CI

**A:** Environment mismatch. Check:

- Node version (`npm --version`, `node --version`)
- Environment variables (`.env` vs `.env.ci`)
- Database state (run migrations in CI before tests)

### Q: CI takes 15+ minutes

**A:** Test suite is too slow. Options:

1. Run tests in parallel: `npm test -- --maxWorkers=4`
2. Split tests by type: unit (fast), integration (medium), e2e (slow)
3. Cache dependencies: `npm ci --prefer-offline`

### Q: Merge conflicts with main

**A:** Rebase & resolve:

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts manually
git push --force-with-lease
```

### Q: Forgot to run tests before committing

**A:** Undo the last commit:

```bash
git reset --soft HEAD~1
npm test
git commit -m "..."  # Try again
```

---

End of ECE Execution Workflow (Revised)
