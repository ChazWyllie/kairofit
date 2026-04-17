# ECE + Phase 0 System: One-Page Reference Card

**Print this or keep it open while working.**

---

## 7 Files at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. MASTER_SUMMARY.md          → Overview & system explanation   │
│ 2. QUICK_START.md             → Your entry point (read first!)  │
│ 3. PHASE_0_CONTEXT_GATHERING  → Agent's discovery framework     │
│ 4. EXECUTION_CHECKLIST        → Quick task checklist (use daily)│
│ 5. EXECUTION_IMPROVED         → Detailed reference (consult)    │
│ 6. INTEGRATION_GUIDE          → How files work together         │
│ 7. PHASE_0_CONTEXT_[TASK]     → Generated context (review)      │
│ 8. DEVELOPMENT_JOURNAL_[TASK] → Generated journal (archive)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent's Daily Workflow

### Morning: Discovery (30 min)

```
1. Agent reads PHASE_0_CONTEXT_GATHERING.md
2. Agent analyzes repo for work items
3. Agent fills out questionnaire (Q1-Q5)
4. Agent fills out template (Part 2)
5. Agent checks quality gates (Part 4)
6. Agent outputs PHASE_0_CONTEXT_[TASK_ID].md

OUTPUT: 3-5 context files waiting for your review
```

### Mid-Morning: Your Review (15 min)

```
1. You read PHASE_0_CONTEXT_[TASK_ID].md
2. You ask clarifications or approve as-is
3. You rank by priority

OUTPUT: Approved context + priority order
```

### Afternoon: Execution (3-4 hours for typical feature)

```
Phase 1 (10 min):  Agent reads EXECUTION_CHECKLIST → Planning
Phase 2 (5 min):   Agent sets up TDD tests
Phase 3 (90 min):  Agent codes with TDD (test → pass → commit cycle)
Phase 4 (15 min):  Agent opens PR via gh
Phase 5 (10 min):  Agent monitors CI/CD
Phase 6 (10 min):  Agent merges & updates docs
Phase 7 (10 min):  Agent generates development journal

OUTPUT: PR ready for team review + development journal
```

### Evening: Your Review (10 min)

```
1. You read PR + development journal
2. You approve & merge (or ask for changes)
3. You keep journal for institutional knowledge

OUTPUT: Code deployed + decision record archived
```

---

## Quality Gates (Check These!)

### Phase 0 (Before Phase 1 starts)

- [ ] 3-sentence summary is clear & specific (no "improve," "optimize," "handle")
- [ ] All acceptance criteria are testable (measurable, not subjective)
- [ ] Files to modify are listed & scoped
- [ ] Dependencies are identified (no mid-implementation surprises)
- [ ] Risks have mitigations or rollback plans
- [ ] Ready to code without asking questions

**BLOCK if:** Any gate fails. Refine Phase 0 first.

### Phase 3 (During Implementation)

- [ ] All tests pass locally before committing
- [ ] Coverage maintained (80%+)
- [ ] TypeScript strict mode clean
- [ ] No test commits breaking (each commit has passing tests)

**BLOCK if:** Tests failing → don't commit yet

### Phase 4-5 (PR & CI/CD)

