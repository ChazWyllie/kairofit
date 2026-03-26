---
name: git-workflow
description: >
  KairoFit branch, commit, and PR workflow. Use this skill whenever creating a branch,
  writing a commit message, opening a PR, or reviewing whether code is merge-ready.
  Covers the two-repo setup (Google Drive + local), conventional commits, CI gate
  requirements, and how to use the existing PR template and GitHub Actions pipeline.
  Triggers when: starting new work, committing changes, creating a PR, or running
  pre-merge checks.
---

# Git Workflow

## Two-repo setup (Windows only)

KairoFit has two paths that must stay in sync:

| Path                            | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `g:\My Drive\Projects\kairofit` | Source of truth for file edits (Google Drive)  |
| `C:\Projects\kairofit`          | Git and npm commands - node_modules lives here |

**Rule**: All `git` and `npm` commands run from `C:\Projects\kairofit`.
Write new files to both paths. When files differ, `C:\Projects\kairofit` is authoritative
for git - it is what gets committed and pushed.

On Mac: only one path exists. Clone the repo, run everything from that directory.

---

## Branch naming

```
feat/short-description       # new functionality
fix/short-description        # bug fix
chore/short-description      # non-functional (deps, config, docs)
refactor/short-description   # restructure without behavior change
```

Examples:

```
feat/auth-infrastructure
feat/program-generation
fix/onboarding-persist-store
chore/rename-master-to-main
```

Create from `main` (or `master` until renamed):

```bash
cd "C:\Projects\kairofit"
git checkout main
git pull
git checkout -b feat/your-feature
```

---

## Commit messages (Conventional Commits)

Format: `type: short imperative summary`

```
feat: add createAccountAction with OTP magic link
fix: restore Zustand onboarding store on page reload
chore: rename master branch to main
refactor: extract saveProgramToDb into queries/programs.ts
```

Rules:

- Lowercase after the colon
- Imperative mood ("add", "fix", "rename" - not "added", "fixes", "renaming")
- Under 72 characters for the subject line
- No period at the end
- No em dashes anywhere

For multi-line messages (when the why is non-obvious):

```bash
git commit -m "$(cat <<'EOF'
feat: add createAccountAction with OTP magic link

Sends Supabase magic link, then moves onboarding forward while auth
resolves in the background. auth_ready flag in Zustand coordinates
the race condition with program-building screen.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## PR size guidelines

Each PR should do exactly one thing. As a solo developer the value is:

1. CI runs automatically on every PR before merge
2. Clean history - each PR maps to one logical change
3. Easy rollback - revert one PR without touching others

Natural boundaries for the auth + onboarding-to-DB plan:

| PR  | Branch                     | Contains                                                           |
| --- | -------------------------- | ------------------------------------------------------------------ |
| 1   | `feat/auth-infrastructure` | Zustand persist, auth callback route, `createAccountAction`        |
| 2   | `feat/program-generation`  | `saveOnboardingProfileAction`, `generateProgramAction`, DB queries |
| 3   | `feat/onboarding-wiring`   | Wire email-gate + program-building screens to actions              |
| 4   | `feat/dashboard`           | Minimal dashboard page + login OTP form                            |

PRs 1 and 2 are independent and can be opened simultaneously.
PR 3 should not be merged until 1 and 2 are merged (it imports their actions).
PR 4 is independent of 1-3.

---

## CI gate - what must pass before merge

The pipeline in `.github/workflows/ci.yml` runs these checks in order:

| Step            | Command                        | What it catches                               |
| --------------- | ------------------------------ | --------------------------------------------- |
| TypeScript      | `npm run typecheck`            | Type errors, missing imports                  |
| ESLint          | `npm run lint`                 | Code quality rules                            |
| Kiro voice lint | `npm run lint:kiro`            | Em dashes, banned phrases in output strings   |
| Prettier        | `npm run format:check`         | Formatting inconsistencies                    |
| Security audit  | `npm audit --audit-level=high` | High/critical CVEs in deps                    |
| Unit tests      | `npm test`                     | Logic correctness                             |
| Build           | `npm run build`                | Next.js compilation with placeholder env vars |
| E2E             | `npm run test:e2e`             | Full flow (runs only on PRs targeting `main`) |

All steps must be green before merging. Run them locally before pushing:

```bash
cd "C:\Projects\kairofit"
npm run format && npm run typecheck && npm run lint && npm run lint:kiro && npm test
```

Run `npm run format` first - Prettier reformats in place. If files change, stage and
include them in the commit. Never commit unformatted code.

**Note**: CI targets `main` branch. If the default branch is `master`, rename it:

```bash
git branch -m master main
git push origin -u main
# Then update the default branch in GitHub repo settings
```

---

## Opening a PR

Use the `gh` CLI - it picks up the PR template automatically:

```bash
cd "C:\Projects\kairofit"
git push -u origin feat/your-feature

