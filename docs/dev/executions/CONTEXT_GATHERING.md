# Phase 0: Context Gathering & Intake Framework

**Purpose:** Agent autonomously discovers and documents task context using this framework. Output is human-readable Markdown that feeds into EXECUTION-CHECKLIST.md and EXECUTION-IMPROVED.md.

**How to use:**

1. Agent reads this file
2. Agent answers the questionnaire based on repo analysis
3. Agent generates a `PHASE_0_CONTEXT_[TASK_ID].md` file
4. **You review and refine** (if anything needs clarification)
5. Agent uses the refined context file + EXECUTION-CHECKLIST.md to execute

---

## Part 1: Discovery Questionnaire

Agent: Answer these questions by analyzing the repo, existing issues, code review comments, and git history.

### Q1: What is the work item?

Analyze repo for:

- Open GitHub issues
- PR review comments
- Git commit messages mentioning TODOs
- Code comments with `FIXME` or `TODO`
- Test failures or coverage gaps
- Performance metrics or user feedback

**Example responses:**

- ✓ "Feature: Add real-time score sync to dashboard"
- ✓ "Bug: Dashboard crashes when user has 1000+ scores"
- ✓ "Refactor: Extract sync logic to shared utility (currently duplicated in 3 files)"
- ✓ "Debt: Migrate Jest setup from v28 to v30 (5 breaking changes in dependencies)"

**What to look for:**

- Issue title / PR description
- Related code files or modules
- Any context labels (bug, feature, refactor, tech-debt)

**Output format:**

```
Work Item: [One-liner title]
Type: [feature | bug | refactor | tech-debt]
Related Files: [list 2-5 key files affected]
Source: [GitHub issue #123 | PR #456 | Code review feedback | TODO comment]
```

---

### Q2: Can you describe this in 3 sentences?

**Why:** If you can't, the requirement is too vague. Return it for refinement.

**Agent process:**

1. Read the issue/PR/comment deeply
2. Extract: what needs to happen, why, and any constraints
3. Write 3 clear sentences (no jargon, no "make it work")

**Example (GOOD):**

```
1. Dashboard displays user scores updated every time they complete an action.
2. Scores sync to backend immediately without blocking the UI.
3. If the network fails, retry 3x with exponential backoff before failing silently.
```

**Example (BAD):**

```
1. Make the dashboard faster.
2. Users should see updates.
3. Handle network stuff.
```

**Output format:**

```markdown
## 3-Sentence Summary

1. [Sentence 1: What needs to happen]
2. [Sentence 2: Why / Context]
3. [Sentence 3: Constraints or edge cases]

**Clarity Rating:** [CLEAR | NEEDS REFINEMENT]
**If needs refinement, why:** [Specific gaps in the requirement]
```

---

### Q3: What are the acceptance criteria?

Acceptance criteria must be **testable** (not subjective).

**Agent process:**

1. Extract measurable outcomes from the issue
2. Look for: performance metrics, UX expectations, data accuracy, error handling
3. Convert vague statements into testable criteria

**Examples:**

**Feature - GOOD acceptance criteria:**

```
✓ Score syncs within 2 seconds of user action
✓ UI remains responsive (no frame drops during sync)
✓ Failed sync retries 3x automatically
✓ TypeScript strict mode passes
✓ 80%+ test coverage for new code
```

**Feature - BAD acceptance criteria:**

```
✗ "Make it work"
✗ "Users should be happy"
✗ "Performance is better"
```

**Bug - GOOD acceptance criteria:**

```
✓ Dashboard no longer crashes with 1000+ scores
✓ Memory usage stays <100MB with 1000 scores
✓ Load time <500ms with 1000 scores
✓ Existing tests still pass
```

**Refactor - GOOD acceptance criteria:**

```
✓ Sync logic extracted to lib/sync.ts
✓ Used by Dashboard.tsx, ProfilePage.tsx, and SettingsPage.tsx (3 places)
✓ No duplicate code remains
✓ All tests pass (no behavior changes)
✓ Type safety maintained
```