- [ ] Linting passes (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds
- [ ] No security vulnerabilities

**BLOCK if:** Any check fails. Fix before merging.

---

## Key Commands (Agent Uses These)

```bash
# Setup & Testing
git checkout -b feat/phase-8-<name>        # Create branch
npm test -- --watch                        # TDD loop
npm test -- --coverage                     # Check coverage

# Code Quality
npm run lint --fix                         # Fix linting
npm run type-check                         # TypeScript check
npm run build                              # Build test

# Git & GitHub
git commit -m "feat(scope): description"   # Conventional commits
git push -u origin <branch>                # Push to remote
gh pr create --title "..." --body "..."    # Open PR
gh run watch                               # Watch CI/CD
gh run view <id> --log                     # Get logs if failure
gh pr merge --squash                       # Merge (squash commits)

# Agent Decision Points
git reset --soft HEAD~1                    # Undo last commit (keep changes)
git reset --hard origin/main               # ⚠️ ABORT: Revert everything
```

---

## Abort Conditions (Stop Here!)

**ABORT Phase 0 if:**

- Requirement too vague (can't write 3 sentences)
- Acceptance criteria aren't testable
- Files to modify are unknown

**ABORT Phase 1-2 if:**

- Can't outline test strategy
- Architecture is too complex to understand

**ABORT Phase 3 if:**

- 80%+ of tests failing (code is wrong)
- New blocker discovered (dependency missing)

**ABORT Phase 5 if:**

- Security vulnerability flagged
- CI/CD can't diagnose root cause (environment issue)

**ABORT Phase 6 if:**

- Coverage dropped below 75%
- Regressions found in existing tests

---

## Phase 0 Questionnaire (Agent Answers These)

```
Q1: What is the work item?
    Output: Title, Type (feature|bug|refactor|debt), Related files

Q2: Can you describe in 3 sentences?
    Output: 3 clear, specific sentences (no vague words)

Q3: What are the acceptance criteria?
    Output: 5-8 testable criteria (measurable, not subjective)

Q4: What are the dependencies?
    Output: List blockers, what this unblocks, teams to coordinate

Q5: What are the risks?
    Output: Risk severity, mitigation, rollback plan
```

---

## Prompts to Give Your Agent

### Prompt 1: Discover Work

```
"Analyze Kairo repo for work (bugs, features, refactor, debt).
Use PHASE_0_CONTEXT_GATHERING.md to fill out context for top 3 items.
Generate PHASE_0_CONTEXT_[TYPE]_[NAME].md files.
Wait for my review before Phase 1."
```

### Prompt 2: Execute Task

```
"Reference: .github/phase-0/PHASE_0_CONTEXT_BUG_DASHBOARD_CRASH.md
Execute full 7-phase workflow using EXECUTION-CHECKLIST.md.
Output: PR + development journal."
```

### Prompt 3: Fix CI/CD Failure

```
"CI failed. Use EXECUTION_IMPROVED.md → Phase 5 section.
Run: gh run view <id> --log
Diagnose root cause, fix, commit, push, re-run.
Report back with status."
```

---

## Metrics to Track

After each task, record:

```
Task: [Name]
- Time: Phase 0 ___ min, Phase 1-2 ___ min, Phase 3 ___ min, Phase 4-7 ___ min (Total: ___ min)
- Coverage: ___% (target 80%+)
- Issues found pre-review: ___ (caught before PR)
- Regressions: ___
- Post-deployment issues: ___
- Improvements for next time: [list]
```

**Track these** → After 3 tasks, you'll see patterns improving.

---

## Files in Your Repo

```
.github/
├── phase-0/
│   └── PHASE_0_CONTEXT_[TYPE]_[NAME].md (generated by agent)
└── journals/
    └── DEVELOPMENT_JOURNAL_[TYPE]_[NAME].md (generated by agent)

docs/
├── PHASE_0_CONTEXT_GATHERING.md (agent reads)
├── EXECUTION_CHECKLIST.md (agent reads daily)
├── EXECUTION_IMPROVED.md (agent consults)
├── INTEGRATION_GUIDE.md (you read)
└── QUICK_START.md (you read first)
```

---

## Decision Tree (If Agent Gets Ambiguous)

```
Is requirement clear?
├─ YES → Proceed ✓
└─ NO → BLOCK
   (Can't write 3 sentences without "improve," "optimize," "handle"?)

Are acceptance criteria testable?
├─ YES → Proceed ✓
└─ NO → BLOCK
   (Can each criterion be measured/tested?)

Are files to modify known?
├─ YES → Proceed ✓
└─ NO → BLOCK
   (Search codebase for similar patterns, or ask team)

Are dependencies identified?
├─ YES → Proceed ✓
└─ NO → BLOCK
   (Might discover mid-Phase 3, too late)

Are risks mitigated?
├─ YES, risk LOW/MEDIUM → Proceed ✓
├─ YES, risk HIGH → Proceed with caution
└─ NO → ESCALATE
   (High risk with no mitigation = don't proceed)
```

---

## TDD Loop (Agent Does This in Phase 3)

```
for each test:
  1. Read the test (what should the function do?)
  2. Run test → RED (test fails, function doesn't exist)
  3. Write minimal code to pass test
  4. Run test → GREEN (test passes)
  5. Refactor if needed (clean up code)
  6. Commit: "feat(scope): description"

  repeat until all tests pass
```

**Result:** Each commit is atomic (one test passing). Diffs are readable.

---

## Code Review Checklist (You Do This)

```
Before approving PR:
- [ ] Scope matches Phase 0 context (no scope creep)
- [ ] Tests are thorough (coverage 80%+)
- [ ] Edge cases handled
- [ ] TypeScript strict mode passes
- [ ] Docs are updated (if API/architecture changed)
- [ ] No security vulnerabilities
- [ ] Commit history is clean (readable diffs)
```

---

## Success Checklist (After 3 Tasks)

- [ ] Phase 0 discovery is faster (agent learns what to find)
- [ ] Implementation is faster (agent knows the pattern)
- [ ] Coverage is higher (TDD prevents bugs)
- [ ] CI/CD failures are lower (agent catches issues earlier)
- [ ] Development journals show learnings & improvements
- [ ] Team understands decisions (Phase 0 contexts document "why")

---

## Troubleshooting

| Problem                  | Check This                           | Fix                          |
| ------------------------ | ------------------------------------ | ---------------------------- |
| Phase 0 too vague        | Quality gates (all 6 passed?)        | Refine before Phase 1        |
| Tests failing in Phase 3 | Did agent run locally first?         | `npm test` before commit     |
| CI/CD failure            | Check logs: `gh run view <id> --log` | Diagnose & fix (see Phase 5) |
| Coverage dropped         | Did new code have tests?             | Add tests before commit      |
| Mid-Phase blocker        | Was dependency in Phase 0?           | Should have been identified  |

---

## Remember: The Goal

✓ **Clear requirements** (Phase 0)  
✓ **Test-first code** (Phases 2-3)  
✓ **Quality gates** (Each phase)  
✓ **No surprises** (Dependencies & risks identified upfront)  
✓ **Decision records** (Phase 0 contexts + journals in git)  
✓ **Continuous improvement** (Each journal feeds next task)

---

**Print this. Keep it open while executing.**

**Questions? Reference MASTER_SUMMARY.md or ask.**
