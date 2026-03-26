---
name: supabase-query-patterns
description: >
  KairoFit Supabase query conventions. Use when writing any database query,
  adding a new query function, reading data in Server Components or Server
  Actions, or debugging type errors from Supabase results.
  Covers: never select('*'), query file location, nested join syntax,
  PGRST116 handling, createServerClient vs createBrowserClient, type casting.
---

# Supabase Query Patterns

## Client selection: server vs browser

```typescript
// Server Components and Server Actions: always async
import { createServerClient } from '@/lib/db/supabase'
const supabase = await createServerClient()

// Client Components only: sync
import { createBrowserClient } from '@/lib/db/supabase'
const supabase = createBrowserClient()
```

**Rules:**
- `createServerClient()` is `async` - it awaits `cookies()`. Always `await` it.
- Never use `createServerClient()` in a Client Component (`'use client'`).
- Never use `createBrowserClient()` in a Server Component or Server Action.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` anywhere outside Edge Functions.

---

## All queries live in `src/lib/db/queries/`

No raw SQL or Supabase calls belong in components, actions, or hooks.
Every query is a typed function in `src/lib/db/queries/`.

```
src/lib/db/queries/
  programs.ts     # getActiveProgram, saveProgramToDb
  profiles.ts     # getProfileForGeneration, updateProfile
  exercises.ts    # getExerciseById, searchExercises
  sessions.ts     # getSessionHistory, saveSession
```

Server Actions call these functions. Server Components call these functions.
Client Components use TanStack Query hooks that call fetch routes, which call these functions.

---

## Never use select('*')

Always name every column you need. This is enforced in code review and CI lint.

```typescript
// WRONG - never do this
.select('*')

// CORRECT - name every column
.select(`
  id, user_id, created_at, name, description, ai_rationale,
  weeks_duration, days_per_week, goal, split_type, current_week,
  is_active
`)
```

Reasons:
- `select('*')` bypasses TypeScript type inference from the generated types.
- It pulls encrypted columns you don't need, wasting bandwidth.
- It makes it impossible to track what data each feature actually uses.

---

## Nested join syntax

Use `!inner` for required joins. Without `!inner`, rows with no matching child rows
are returned with `null` instead of being filtered out.

```typescript
const { data, error } = await supabase
  .from('programs')
  .select(`
    id, user_id, name, is_active,
    program_days!inner (
      id, program_id, day_number, week_number, name,
      program_exercises (
        id, program_day_id, exercise_id, order_index,
        sets, reps_min, reps_max, rest_seconds,
        exercises (
          id, name, slug, primary_muscles, equipment_required
        )
      )
    )
  `)
  .eq('user_id', userId)
  .eq('is_active', true)
  .single()
```

**When to use `!inner`:** any join where a missing child row means the parent row is useless.
Programs without days should not appear - use `!inner`.

**When to omit `!inner`:** optional relationships where the parent row is still valid
without children. Example: a profile row is valid even if `injuries` is empty.

---

## PGRST116: "no rows returned"

PostgREST returns error code `PGRST116` when `.single()` finds no rows.
This is NOT an application error - it means the resource doesn't exist yet.

```typescript
const { data, error } = await supabase
  .from('programs')
  .select('id, name, is_active')
  .eq('user_id', userId)
  .eq('is_active', true)
  .single()

if (error && error.code !== 'PGRST116') {
  // Real database error - log it
  console.error('getActiveProgram error:', error.message)
}

// data is null when PGRST116 - that is the expected "not found" signal
return data
```

Never throw on PGRST116. Return `null` and let the caller handle the empty state.

---

## Type casting for nested results

Supabase's TypeScript types cannot fully represent deeply nested joins at the type level.
The generated types from `supabase.generated.ts` cover single-table queries well, but
multi-level joins require a cast.

```typescript
import type { Program } from '@/types'

// The cast pattern for nested results
return data as unknown as Program | null
```

The double cast (`as unknown as T`) is intentional. Direct `as T` fails when the
TypeScript types are structurally incompatible. `as unknown` first drops the type
assertion, then `as T` re-asserts with the correct application type.

This is acceptable here because:
1. The columns selected exactly match the `Program` type definition.
2. RLS guarantees the rows are owned by the authenticated user.
3. The query was constructed to return the expected shape.

---

## Function signature conventions

```typescript
// Always: explicit userId parameter (never infer from session inside query)
export async function getActiveProgram(userId: string): Promise<Program | null>

// Always: return the application type, not the Supabase row type
export async function getProfileForGeneration(userId: string): Promise<UserProfile>

// Always: throw for required resources (not null return)
export async function getProfileForGeneration(userId: string): Promise<UserProfile> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, goal, experience_level, archetype, equipment, ...')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('Profile not found')
  return data as unknown as UserProfile
}
```

**Return null** for optional resources (active program - user may not have one yet).
**Throw** for required resources (profile for generation - if missing, something is broken).

---

## Column filtering for performance

When a query is called in a hot path, filter nested rows server-side rather than
pulling all rows and filtering in JavaScript.

```typescript
// Only load program_days for the current week - avoids 32-row join on 8-week programs
const { data, error } = await supabase
  .from('programs')
  .select(`
    id, name, current_week,
    program_days!inner (
      id, day_number, week_number, name
    )
  `)
  .eq('user_id', userId)
  .eq('is_active', true)
  .eq('program_days.week_number', currentWeek ?? 1)  // filter applied at DB level
  .single()
```

---

## Error handling pattern

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('id, name')
  .eq('user_id', userId)

if (error) {
  // Always log the raw message for debugging
  console.error('queryFunctionName error:', error.message)
  // Throw for Server Actions (safe-action will catch and format)
  throw new Error('Failed to load data')
}

if (!data || data.length === 0) {
  return []
}

return data
```

For `.single()` queries, distinguish PGRST116 (no rows) from real errors:

```typescript
if (error && error.code !== 'PGRST116') {
  console.error('functionName error:', error.message)
  throw new Error('Database error')
}
return data ?? null
```

---

## Write operations

Always use `UPDATE ... WHERE id = userId` for profile writes, not upsert on user-controlled data.

```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    goal,
    experience_level,
    archetype,
    onboarding_completed_at: new Date().toISOString(),
  })
  .eq('id', userId)

if (error) {
  console.error('updateProfile error:', error.message)
  throw new Error('Failed to save profile')
}
```

For inserts (new programs, sessions), always include `user_id` explicitly
even though RLS policies would enforce it - belt and suspenders.

---

## Quick reference

| Scenario | Pattern |
|----------|---------|
| Server Component read | `await createServerClient()` |
| Client Component read | `createBrowserClient()` |
| Nested join (required) | `table!inner (columns)` |
| Nested join (optional) | `table (columns)` - no `!inner` |
| Single row query | `.single()` + PGRST116 check |
| Not found result | Return `null`, never throw |
| Required resource missing | Throw |
| Nested type cast | `as unknown as MyType \| null` |
| Column selection | Always explicit - never `select('*')` |
| Query file location | `src/lib/db/queries/` only |