**Tech Debt - GOOD acceptance criteria:**

```
✓ Jest upgraded from v28 to v30
✓ All breaking changes in test files fixed
✓ CI/CD passes with new version
✓ No new vulnerabilities (npm audit clean)
```

**Output format:**

```markdown
## Acceptance Criteria

- [ ] Criterion 1 (measurable, testable)
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Criterion 4
- [ ] Criterion 5

**Criteria Quality:** [CLEAR | NEEDS REFINEMENT]
**If needs refinement:** [What's subjective / unmeasurable]
```

---

### Q4: What are the dependencies?

**Agent process:**

1. Scan the codebase for imports, API calls, database schemas
2. Check: Does this require other features to be done first?
3. Look at git history: Have related changes been made recently?
4. Check API contracts: Will this break existing endpoints?

**Examples:**

**Feature:**

```
✓ Depends on: /api/scores endpoint (being built in Phase 8.1)
✓ Blocks: Dashboard real-time update feature (waiting on this sync logic)
✗ No database migration needed
```

**Bug:**

```
✓ Depends on: Active user with 1000+ scores (test data requirement)
✗ No other feature dependencies
✓ May need to coordinate with DB team (schema change)
```

**Refactor:**

```
✓ Depends on: lib/sync.ts exports (must stay backward compatible)
✓ Blocks: Nothing (additive refactor)
✓ Affects: 3 files that import sync logic
```

**Output format:**

```markdown
## Dependencies & Blockers

### Blocking This Work

- [ ] [Dependency 1: description]
- [ ] [Dependency 2: description]
- [ ] [Dependency 3: description]

### This Work Blocks

- [ ] [Blocked feature: description]
- [ ] [Blocked feature: description]

### Cross-Team Coordination

- [ ] [Team 1: what they need to know]
- [ ] [Team 2: what they need to know]

**Impact:** [None | Low | Medium | High]
```

---

### Q5: What are the risks?

**Agent process:**

1. Think about failure modes: What could go wrong?
2. Check: Breaking changes, performance impact, data loss potential?
3. Look at similar features: Did they have issues?
4. Database changes: Data migration risks?

**Examples:**

**Feature - Risks:**

```
✓ Race condition if user clicks 10x quickly (need debounce)
✓ Performance if network is slow (need timeout)
✓ UI jank if sync blocks main thread (need async)
✗ No data loss risk
```

**Bug - Risks:**

```
✓ Fix might affect 1000+ existing users' data
✓ Rollback plan needed (feature flag?)
✗ No new dependencies introduced
```

**Refactor - Risks:**

```
✓ Extracting logic could introduce subtle bugs if tests miss edge cases
✓ Type changes could break existing code (need to stay backward compatible)
✗ No runtime performance risk
```

**Tech Debt - Risks:**

```
✓ Breaking changes in Jest v30 (5 test files need updates)
✓ Migration might uncover new bugs
✗ No data migration needed
```

**Output format:**

```markdown
## Risks & Mitigation

| Risk     | Severity         | Mitigation       | Rollback Plan |
| -------- | ---------------- | ---------------- | ------------- |
| [Risk 1] | HIGH / MED / LOW | [How to prevent] | [How to undo] |
| [Risk 2] |                  |                  |               |
| [Risk 3] |                  |                  |               |

**Overall Risk Level:** [LOW | MEDIUM | HIGH]
**Proceed?** [YES | NEEDS DISCUSSION | NO]
```

---

## Part 2: Context Template

Agent: Fill out this template based on answers to Part 1.

