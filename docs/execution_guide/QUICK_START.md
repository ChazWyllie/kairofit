# Quick Start: Getting Your Agent to Execute with Phase 0 + Execution Workflow

---

## The 5-File System

Your agent now has 5 files to work with:

1. **PHASE_0_CONTEXT_GATHERING.md** ← Agent uses this to DISCOVER work
2. **EXECUTION-CHECKLIST.md** ← Agent uses this for QUICK REFERENCE during all 7 phases
3. **EXECUTION-IMPROVED.md** ← Agent consults this for DETAILED GUIDANCE on how to do each step
4. **INTEGRATION_GUIDE.md** ← You read this to understand HOW the files work together
5. **DEVELOPMENT*JOURNAL*[TASK_ID].md** ← Agent OUTPUTS this after Phase 7

---

## Step 1: Set Up Your Repo

```bash
# Create directories
mkdir -p .github/phase-0
mkdir -p .github/journals

# Copy files from outputs to your repo
cp PHASE_0_CONTEXT_GATHERING.md docs/
cp EXECUTION-CHECKLIST.md docs/
cp EXECUTION-IMPROVED.md docs/

# Create a .gitignore for Phase 0 contexts (optional, but good practice)
# If you want Phase 0 files in git (recommended):
git add .github/phase-0/ .github/journals/
```

---

## Step 2: First Prompt - Agent Discovers Work

Give your agent this prompt:

```
You have three files to help you execute tasks autonomously:
1. PHASE_0_CONTEXT_GATHERING.md (in docs/)
2. EXECUTION-CHECKLIST.md (in docs/)
3. EXECUTION-IMPROVED.md (in docs/)

Your job: Analyze the Kairo repo for work items (bugs, features, refactors, tech debt).

For each work item found, use PHASE_0_CONTEXT_GATHERING.md to fill out complete context:
- Answer the questionnaire (Q1-Q5)
- Fill out the template (Part 2)
- Navigate the decision tree if you hit ambiguity (Part 3)
- Check all 6 quality gates (Part 4)

Output: Generate PHASE_0_CONTEXT_[TYPE]_[NAME].md files for the top 3-5 items.
Example: .github/phase-0/PHASE_0_CONTEXT_FEATURE_REAL_TIME_SYNC.md

These files should be human-readable Markdown. Include:
- Executive summary
- 3-sentence description
- Acceptance criteria (testable!)
- Architecture & files
- Testing strategy
- Dependencies & risks
- Quality gate checkboxes (all should be ✓)

Save them to .github/phase-0/ and let me review before proceeding.

Go.
```

**Agent's output:** 3-5 Phase 0 context files ready for your review.

---

## Step 3: You Review Phase 0 Contexts

Read the generated context files. Look for:

```
✓ Is the 3-sentence summary clear and specific?
✓ Are acceptance criteria testable (not subjective)?
✓ Are files to modify listed and bounded?
✓ Are dependencies identified?
✓ Do risks have mitigations?
✓ Are all 6 quality gates passing?
```

If anything needs clarification:

```
"Context file #2 (bug) needs refinement.
Acceptance criterion: 'Dashboard should be responsive'
→ Too vague. What does 'responsive' mean?
   Is it <500ms load time? 60fps during sync? Both?

Also confirm: Does the bug fix require a database migration?

Once clarified, I'll approve for Phase 1."
```

If all looks good:

```
"All 3 context files are ready. Proceeding with execution.
Start with #2 (bug - highest priority)."
```

---

## Step 4: Second Prompt - Agent Executes One Task (Full 7 Phases)

Give your agent this prompt:

```
Execute the complete 7-phase workflow for the bug fix task:

Reference 1: .github/phase-0/PHASE_0_CONTEXT_BUG_DASHBOARD_CRASH.md
(This tells you WHAT to build and WHY)

Reference 2: docs/EXECUTION-CHECKLIST.md
(This is your step-by-step checklist for phases 1-7)

Reference 3: docs/EXECUTION-IMPROVED.md
(Detailed explanations and examples if you get stuck)

Workflow:
1. Phase 1 (Planning): Use EXECUTION-CHECKLIST.md Phase 1 section
2. Phase 2 (TDD Setup): Use EXECUTION-CHECKLIST.md Phase 2 section
3. Phase 3 (Implementation): Code with TDD. Commit after each test passes.
4. Phase 4 (PR & Review): Open PR via gh. Run linting & type checks.
5. Phase 5 (CI/CD): Monitor GitHub Actions. Fix any failures.
6. Phase 6 (Merge & Docs): Merge and update docs.
7. Phase 7 (Learning): Generate retrospective.

Output 1: PR ready for team review (link to GitHub)
Output 2: Development journal at .github/journals/DEVELOPMENT_JOURNAL_BUG_DASHBOARD_CRASH.md

Go. Ask me for clarification if you hit a blocker.
```

