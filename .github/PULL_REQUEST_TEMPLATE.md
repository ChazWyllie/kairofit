## What changed and why

<!-- One paragraph: what does this PR do and why is it needed? -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Database migration
- [ ] Documentation

## Checklist

### Always

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run lint:kiro` passes (no em dashes, no banned phrases)
- [ ] `npm test` passes

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

- [ ] Auth middleware runs before the action
- [ ] Input validated with Zod before touching Supabase or Claude
- [ ] Rate limiting applied for AI endpoints

### If changing health data handling

- [ ] All writes use Server Actions (never client-side)
- [ ] Health field columns use `_encrypted bytea` pattern
- [ ] No health data returned as raw bytea to client

## Screenshots / recordings (if UI change)