```markdown
# Phase 0 Context: [Work Item Title]

## Executive Summary

- **Work Item ID:** [Issue #123 or PR #456]
- **Type:** [feature | bug | refactor | tech-debt]
- **Priority:** [low | medium | high | critical]
- **Estimated Effort:** [quick <1h | medium 1-4h | large 4-8h | epic >8h]

---

## Requirement

### 3-Sentence Description

1. [What needs to happen]
2. [Why / Context]
3. [Constraints]

### Source

- [GitHub issue link or PR link or code comment]
- [Any related issues]

---

## Acceptance Criteria

All criteria must be testable (not subjective).

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Criterion 4
- [ ] Criterion 5

---

## Architecture & Files

### Files to Create

- [ ] `[path/to/new/file.ts]`

### Files to Modify

- [ ] `[path/to/existing/file.ts]` - [reason: add feature, fix bug, refactor]

### Database Changes

- [ ] [Schema migration needed: describe]
- [ ] [Data migration needed: describe]
- [ ] No database changes

### API Changes

- [ ] New endpoint: `POST /api/endpoint`
- [ ] Modified endpoint: `GET /api/endpoint` (additive change)
- [ ] Removed endpoint: [breaking change - needs migration]
- [ ] No API changes

---

## Testing Strategy

### Unit Tests

- [ ] Test case 1: [what it tests]
- [ ] Test case 2: [what it tests]

### Integration Tests

- [ ] Test case 1: [what it tests]

### E2E Tests (if needed)

- [ ] Test case 1: [what it tests]

### Edge Cases to Cover

- [ ] Edge case 1: [scenario + expected behavior]
- [ ] Edge case 2

### Coverage Target

- Target: 80%+ for new code
- Existing code: maintain current coverage

---

## Dependencies & Blockers

### Must be done first

- [ ] [Dependency 1]
- [ ] [Dependency 2]

### This unblocks

- [ ] [Feature 1]
- [ ] [Feature 2]

### No blockers

---

## Risks & Mitigation

| Risk   | Severity | Mitigation   | Rollback    |
| ------ | -------- | ------------ | ----------- |
| [Risk] | HIGH     | [Prevention] | [Undo plan] |

**Overall Risk:** LOW | MEDIUM | HIGH

---

## Success Metrics

How will we know this is done and done well?

- [ ] All acceptance criteria met
- [ ] Tests pass (unit, integration, E2E)
- [ ] Code review approved
- [ ] Deployed to production
- [ ] No regressions in related features

---

## Notes for Implementation

- [Any context for the developer]
- [Gotchas from similar features]
- [Performance or security considerations]
- [People to notify when done]

---

## Quality Gates (MUST PASS before Phase 1)

- [ ] All acceptance criteria are testable (not vague)
- [ ] 3-sentence summary is clear and specific
- [ ] Dependencies are identified (no surprises mid-implementation)
- [ ] Risks are acknowledged and have mitigations
- [ ] Files to modify are listed (scoped)
- [ ] Testing strategy is outlined (won't rely on guessing)

**Status:** READY | NEEDS REFINEMENT

If NEEDS REFINEMENT, describe what's missing:
[...]

---
```

---

## Part 3: Decision Tree (Agent uses this to navigate ambiguity)

Agent: If you encounter any of these scenarios during Phase 0, follow the branch.

### Scenario 1: Requirement is Vague

```
Question: Can you write 3 clear sentences without using words like "improve,"
          "better," "optimize," "fix," "handle," or "support"?

YES → Proceed to Phase 1 ✓
NO  → BLOCK. Return to issue author with:
      "Requirement needs clarification. Specifically: [what's vague]"

      Example vague words that need specifics:
      ✗ "Improve performance" → ✓ "Reduce load time from 2s to <500ms"
      ✗ "Handle errors better" → ✓ "Retry 3x with exponential backoff, then log error"
      ✗ "Make it work" → ✓ "Feature syncs within 2s without blocking UI"
```

### Scenario 2: Acceptance Criteria Are Not Testable