**Agent's output:** PR + development journal, ready for review.

---

## Step 5: You Review & Merge

Read the PR and development journal:

```
PR: GitHub link (code changes, tests, commit history)
Journal: .github/journals/DEVELOPMENT_JOURNAL_BUG_DASHBOARD_CRASH.md
         (decisions, metrics, learnings)

✓ Approve in GitHub
✓ Merge to main
```

---

## Step 6: Repeat for Next Task (Optional)

If you want agent to tackle multiple tasks:

```
"Great job on the bug fix.
Now execute the next task: feature (real-time score sync).

Reference: .github/phase-0/PHASE_0_CONTEXT_FEATURE_REAL_TIME_SYNC.md

Follow the same workflow:
1. Check EXECUTION-CHECKLIST.md
2. Reference EXECUTION-IMPROVED.md if stuck
3. Output: PR + development journal

Go."
```

---

## Common Prompts for Your Agent

### Prompt 1: Autonomous Discovery & Execution

```
"Find all work items in the Kairo repo (bugs, features, refactors, tech debt).

For each:
1. Fill out PHASE_0_CONTEXT_GATHERING.md (questionnaire, template, gates)
2. Generate PHASE_0_CONTEXT_[TYPE]_[NAME].md
3. Wait for my approval

Once I approve (or refine), execute full 7-phase workflow:
1. Check EXECUTION-CHECKLIST.md for each phase
2. Reference EXECUTION-IMPROVED.md for detailed how-to
3. Output: PR + development journal

Let's do the top 3 items. Start with phase 0 context discovery."
```

### Prompt 2: Execute Specific Task

```
"I've approved this context:
.github/phase-0/PHASE_0_CONTEXT_DEBT_UPGRADE_JEST.md

Execute the full workflow using:
- EXECUTION-CHECKLIST.md (your step-by-step tasks)
- EXECUTION-IMPROVED.md (detailed reference)

Output: PR ready for review + development journal.
Ask for help if you're blocked."
```

### Prompt 3: Fix CI/CD Failure

```
"PR #456 has a CI/CD failure.

Phase 5 check:
- Read EXECUTION-IMPROVED.md → Phase 5 section (CI/CD)
- Run: gh run view <run-id> --log
- Diagnose: What's the root cause?
- Fix: Commit the fix, push, re-run

Report back with:
1. Root cause
2. Fix applied
3. New CI/CD status (passing?)
"
```

### Prompt 4: Generate Development Journal (If Missed)

```
"Complete Phase 7 (Learning) for the bug fix task:
- Reference: EXECUTION-IMPROVED.md → Phase 7 section
- Template: EXECUTION-IMPROVED.md → Output: Development Journal section

Generate: .github/journals/DEVELOPMENT_JOURNAL_BUG_DASHBOARD_CRASH.md
Includes:
- Time breakdown per phase
- Issues found & resolved
- Coverage metrics
- Patterns to replicate
- Improvements for next feature
"
```

---

## What to Expect from Your Agent

### Before Phase 1

Agent outputs:

```
✓ PHASE_0_CONTEXT_[TASK_ID].md
  - 3-sentence summary
  - Testable acceptance criteria
  - Files & dependencies
  - Risks & mitigations
  - Quality gates: all passing ✓
```

**Your action:** Review, refine (if needed), approve.

### After Phase 7

Agent outputs:

```
✓ PR: https://github.com/kaizen/kairo/pull/456
  - Tests all passing
  - Coverage: 82%+
  - Zero lint errors
  - Ready for team review

✓ Development Journal: .github/journals/DEVELOPMENT_JOURNAL_[TASK_ID].md
  - What was built
  - How it was built (test-first, TDD loop)
  - What was learned
  - Metrics & retrospective
```

**Your action:** Merge PR, keep journal for future reference.

---

## Timeline: From Discovery to Merge

### Typical Feature (1-4 hours of work)

| Step                   | Time       | Who   | Action                         |
| ---------------------- | ---------- | ----- | ------------------------------ |
| Phase 0 discovery      | 15 min     | Agent | Analyze repo, fill template    |
| Phase 0 review         | 10 min     | You   | Read context, refine if needed |
| Phase 1 planning       | 10 min     | Agent | Outline architecture, tests    |
| Phase 2 TDD setup      | 5 min      | Agent | Scaffold tests (red state)     |
| Phase 3 implementation | 1.5 h      | Agent | Code with TDD loop             |
| Phase 4 PR & review    | 15 min     | Agent | Lint, type check, open PR      |
| Phase 5 CI/CD          | 10 min     | Agent | Monitor build, fix failures    |
| Phase 6 merge & docs   | 10 min     | Agent | Merge, update docs             |
| Phase 7 retrospective  | 10 min     | Agent | Generate journal               |
| Your review & merge    | 10 min     | You   | Approve PR, merge to main      |
| **Total**              | **~3.5 h** |       |                                |

