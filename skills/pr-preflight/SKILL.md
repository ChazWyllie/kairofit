---
name: pr-preflight
description: >
  Runs every CI check locally before pushing a branch or creating a PR.
  Use this skill any time you are about to push code or open a PR on kairofit.
  Catches the same failures that appear in "Type check, lint, and voice lint",
  "Unit tests", and "Build check" before they hit GitHub Actions.
  Triggers when: user says "push", "open PR", "create PR", "ready to merge",
  or asks to run CI checks locally.
---

# PR Preflight

Run these checks in order before every push. They mirror the four CI jobs exactly.
Stop at the first failure and fix it before continuing.

---

## Step 1: Quality (mirrors CI job: "Type check, lint, and voice lint")

Run all five quality checks. They must all pass.

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run lint:kiro
```

```bash
npm run format:check
```

```bash
npm audit --audit-level=high --omit=dev
```

**If `format:check` fails:** run `npm run format` to auto-fix, then re-stage changed files and amend/add a new commit before continuing.

**If `lint:kiro` fails:** the file contains an em dash or a banned phrase. Find and fix the flagged line. Never use `--` (em dash) - use a regular hyphen or restructure the sentence.

---

## Step 2: Unit tests (mirrors CI job: "Unit tests")

```bash
npm test
```

All tests must pass. If any fail, fix the implementation or the test before continuing.

---

## Step 3: Build check (mirrors CI job: "Build check")

The build requires placeholder env vars for keys that are not present locally.
Copy this block exactly - these are not real credentials, they are the same placeholders CI uses.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key \
NEXT_PUBLIC_PAYWALL_ENABLED=false \
NEXT_PUBLIC_SOCIAL_ENABLED=false \
NEXT_PUBLIC_NUTRITION_ENABLED=false \
NEXT_PUBLIC_WEARABLES_ENABLED=false \
NEXT_PUBLIC_POSTHOG_KEY=placeholder_posthog \
NEXT_PUBLIC_APP_URL=https://kairofit.com \
ANTHROPIC_API_KEY=placeholder_anthropic \
UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io \
UPSTASH_REDIS_REST_TOKEN=placeholder_token \
npm run build
```

---

## Step 4: E2E tests (mirrors CI job: "End-to-end tests")

E2E tests require a live staging environment and are skipped locally unless `PLAYWRIGHT_BASE_URL` is set. Skip this step unless you are specifically testing E2E flows.

---

## Reporting

After all steps complete, report:

```
PR Preflight
──────────────────────────────
typecheck     PASS
lint          PASS
lint:kiro     PASS
format:check  PASS
audit         PASS
unit tests    PASS  (N tests)
build         PASS
e2e           SKIPPED (no STAGING_URL)
──────────────────────────────
All checks passed. Safe to push.
```

If any check failed, show which step failed and what the error was. Do not push until all required checks pass.