```
Question: Can each acceptance criterion be verified with a test or metric?
          (Not: "Users should be happy" or "Code should be clean")

YES → Proceed to Phase 1 ✓
NO  → BLOCK. Rewrite criteria to be measurable.

      Examples of fixing non-testable criteria:
      ✗ "Dashboard should be responsive"
         ✓ "Dashboard loads in <500ms, maintains 60fps during sync"

      ✗ "Code should be clean"
         ✓ "TypeScript strict mode passes, linting passes, 80%+ coverage"
```

### Scenario 3: You Don't Know What Files to Modify

```
Question: Have you searched the codebase for related code?
          (grep, IDE search, git log of similar features)

YES, found related code → Proceed with that context ✓
NO  → BLOCK. Search deeper:
      - Look for similar features in the codebase
      - Check git history: what files changed for similar work?
      - Ask: "Is this feature new, or extending existing code?"
      - If still unclear: request clarification from team
```

### Scenario 4: Risk is High But No Mitigation Exists

```
Question: Is there a way to reduce this risk?
          (feature flag, canary deploy, rollback plan, test coverage)

YES, risk can be mitigated → Proceed with mitigation plan ✓
NO  → ESCALATE.
      Examples:
      ✗ Risk: "This changes how all user scores are stored"
         Mitigation: Feature flag to roll back, deploy to staging first
      ✗ Risk: "Database migration affects 1M records"
         Mitigation: Run migration in background, verify, then commit
```

### Scenario 5: This Feature Depends on Another That's Not Done

```
Question: Is the blocker nearly done (this week) or far away (next month)?

NEARLY DONE (this week)  → WAIT or build in parallel ✓
FAR AWAY (later)         → BLOCK. Options:
                          1. Build feature flag (feature works behind flag)
                          2. Mock the dependency (use stub for now)
                          3. Rescope this work to not depend on blocker
                          4. Wait for blocker (acceptable if low priority)
```

### Scenario 6: API Contract Is Not Spec'd

```
Question: Is the API endpoint spec documented (request, response, errors)?

YES → Proceed ✓
NO  → BLOCK. Create the spec first:
      Endpoint: POST /api/scores
      Request:  { userId: string, score: number }
      Response: { status: 'synced' | 'queued', timestamp: ISO8601 }
      Errors:   400 (validation), 500 (server), 503 (rate limit)

      Don't code without this contract defined.
```

### Scenario 7: This Work Requires Breaking Changes

```
Question: Is there a migration path?
          (versioning, feature flag, gradual rollout)

YES, migration exists → Document it in Phase 0 ✓
NO  → FLAG with "BREAKING CHANGE" label.
      Examples:
      ✓ "Changing /api/scores request format → v2 endpoint, v1 deprecated"
      ✗ "Deleting /api/scores endpoint without replacement"
```

---

## Part 4: Quality Gates (MUST PASS)

Agent: Before flagging Phase 0 as complete, verify ALL of these:

### Gate 1: Clarity

- [ ] 3-sentence summary uses specific, testable language (no "improve," "optimize," "handle")
- [ ] Requirement can be understood by someone unfamiliar with the codebase
- [ ] No ambiguous terms remain

**Fail → Return to author for refinement**

### Gate 2: Testability

- [ ] Each acceptance criterion can be verified with a test or metric
- [ ] No subjective criteria (e.g., "code should be clean")
- [ ] Success can be measured, not guessed

**Fail → Rewrite acceptance criteria**

### Gate 3: Scope

- [ ] Files to modify are listed (bounded, not "TBD")
- [ ] Database changes are identified (if any)
- [ ] API changes are scoped (if any)

**Fail → Too vague, needs refinement**

### Gate 4: Dependencies

