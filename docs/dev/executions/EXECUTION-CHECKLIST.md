# ECE Execution Checklist (Minimal)

Use this checklist during each phase of feature development.

---

## Phase 0: Intake ✓

- [ ] Can you describe the feature in 3 sentences?
- [ ] Acceptance criteria are testable (not vague)
- [ ] Dependencies or blockers identified
- [ ] Success metrics defined ("done" = ?)

**Block if:** Any item is unclear. Return to requirements.

---

## Phase 1: Planning ✓

- [ ] Files to create/modify identified
- [ ] API changes documented (breaking or additive?)
- [ ] Test strategy outlined (unit, integration, edge cases)
- [ ] Rollback plan exists

**Block if:** Can't outline the test strategy. Requirement is too complex.

---

## Phase 2: Test Setup ✓

- [ ] Test file(s) created with scaffold
- [ ] Tests are failing (red state)
- [ ] Baseline coverage checked (`npm test -- --coverage`)
- [ ] Test runner validates before proceeding

**Block if:** Tests won't run. Fix environment before coding.

---

## Phase 3: Implementation ✓

- [ ] One test passing → one commit (repeat)
- [ ] All tests passing before moving to next test
- [ ] No test committed that doesn't pass locally
- [ ] Branch pushed regularly (not just at end)

**Block if:** More than 3 tests failing. Debug before proceeding.

---

## Phase 4: PR & Review ✓

- [ ] PR title follows Conventional Commits (`feat:`, `fix:`, etc.)
- [ ] PR description includes: changes, tests, breaking changes, migration notes
- [ ] Linting passes (`npm run lint`)
- [ ] Type checker clean (`npm run type-check`)
- [ ] Test coverage report included

**Block if:** Any of these fail. Fix before opening PR.

---

## Phase 5: CI/CD Monitoring ✓

- [ ] GitHub Actions started automatically
- [ ] Watch the build: `gh run watch`
- [ ] All checks green (tests, lint, type, build)
- [ ] If failure: capture log, diagnose, fix, push, re-run

**Block if:** Can't identify root cause. Escalate.

**Abort if:** CI failure unrelated to your code. Check if main is broken first.

---

## Phase 6: Merge & Documentation ✓

- [ ] Merge to main: `gh pr merge --squash` (or create-merge-commit)
- [ ] Update docs if API or architecture changed
- [ ] Verify links in updated docs
- [ ] No references to old behavior remain

**Block if:** Docs are stale. Update them.

---

## Phase 7: Learning ✓

- [ ] Document what went well
- [ ] Document blockers
- [ ] Identify patterns to replicate
- [ ] List improvements for next feature

**Do not skip:** This becomes institutional knowledge.

---

## Quick Quality Gates

### Before committing:

```bash
npm test               # All tests pass?
npm run lint --fix     # Linting clean?
npm run type-check     # Types valid?
git status            # Only expected files changed?
```

### Before opening PR:

```bash
npm test -- --coverage  # Coverage meets target (80%+)?
npm run type-check      # TypeScript strict?
npm run build          # Build succeeds?
```

### If CI fails:

- [ ] Fetch logs: `gh run view <run-id> --log`
- [ ] Identify error type (test, lint, type, build)
- [ ] Fix locally
- [ ] Commit: `git commit -m "fix(test): ..."`
- [ ] Push: `git push`
- [ ] Re-run: `gh run watch`

---

## Abort Conditions

STOP and do not proceed if:

- [ ] Test suite can't be written (requirement too vague) → return to Phase 0
- [ ] 80%+ of tests fail (code fundamentally wrong) → revert feature branch
- [ ] Merge conflicts too complex (lost track of changes) → rebase and re-plan
- [ ] Security scan flags critical vulnerability → fix before merging
- [ ] Database migration fails in CI → get DBA sign-off, test in staging first

---

## Optional Shortcuts

Only use these if conditions are met:

### Squash commits (vs. merge commit)

- **Only if:** Feature is <200 lines AND single responsibility
- **Otherwise:** Use merge commit to preserve history

### Skip integration tests

- **Only if:** Feature is isolated (no dependencies)
- **Otherwise:** Integration tests required

### Reduce coverage to 75%

- **Only if:** Feature is experimental with feature flag
- **Otherwise:** Maintain 80%+ coverage

---

## Sign-Off

Before closing the issue/PR:

- [ ] Feature works as intended (acceptance criteria met)
- [ ] Tests pass (all 4 types: unit, integration, E2E, type checks)
- [ ] Docs updated
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Deployed to production (or staging for review)

---

## Time Budget

Expected timing (adjust based on complexity):

| Phase   | Time      | Notes                                 |
| ------- | --------- | ------------------------------------- |
| Phase 0 | 5-15 min  | Can be faster with clear requirements |
| Phase 1 | 10-30 min | Plan complexity with code complexity  |
| Phase 2 | 5-10 min  | Just scaffold + verify baseline       |
| Phase 3 | 1-4 hours | Core work; most time spent here       |
| Phase 4 | 10-20 min | Auto-checks should pass on first try  |
| Phase 5 | 5-30 min  | Varies; depends on CI speed           |
| Phase 6 | 10-15 min | Merge + docs update                   |
| Phase 7 | 5-10 min  | Retrospective                         |

**Total:** ~3-5 hours for a medium feature

---

## Useful Commands

```bash
# Feature setup
git checkout -b feat/phase-8-<name>
git push -u origin feat/phase-8-<name>

# TDD loop
npm test -- --watch

# Pre-PR checks
npm run lint --fix && npm run type-check && npm test -- --coverage

# PR operations
gh pr create --title "feat: ..."
gh pr review

# CI/CD monitoring
gh run watch
gh run view <id> --log

# Merge options
gh pr merge --squash              # One commit
gh pr merge --create-merge-commit # Preserve commits

# Emergency undo
git reset --hard origin/main      # ⚠️ DANGEROUS
```

---

## Team Checklist

If integrating this workflow into your team:

- [ ] Share the full workflow doc (EXECUTION-IMPROVED.md)
- [ ] Share this checklist in your repo (e.g., `.github/EXECUTION_CHECKLIST.md`)
- [ ] Add checklist to PR template or pre-commit hook
- [ ] Do a retrospective after first 3 features using this workflow
- [ ] Adjust phases based on team feedback
- [ ] Make it a requirement for all PRs (not optional)

---

End of Checklist
