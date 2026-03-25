-- KairoFit Migration 002
-- Adds: fallback_programs table, pgvector extension (deferred), separate RLS policies
--
-- RAG Status: pgvector extension enabled here but exercises.embedding column
-- is NOT added yet. RAG is deferred to post-MVP. When ready:
--   1. ALTER TABLE exercises ADD COLUMN embedding vector(1536);
--   2. Create the retrieval function
--   3. Build src/lib/ai/rag.ts
-- See CLAUDE.md "RAG Decision" section for the full implementation plan.

-- Enable pgvector now so it exists when needed (no cost until columns are added)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- FALLBACK PROGRAMS
-- Pre-computed programs for the AI resilience degradation chain.
-- When Claude API is unavailable, fall back to these rather than showing an error.
-- Seeded via scripts/generate-fallback-programs.ts using the Batch API.
-- See skills/ai-resilience/SKILL.md for the full degradation hierarchy.
-- ============================================================

CREATE TABLE public.fallback_programs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,

  -- Lookup dimensions
  goal text NOT NULL CHECK (goal IN ('muscle', 'fat_loss', 'strength', 'fitness', 'recomposition')),
  experience_level int NOT NULL CHECK (experience_level BETWEEN 1 AND 5),
  days_per_week int NOT NULL CHECK (days_per_week BETWEEN 2 AND 6),
  -- Equipment bucket: full_gym | dumbbells_only | home | bodyweight
  equipment_type text NOT NULL CHECK (equipment_type IN ('full_gym', 'dumbbells_only', 'home', 'bodyweight')),

  -- The pre-validated program JSON
  program_json jsonb NOT NULL,

  -- Quality tracking
  was_validated boolean DEFAULT false,
  validation_errors jsonb,
  generation_model text
);

-- Fast lookup index for the degradation fallback query
CREATE INDEX idx_fallback_programs_lookup
  ON public.fallback_programs(goal, experience_level, days_per_week, equipment_type);

-- RLS: read by all authenticated users, write by service role only
ALTER TABLE public.fallback_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fallback_programs_read_authenticated" ON public.fallback_programs
  FOR SELECT USING (auth.role() = 'authenticated');
-- No INSERT/UPDATE/DELETE policy for authenticated users - service role only

-- ============================================================
-- SEPARATE RLS POLICIES (replaces FOR ALL where possible)
-- The PDF research specified: never use FOR ALL, always separate by operation.
-- FOR ALL with USING + WITH CHECK is functionally equivalent for simple user_id tables,
-- but separate policies are more explicit and safer for future policy changes.
--
-- Note: The 001 migration uses FOR ALL with WITH CHECK which is safe.
-- This migration adds a comment documenting the decision and shows the
-- separate-policy pattern for any new tables going forward.
--
-- When building new tables, use this pattern instead of FOR ALL:
--
-- CREATE POLICY "table_select" ON public.new_table
--   FOR SELECT USING ((SELECT auth.uid()) = user_id);
-- CREATE POLICY "table_insert" ON public.new_table
--   FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
-- CREATE POLICY "table_update" ON public.new_table
--   FOR UPDATE USING ((SELECT auth.uid()) = user_id)
--   WITH CHECK ((SELECT auth.uid()) = user_id);
-- CREATE POLICY "table_delete" ON public.new_table
--   FOR DELETE USING ((SELECT auth.uid()) = user_id);
--
-- See skills/rls-migration-checklist/SKILL.md for the full pattern guide.
-- ============================================================

-- ============================================================
-- VECTOR EMBEDDING COLUMN (DEFERRED)
-- Uncomment when RAG implementation begins.
-- See CLAUDE.md "RAG Decision" section for the trigger conditions.
-- ============================================================

-- ALTER TABLE public.exercises
--   ADD COLUMN embedding vector(1536);
--
-- CREATE INDEX idx_exercises_embedding ON public.exercises
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
--
-- CREATE OR REPLACE FUNCTION match_exercises(
--   query_embedding vector(1536),
--   match_threshold float DEFAULT 0.7,
--   match_count int DEFAULT 10
-- )
-- RETURNS TABLE (
--   id uuid,
--   name text,
--   similarity float
-- )
-- LANGUAGE SQL AS $$
--   SELECT
--     id,
--     name,
--     1 - (embedding <=> query_embedding) AS similarity
--   FROM public.exercises
--   WHERE 1 - (embedding <=> query_embedding) > match_threshold
--   ORDER BY embedding <=> query_embedding
--   LIMIT match_count;
-- $$;