- [ ] All blockers identified (won't discover mid-implementation)
- [ ] Mitigation plan exists if blocker is upstream
- [ ] No surprise dependencies

**Fail → Return to Phase 0, identify all dependencies**

### Gate 5: Risks

- [ ] Risks are acknowledged and realistic
- [ ] Each risk has a mitigation or rollback plan
- [ ] Risk level is rated (LOW, MEDIUM, HIGH)

**Fail if:** Risk is HIGH and no mitigation exists → escalate

### Gate 6: Readiness

- [ ] Do we have all context needed to start Phase 1?
- [ ] Can the developer code without asking clarifying questions?
- [ ] Are there no ambiguities left?

**Fail → Refine Phase 0 until developer can start coding immediately**

---

## Part 5: Output File Structure

Agent: Generate this file after completing Parts 1–4. Save as `PHASE_0_CONTEXT_[TASK_ID].md`

**File location:** `.github/phase-0/PHASE_0_CONTEXT_[TASK_ID].md`

**File naming:**

- `PHASE_0_CONTEXT_FEATURE_SCORE_SYNC.md` (for feature work)
- `PHASE_0_CONTEXT_BUG_DASHBOARD_CRASH.md` (for bug fix)
- `PHASE_0_CONTEXT_REFACTOR_EXTRACT_SYNC.md` (for refactor)
- `PHASE_0_CONTEXT_DEBT_UPGRADE_JEST.md` (for tech debt)

**Example structure:**

```markdown
# Phase 0 Context: Real-Time Score Sync

[Template from Part 2, filled out]

## Quality Gate Status

- [x] Clarity ✓
- [x] Testability ✓
- [x] Scope ✓
- [x] Dependencies ✓
- [x] Risks ✓
- [x] Readiness ✓

**Status: READY FOR PHASE 1**

---

## Next Steps

1. Proceed to EXECUTION-CHECKLIST.md, Phase 1 (Planning)
2. Reference this file during implementation (if questions arise)
3. If new risks discovered, update this file
```

---

## How Agent Uses This + EXECUTION-CHECKLIST.md Together

### Workflow:

1. **Agent reads THIS file (PHASE_0_CONTEXT_GATHERING.md)**
   → Fills out Parts 1–4 (questionnaire, template, decision tree, gates)

2. **Agent generates PHASE*0_CONTEXT*[TASK_ID].md**
   → Human reviews and refines (if anything needs clarification)

3. **Agent uses refined context + EXECUTION-CHECKLIST.md to execute**
   → Phase 1: Planning ✓
   → Phase 2: TDD Setup ✓
   → Phase 3: Implementation ✓
   → ... (all phases)

### During execution, agent references:

- **PHASE*0_CONTEXT*[TASK_ID].md:** "What am I building? Why? What's done?"
- **EXECUTION-CHECKLIST.md:** "What do I do right now? What's the next step?"
- **EXECUTION-IMPROVED.md:** "How do I do it? What's the full process?"

---

## Example: Agent Fills Out Phase 0 for a Real Feature

### Given: GitHub Issue #234

```
Title: Add real-time score sync to dashboard
Description:
Users are confused because their dashboard score doesn't update immediately
after they complete an action. It only updates when they refresh the page.

We should make scores sync in real-time without blocking the UI.
```

### Agent's Questionnaire Answers:

**Q1: What is the work item?**

```
Work Item: Add real-time score sync to dashboard
Type: feature
Related Files: app/components/Dashboard.tsx, lib/sync.ts (doesn't exist yet),
              app/api/scores/route.ts
Source: GitHub issue #234
```

**Q2: 3-Sentence Summary**

```
1. Dashboard displays user scores that update in real-time when
   the user completes an action.
2. Scores sync to backend immediately via POST /api/scores without
   blocking the UI (async).
3. If the network fails, retry 3x with exponential backoff; if all
   retries fail, show silent error (don't block UX).

Clarity Rating: CLEAR
```

**Q3: Acceptance Criteria**

```
- [ ] Score syncs within 2 seconds of user action
- [ ] UI remains responsive (60fps, no frame drops during sync)
- [ ] Failed sync retries 3x with exponential backoff (100ms, 300ms, 900ms)
- [ ] Invalid payloads rejected with error message
- [ ] TypeScript strict mode passes
- [ ] 80%+ test coverage for new code
- [ ] No regressions in existing tests
```

**Q4: Dependencies**

```
Blocking this work: None
This work blocks: Dashboard performance improvements (Phase 8.2)
Cross-team coordination: Backend team (they need to ensure /api/scores
                        can handle 10x more traffic during real-time syncs)
```

**Q5: Risks**

```
| Risk | Severity | Mitigation | Rollback |
|------|----------|-----------|----------|
| Race condition if user clicks 10x quickly | HIGH | Debounce sync to 1/second | Feature flag to disable |
| Network slow/timeout blocks UX | MED | Use async, add timeout (2s) | Fall back to page refresh |
| Database gets overloaded with syncs | MED | Batch syncs, rate limit | Disable real-time, use polling |

Overall Risk: MEDIUM
```

### Agent's Generated Output File: `PHASE_0_CONTEXT_FEATURE_SCORE_SYNC.md`

```markdown
# Phase 0 Context: Real-Time Score Sync

## Executive Summary

- **Work Item ID:** Issue #234
- **Type:** feature
- **Priority:** high
- **Estimated Effort:** medium (1-4 hours)

## Requirement

### 3-Sentence Description

1. Dashboard displays user scores that update in real-time when
   the user completes an action.
2. Scores sync to backend immediately via POST /api/scores without
   blocking the UI (async).
3. If the network fails, retry 3x with exponential backoff; if all
   retries fail, show silent error (don't block UX).

### Source

- GitHub issue #234: "Score doesn't update in real-time"
- Related: PR #210 (previous attempt at real-time, reverted due to perf)

## Acceptance Criteria

- [ ] Score syncs within 2 seconds of user action
- [ ] UI remains responsive (60fps, no frame drops)
- [ ] Failed sync retries 3x with exponential backoff
- [ ] Invalid payloads rejected with error message
- [ ] TypeScript strict mode passes
- [ ] 80%+ test coverage for new code
- [ ] No regressions in existing tests

## Architecture & Files

### Files to Create

- [ ] `lib/sync.ts` - Core sync logic + retry

### Files to Modify

- [ ] `app/components/Dashboard.tsx` - Call sync on action
- [ ] `app/api/scores/route.ts` - Handle POST endpoint

### API Changes

- New endpoint: `POST /api/scores`
  - Request: `{ userId: string, score: number }`
  - Response: `{ status: 'synced' | 'queued', timestamp: ISO8601 }`
  - Errors: 400 (validation), 500 (server), 503 (rate limit)

## Testing Strategy

### Unit Tests

- Sync function with valid payload → returns 'synced'
- Sync function with invalid payload → throws validation error
- Retry logic: fetch fails 2x, succeeds on 3rd → returns 'synced'
- Debounce: multiple clicks within 1s → only 1 sync call

### Integration Tests

- Dashboard + backend sync → score updates on screen

### Edge Cases

- User offline → retry queued, resume when online
- Network timeout (2s+) → give up gracefully
- Concurrent syncs → debounce to 1/second

## Dependencies & Blockers

### Must be done first

- None (independent feature)

### This unblocks

- Dashboard performance improvements (Phase 8.2)

## Risks & Mitigation

| Risk                         | Severity | Mitigation              | Rollback                           |
| ---------------------------- | -------- | ----------------------- | ---------------------------------- |
| Race condition on 10x clicks | HIGH     | Debounce to 1/second    | Feature flag                       |
| Network timeout hangs UX     | MED      | Add 2s timeout          | Timeout falls back to silent fail  |
| DB overload                  | MED      | Batch syncs, rate limit | Disable real-time if metrics spike |

Overall Risk: MEDIUM

## Quality Gate Status

- [x] Clarity ✓ (3 sentences, specific language)
- [x] Testability ✓ (all criteria measurable)
- [x] Scope ✓ (files listed, changes bounded)
- [x] Dependencies ✓ (no blockers)
- [x] Risks ✓ (identified, mitigations exist)
- [x] Readiness ✓ (ready to code)

**Status: READY FOR PHASE 1**

## Next Steps

1. Proceed to EXECUTION-CHECKLIST.md → Phase 1 (Planning)
2. Refer to this file during implementation
3. If risks change, update this file
```

### Human Reviews & Refines (optional)

```markdown
# Feedback from Kaizen

✓ Looks good, one clarification:

- "Silent error" in requirement #3 → does this mean log to Sentry or just
  don't show user message?

After review, agent proceeds with both files → starts Phase 1 Planning.
```

---

## Cheat Sheet: Agent Should Follow This Order

### Step 1: Analyze the repo

```bash
# Find work items
- Open issues in GitHub
- Recent PR comments with suggestions
- Git commits with "TODO" or "FIXME"
- Test failures
- Code quality metrics
```

### Step 2: Answer the questionnaire (Part 1)

```
Q1: What is the work item?
Q2: 3-sentence summary?
Q3: Acceptance criteria?
Q4: Dependencies?
Q5: Risks?
```

### Step 3: Fill out the template (Part 2)

```
Copy the template
Fill in: requirement, criteria, files, tests, risks, gates
```

### Step 4: Navigate decision tree (Part 3)

```
For each ambiguity, follow the decision tree
If BLOCK → get clarification
If PROCEED → continue
```

### Step 4: Check quality gates (Part 4)

```
All 6 gates must PASS
If any gate FAILs → refine Phase 0
```

### Step 5: Generate output file (Part 5)

```
Save as .github/phase-0/PHASE_0_CONTEXT_[TASK_ID].md
Format: Markdown, structured sections
Status: READY FOR PHASE 1
```

### Step 6: Human reviews (optional)

```
Human reads the file
Asks clarifications if needed
Approves for Phase 1
```

### Step 7: Agent executes (using both files)

```
Reference: PHASE_0_CONTEXT_[TASK_ID].md (what to build)
Reference: EXECUTION-CHECKLIST.md (how to build it)
Execute: EXECUTION-IMPROVED.md (full process)
```

---

## FAQ: Common Questions for Agent

### Q: What if the issue is too vague to answer these questions?

**A:** BLOCK. Add a comment to the GitHub issue:

```
"This issue needs clarification before development can start:
1. What specifically needs to change? (current behavior → desired behavior)
2. How will we measure success? (current metric: X, target: Y)
3. Are there any constraints? (performance, backward compatibility, etc.)

Please clarify so we can proceed."
```

### Q: What if there are multiple interpretations of the requirement?

**A:** Document all interpretations in Phase 0, then ask human to pick:

```
Interpretation A: Real-time sync = within 2 seconds
Interpretation B: Real-time sync = immediate (sub-100ms)

Question for Kaizen: Which interpretation is correct?
(A assumes we batch/debounce, B requires more aggressive polling)
```

### Q: What if the risk is HIGH but we need to ship anyway?

**A:** Document it clearly:

```
Risk: HIGH (database might get overloaded)
Mitigation: Feature flag to disable if metrics spike
Monitoring: Alert if /api/scores latency > 1s

Proceed?: YES, but with monitoring and killswitch
```

### Q: Can I start Phase 1 if one quality gate isn't perfect?

**A:** No. All 6 gates must PASS:

- Clarity ✓
- Testability ✓
- Scope ✓
- Dependencies ✓
- Risks ✓
- Readiness ✓

If one fails, refine Phase 0 until all pass.

---

## End of Phase 0 Context Gathering Framework

**Next:** Agent uses this file + EXECUTION-CHECKLIST.md to complete tasks.

**Human's role:** Review generated PHASE*0_CONTEXT*[TASK_ID].md files, refine as needed, approve for Phase 1.