gh pr create \
  --title "feat: short description" \
  --body "$(cat <<'EOF'
## What changed and why

One paragraph describing what this PR does and why it was needed.

## Type of change

- [x] New feature

## Checklist

### Always
- [x] `npm run typecheck` passes with 0 errors
- [x] `npm run lint` passes with 0 errors
- [x] `npm run lint:kiro` passes (no em dashes, no banned phrases)
- [x] `npm test` passes

### If touching AI / workout generation
- [ ] All LLM output passes through `workout-validator.ts` before saving
- [ ] No motivational fluff in any Kiro output strings
- [ ] Science parameters (volume, rest, reps) match `PROGRAMMING_RULES.md`

### If adding a new database table or migration
- [ ] RLS is enabled on the table
- [ ] All write policies have `WITH CHECK` (not just `USING`)
- [ ] Indexes added for all columns used in WHERE clauses
- [ ] `updated_at` trigger added if the table has an `updated_at` column
- [ ] Ran `npm run db:types` to regenerate TypeScript types

### If adding a new Server Action
- [x] Auth middleware runs before the action
- [x] Input validated with Zod before touching Supabase or Claude
- [x] Rate limiting applied for AI endpoints

### If changing health data handling
- [ ] All writes use Server Actions (never client-side)
- [ ] Health field columns use `_encrypted bytea` pattern
- [ ] No health data returned as raw bytea to client
EOF
)"
```

Only check the boxes that apply. Delete sections that don't apply to the PR.

---

## Merging

Prefer squash merge for feature branches to keep `main` history clean.
Each PR becomes one commit on `main` with the PR title as the commit message.

```bash
# Via GitHub UI: "Squash and merge"
# Via CLI:
gh pr merge --squash --delete-branch
```

Delete the branch after merge.

---

## Parallel work with git worktrees

When two independent features are in flight simultaneously, use worktrees to
avoid context switching between branches:

```bash
cd "C:\Projects\kairofit"
git worktree add ..\kairofit-auth feat/auth-infrastructure
git worktree add ..\kairofit-dashboard feat/dashboard

# Work in separate terminals:
# Terminal 1: cd C:\kairofit-auth && npm run dev
# Terminal 2: cd C:\kairofit-dashboard && npm run dev
```

Each worktree shares git history but has its own working tree and node_modules-independent
state. Remove when done:

```bash
git worktree remove ..\kairofit-auth
```

---

## Quick reference

```bash
# Start new work
git checkout main && git pull
git checkout -b feat/my-feature

# Check before committing
npm run typecheck && npm run lint && npm run lint:kiro && npm test

# Commit
git add src/actions/onboarding.actions.ts src/lib/db/queries/profiles.ts
git commit -m "feat: add createAccountAction with OTP magic link"

# Push and open PR
git push -u origin feat/my-feature
gh pr create --title "feat: add createAccountAction" --body "..."

# Merge and clean up
gh pr merge --squash --delete-branch
git checkout main && git pull
```
