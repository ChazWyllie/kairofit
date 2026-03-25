---
name: rls-migration-checklist
description: >
  Pre-migration checklist and correct RLS patterns for KairoFit. Use this skill before
  writing ANY new Supabase migration file. The FOR ALL without WITH CHECK pattern is an
  INSERT authorization bypass vulnerability that affected 9 tables in the first migration.
  This skill prevents that class of bug from recurring. Triggers when: creating a new
  migration file, adding a new table, adding RLS policies, modifying existing policies,
  or any time you run npm run db:migrate. Read every section before writing any SQL.
---

# RLS Migration Checklist

## The Critical Bug This Skill Prevents

`FOR ALL USING (condition)` does NOT protect INSERT operations.
`USING` applies to SELECT, UPDATE, and DELETE - it checks existing rows.
On INSERT there is no existing row to check, so USING is simply not evaluated.

A malicious authenticated user can insert a workout_session row with any user_id.

**The fix:** Every policy that allows writes MUST include WITH CHECK.

```sql
-- WRONG: INSERT is unprotected
CREATE POLICY "sessions_own" ON public.workout_sessions
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- CORRECT: Both reads and writes are protected
CREATE POLICY "sessions_own" ON public.workout_sessions
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

---

## The Four Access Patterns in KairoFit

### Pattern 1: User owns their own rows (most tables)

```sql
CREATE POLICY "table_own" ON public.table_name
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

### Pattern 2: Public read (exercise library)

```sql
-- Read: all authenticated users
CREATE POLICY "exercises_read" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');
-- Write: service role only (no client-facing write policy)
```

### Pattern 3: Join-traversal (program_days owns via program)

```sql
-- The WITH CHECK must mirror the USING subquery exactly
CREATE POLICY "program_days_own" ON public.program_days
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND p.user_id = (SELECT auth.uid())
    )
  );
```

Note: If the table has a denormalized user_id (recommended for hot paths), use Pattern 1 instead.
This avoids the subquery cost on every row access.

### Pattern 4: Service role only (no client access)

```sql
-- Simply do not create any policy
-- RLS is enabled, but no policy = no access
-- Only the service role key (server-side only) can access this table
```

---

## Pre-Migration Checklist

Before running any migration:

```
TABLE STRUCTURE:
[ ] RLS enabled on the new table (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
[ ] Every column that accepts user input has appropriate CHECK constraints
[ ] Enum columns use CHECK (col IN (...)) not just text
[ ] Timestamp columns use timestamptz (not timestamp - timezone matters)

RLS POLICIES:
[ ] Every table has at least one policy (RLS enabled with no policies = no access)
[ ] All write policies (INSERT, UPDATE, DELETE, FOR ALL) have WITH CHECK
[ ] WITH CHECK mirrors USING exactly for user ownership tables
[ ] Join-traversal policies have WITH CHECK that traverses the same join
[ ] No accidental SELECT * on sensitive tables

PERFORMANCE:
[ ] Index exists on user_id column for every RLS policy using user_id
[ ] Index exists on every FK column
[ ] Index exists on every column used in a WHERE clause in expected queries
[ ] (SELECT auth.uid()) used instead of auth.uid() in all RLS policies

TRIGGERS:
[ ] updated_at trigger added if the table has an updated_at column
[ ] Function public.update_updated_at() exists (it is created in 001_initial_schema.sql)
[ ] No new trigger function needed - use the existing one

CONSTRAINTS:
[ ] order_index columns have UNIQUE(parent_id, order_index) if ordering matters
[ ] Priority columns have UNIQUE(parent_id, priority) if uniqueness matters
[ ] is_active boolean columns have a partial unique index if only one can be active per user
```

---

## The (select auth.uid()) Pattern

Always use `(SELECT auth.uid())` not `auth.uid()` in RLS policies.

The version with SELECT triggers an `initPlan` in Postgres that caches the result
for the duration of the statement. Without SELECT, the function is called for every row.

This makes a significant difference on tables with many rows per user.

```sql
-- Slow: auth.uid() called for every row
USING (auth.uid() = user_id)

-- Fast: auth.uid() called once per statement
USING ((SELECT auth.uid()) = user_id)
```

---

## New Table Template

Copy this template for every new user-owned table:

```sql
CREATE TABLE public.new_table (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- your columns here
);

-- RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "new_table_own" ON public.new_table
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX idx_new_table_user_id ON public.new_table(user_id);
-- Add more indexes for expected query patterns

-- Trigger
CREATE TRIGGER new_table_updated_at BEFORE UPDATE ON public.new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
