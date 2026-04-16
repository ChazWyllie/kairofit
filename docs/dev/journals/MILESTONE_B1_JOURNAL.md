# Milestone B1 Journal - adjustProgramAction

**Date:** 2026-04-11
**PR:** ChazWyllie/kairofit#50
**Branch:** feat/adjust-program-action
**Tests added:** 5 (332 total, was 327)

---

## What was built

Replaced the `adjustProgramAction` stub in `src/actions/program.actions.ts` with a full
implementation following the resilience chain:

1. Rate limit (`RATE_LIMIT_KEYS.AI_ADJUST` - `ai:adjust` key, 5 req / 5 min)
2. Safety filter (`checkInputSafety(feedback)` - blocks non-fitness prompts)
3. Circuit breaker (`CIRCUITS.ADJUSTMENT` - Redis-backed, shared across serverless instances)
4. Load program from DB (`getProgramById` - RLS-scoped to userId)
5. Claude call (`adjustProgram` - Sonnet -> Haiku fallback, inside workout-generator.ts)
6. Validation (`validateWorkoutProgram(rawProgram, 3, [], [])` - catches bound violations)
7. Version-copy save (`saveProgramToDb` - deactivates old, inserts adjusted as new active)
8. PostHog analytics (`PROGRAM_ADJUSTED` via `after()` - non-blocking, fires post-response)

---

## Key patterns learned

### Circuit breaker ownership lives at the action layer

`adjustProgram()` in `workout-generator.ts` can throw. `adjustProgramAction` wraps it with
try/catch and calls `recordSuccess` on return or `recordFailure` on throw. This means:

- Whether Sonnet or Haiku ran, `recordSuccess` is correctly called once on any successful return
- The circuit breaker is NOT managed inside `workout-generator.ts` - it's the action's responsibility
- This matches how `generateProgram` works: circuit check + recordSuccess/recordFailure in the caller

### Structured Outputs guarantees shape, not bounds

`tool_choice: { type: 'tool', name: 'create_workout_program' }` forces the model to call the tool
and guarantees the JSON matches the Zod schema shape. But it does NOT enforce:

- `sets <= 10` (could return 300)
- `rest_seconds >= 120` for heavy compounds
- Any numerical range

`validateWorkoutProgram` is therefore required after EVERY AI generation path (generation AND
adjustment). For adjustment, profile data isn't available in `adjustWithModel`, so conservative
defaults `(rawProgram, 3, [], [])` catch egregious violations without false positives.

### Model union type prevents silent string errors

`adjustWithModel` accepts `model: 'claude-sonnet-4-20250514' | 'claude-haiku-4-5-20251001'`
not `model: string`. This makes the Anthropic SDK call type-safe and prevents typos from
silently passing to the API and returning 404 model errors at runtime.

### Version-copy strategy for mid-week mutations

When a user adjusts their program mid-week:

- `saveProgramToDb` marks the old program `is_active = false`
- Saves the adjusted program as the new active version
- Completed workout sessions retain their FK reference to the old program snapshot
- No history is lost; the user sees the new plan immediately

### `RATE_LIMIT_KEYS.AI_ADJUST` not `AI_GENERATE`

The stub used `AI_GENERATE`. The correct key for adjustment is `AI_ADJUST` (`ai:adjust`).
Different bucket is intentional: generation and adjustment have different cost profiles and
users may legitimately do more of one than the other.

---

## Bugs caught in code review (both correctly dismissed)

**Agent finding 1 (incorrect):** "Haiku path skips recordSuccess"
Reality: `recordSuccess(CIRCUITS.ADJUSTMENT)` is called in `adjustProgramAction` after
`adjustProgram` returns - whether Sonnet or Haiku ran inside. TypeScript compiler agrees: no
missing-return path.

**Agent finding 2 (incorrect):** "definite assignment violation - `let result` before try/catch"
Reality: `tsc --strict` passes. The catch block always throws, so TypeScript correctly infers
`result` is always assigned at the use site after the try/catch.

Lesson: code-reviewer agent findings require verification against `tsc` and test output before
acting. False positives are common when the agent doesn't have full context about the control flow.

---

## Pre-existing issue (not introduced by this PR)

`Program.days` TypeScript field vs `program_days` Supabase runtime key. When Supabase returns
a row from `programs` joined with `program_days`, the key in the JS object is `program_days`
(the table name), not `days` (the TypeScript interface field). The codebase hides this with
`as unknown as Program` casts. `program.days` may be `undefined` at runtime in adjustment context.

The `programSummary` passed to Claude was intentionally kept as top-level fields only
(`name`, `description`, `weeks_duration`, `current_week`) to avoid this mismatch.
Full exercise detail in the adjustment prompt can be added once the runtime key mismatch is resolved.

---

## CI issues encountered

1. **Prettier not auto-formatting on commit** - The hook that auto-formats on Edit/Write didn't
   apply to files committed directly. Fix: always run `npx prettier --write` on changed files
   before `git add`.

2. **Security audit failure** - `next` had a moderate-severity DoS CVE fixable without breaking
   changes. `npm audit fix` updated 3 packages. The `tar/supabase` CLI vulnerabilities remain
   but are dev-only and excluded by `--omit=dev` in CI.

3. **Implementation commits missing** - The previous session ended before the main implementation
   could be committed. Only `workout-generator.ts` changes were on the branch. Working tree had
   the implementation but it was unstaged. Recovered by staging and committing the working tree.