---

## File Organization in Your Repo

After following this guide, your repo should have:

```
kairo/
├── .github/
│   ├── phase-0/
│   │   ├── PHASE_0_CONTEXT_FEATURE_REAL_TIME_SYNC.md
│   │   ├── PHASE_0_CONTEXT_BUG_DASHBOARD_CRASH.md
│   │   └── PHASE_0_CONTEXT_DEBT_UPGRADE_JEST.md
│   │
│   └── journals/
│       ├── DEVELOPMENT_JOURNAL_FEATURE_REAL_TIME_SYNC.md
│       ├── DEVELOPMENT_JOURNAL_BUG_DASHBOARD_CRASH.md
│       └── DEVELOPMENT_JOURNAL_DEBT_UPGRADE_JEST.md
│
├── docs/
│   ├── PHASE_0_CONTEXT_GATHERING.md ← Agent reads this
│   ├── EXECUTION-CHECKLIST.md ← Agent reads this
│   ├── EXECUTION-IMPROVED.md ← Agent reads this
│   └── INTEGRATION_GUIDE.md ← You read this
│
├── src/
├── ...
```

---

## Troubleshooting: If Your Agent Gets Stuck

### Agent says: "Phase 0 context is too vague. What does 'better performance' mean?"

**Fix:** You need to refine the requirement with the issue author.
Agent should wait, not guess.

```
Agent: "Blocker. Requirement needs clarification.
Issue #123 says 'better performance' but doesn't specify:
- Better than what? Current: 2s, Target: ?
- Which metric? Load time? Throughput? Memory?
- Is 50% improvement enough, or 90%?

Please clarify before I proceed."

You: "Clarifies with issue author, comes back with specific targets."

Agent: "Got it. Updated Phase 0 context. Proceeding."
```

### Agent says: "Phase 1 planning blocked. Files to modify are unclear."

**Fix:** Agent should search the codebase for similar patterns.

```
Agent thought process:
"I need to find where [feature] would go.
Let me search:
- grep -r 'sync' to find similar code
- git log --grep 'sync' to see recent related changes
- GitHub search for PRs about sync

Found: lib/sync.ts already exists!
→ I'll modify that, plus app/components/Dashboard.tsx
```

If still unclear:

```
Agent: "Can't find similar code in the repo. What file would you modify
for a feature like [description]?"

You: "Modify X.ts and Y.tsx"

Agent: "Thanks. Proceeding."
```

### Agent says: "Phase 5 CI/CD failing. I can't diagnose."

**Fix:** Get the exact error logs and help agent understand.

```
Agent: "CI test failure. Error: 'ENOENT: no such file or directory'

This could be:
1. Environment variable missing
2. File not found in CI (but exists locally)
3. Working directory different in CI

What should I check first?"

You: "Check if .env.ci exists. Also verify the working directory."

Agent: "Found it! CI needs .env.ci. Adding that to GitHub Actions secrets..."
```

---

## Measuring Success

After your agent completes 3 tasks, you'll have:

✓ **3 Phase 0 context files** → Decision records for future reference
✓ **3 development journals** → Metrics, learnings, patterns
✓ **3 PRs merged** → Code delivered
✓ **Workflow improvements** → Each journal suggests tweaks for next time

Track these metrics after each task:

```
Task: Bug fix (dashboard crash)
- Phase 0: 15 min (context gathering)
- Phase 1-2: 10 min (planning & setup)
- Phase 3: 60 min (implementation)
- Phase 4-7: 45 min (review, CI/CD, docs, learning)
- Total: 130 min (~2.2 hours)
- Coverage: 85%
- Bugs found during testing: 2 (caught before code review)
- Regressions: 0
- Post-deployment issues: 0
```

After 3 tasks, you'll see:

- Faster Phase 0 contexts (agent learns what you need)
- Fewer CI/CD failures (agent gets better at testing)
- Better coverage (agent follows TDD rigorously)
- Clearer decisions (Phase 0 gets more thorough)

---

## Next: Go Live

1. **Copy all 5 files to your repo** (or .github/ as appropriate)
2. **Give your agent the first prompt** (Step 2 above)
3. **Review Phase 0 contexts** (Step 3)
4. **Approve & execute** (Step 4)
5. **Review & merge** (Step 5)
6. **Iterate & improve** (ongoing)

---

## Questions?

If your agent gets stuck on something not covered here:

- Reference: EXECUTION-IMPROVED.md (detailed explanations)
- Reference: INTEGRATION_GUIDE.md (how files work together)
- Ask me directly (I'm happy to clarify)

---

End of Quick Start
