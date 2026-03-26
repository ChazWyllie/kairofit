-- KairoFit Database Schema v2
-- Incorporates all fixes from six code review passes
--
-- Changes from v1:
-- [SECURITY] All FOR ALL policies now include WITH CHECK clauses (INSERT bypass fix)
-- [SECURITY] injuries column uses encrypted bytea (compliance fix)
-- [BUG] Auth trigger added - creates profile + muscle recovery rows on signup
-- [BUG] personal_records unique constraint removed - PR history preserved
-- [BUG] muscle_recovery updated_at trigger added
-- [BUG] workout_sessions updated_at column + trigger added
-- [PERF] user_id denormalized onto workout_sets and program_exercises
-- [PERF] program_exercises RLS no longer requires 3-table join
-- [SCHEMA] session_duration_minutes uses range check not enum
-- [SCHEMA] day_number max changed to 6 (matches max split)
-- [SCHEMA] workout_time_preference has CHECK constraint
-- [SCHEMA] order_index has UNIQUE constraint per day
-- [SCHEMA] programs.is_active partial unique index added
-- [SCHEMA] Social tables added (social defaults to false in env)
-- [SCHEMA] Progress photos table added
-- [SCHEMA] Push notification subscriptions table added
-- [SCHEMA] kiro_persona_enabled column added to profiles (per-user, not env var)
-- [GDPR] intake_conversations expires_at enforced by pg_cron (see functions/)
-- No em dashes in any comments or content

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  display_name text,
  avatar_url text,
  preferred_units text CHECK (preferred_units IN ('metric', 'imperial')) DEFAULT 'metric',

  -- Onboarding phase 1
  goal text CHECK (goal IN ('muscle', 'fat_loss', 'strength', 'fitness', 'recomposition')),
  experience_level int CHECK (experience_level BETWEEN 1 AND 5),
  -- Months since last consistent training. Distinct from experience level.
  -- A level-3 user returning after 8 months should be treated as Comeback Kid.
  training_recency_months int CHECK (training_recency_months >= 0),
  age_range text CHECK (age_range IN ('18-23', '24-29', '30s', '40s', '50+')),
  gender text CHECK (gender IN ('male', 'female', 'nonbinary', 'prefer_not')),
  days_per_week int CHECK (days_per_week BETWEEN 2 AND 6),
  -- Range label stored, not bare integer (preserves "60+" vs "60" distinction)
  session_duration_preference text CHECK (session_duration_preference IN ('15-20', '20-30', '30-45', '45-60', '60+')),

  -- Onboarding phase 2
  work_schedule text CHECK (work_schedule IN ('9-5', 'shift', 'flexible', 'retired')),
  activity_level text CHECK (activity_level IN ('sedentary', 'active', 'mixed', 'variable')),
  obstacles text[] DEFAULT '{}',
  -- Health data - column-level encrypted (pgcrypto via application layer)
  -- Encryption pattern documented in skills/health-data-encryption/SKILL.md
  height_cm_encrypted bytea,
  weight_kg_encrypted bytea,
  body_fat_pct_encrypted bytea,
  -- injuries is also health data under FTC HBNR - encrypted
  injuries_encrypted bytea,
  why_now text,

  -- Onboarding phase 3 (psychographic)
  -- 4 scores from agree/disagree battery
  psych_scores int[] DEFAULT '{}',
  -- One of 8 archetypes - see src/lib/onboarding/archetypes.ts
  archetype text CHECK (archetype IN (
    'system_builder', 'milestone_chaser', 'explorer', 'pragmatist',
    'comeback_kid', 'optimizer', 'challenger', 'understander'
  )),

  -- Onboarding phase 5 (training setup)
  equipment text[] DEFAULT '{}',
  split_preference text,
  -- Constrained to the values shown on screen 19
  workout_time_preference text CHECK (workout_time_preference IN (
    'morning', 'midday', 'afternoon', 'evening', 'no_preference'
  )),
  other_training text[] DEFAULT '{}',
  sleep_hours_range text CHECK (sleep_hours_range IN ('<5', '5-6', '7-8', '>8')),

  -- Per-user AI coach persona toggle (NOT a global env flag)
  kiro_persona_enabled boolean DEFAULT true,

  -- Subscription
  stripe_customer_id text UNIQUE,
  subscription_status text CHECK (subscription_status IN (
    'trial', 'active', 'canceled', 'past_due', 'unpaid'
  )) DEFAULT 'trial',
  trial_ends_at timestamptz DEFAULT (now() + INTERVAL '7 days'),
  subscription_period_end timestamptz,

  -- Onboarding state
  onboarding_completed_at timestamptz,
  onboarding_step int DEFAULT 1
);

-- ============================================================
-- AUTH TRIGGER - creates profile + muscle recovery rows on signup
-- Without this trigger, every new signup gets an orphaned auth record
-- and all profile queries silently return nothing.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  muscle_groups text[] := ARRAY[
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'traps', 'lower_back'
  ];
  muscle text;
BEGIN
  -- Create the profile row
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  -- Seed muscle recovery at 100% for all groups
  -- Without this, the recovery heatmap shows nothing on first load
  FOREACH muscle IN ARRAY muscle_groups LOOP
    INSERT INTO public.muscle_recovery (user_id, muscle_group, estimated_recovery_pct)
    VALUES (NEW.id, muscle, 100);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- EXERCISE LIBRARY
-- ============================================================

CREATE TABLE public.exercises (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,

  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  alternative_names text[] DEFAULT '{}',

  primary_muscles text[] NOT NULL,
  secondary_muscles text[] DEFAULT '{}',
  movement_pattern text CHECK (movement_pattern IN (
    'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull',
    'squat', 'hinge', 'carry', 'core', 'isolation_push', 'isolation_pull', 'cardio'
  )),
  is_compound boolean DEFAULT false,
  equipment_required text[] DEFAULT '{}',
  difficulty int CHECK (difficulty BETWEEN 1 AND 5),

  -- Evidence-based defaults
  default_sets_min int DEFAULT 3,
  default_sets_max int DEFAULT 4,
  default_reps_min int DEFAULT 8,
  default_reps_max int DEFAULT 12,
  default_rest_seconds int CHECK (default_rest_seconds BETWEEN 30 AND 300) DEFAULT 90,

  description text,
  research_rationale text,
  form_cues text[],
  common_mistakes text[],
  -- References InjuryZone values
  contraindicated_for text[] DEFAULT '{}',

  video_url text,
  thumbnail_url text,

  is_verified boolean DEFAULT false,
  evidence_quality text CHECK (evidence_quality IN ('high', 'medium', 'low')) DEFAULT 'medium'
);

CREATE TABLE public.exercise_substitutes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  substitute_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  substitute_reason text,
  priority int DEFAULT 1,
  UNIQUE(exercise_id, substitute_id),
  -- Enforce unique priority per exercise so substitute selection is deterministic
  UNIQUE(exercise_id, priority)
);

-- ============================================================
-- PROGRAMS
-- ============================================================

CREATE TABLE public.programs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  name text NOT NULL,
  description text,
  ai_rationale text,

  weeks_duration int DEFAULT 8,
  days_per_week int,
  goal text,
  split_type text,
  experience_level_target int,

  current_week int DEFAULT 1 CHECK (current_week >= 1 AND current_week <= weeks_duration),
  current_mesocycle int DEFAULT 1,
  progression_scheme text CHECK (progression_scheme IN (
    'linear', 'double_progression', 'rpe_based', 'dup', 'block'
  )) DEFAULT 'double_progression',

  is_active boolean DEFAULT false,
  is_ai_generated boolean DEFAULT true,
  generation_model text,
  generation_prompt_version text,

  projected_weeks_to_goal int,
  projected_outcome_description text
);

-- Enforce at most one active program per user
-- A bug or race condition during generation cannot leave two active programs
CREATE UNIQUE INDEX one_active_program_per_user
  ON public.programs(user_id)
  WHERE is_active = true;

-- ============================================================
-- PROGRAM DAYS
-- ============================================================

CREATE TABLE public.program_days (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,

  -- Max 6: the maximum supported split (PPL x2). 7 was incorrect.
  day_number int NOT NULL CHECK (day_number BETWEEN 1 AND 6),
  week_number int DEFAULT 1,
  name text NOT NULL,
  focus_muscles text[] DEFAULT '{}',
  session_type text CHECK (session_type IN (
    'strength', 'hypertrophy', 'volume', 'full_body', 'deload'
  )),
  estimated_duration_minutes int,

  UNIQUE(program_id, day_number, week_number)
);

-- ============================================================
-- PROGRAM EXERCISES
-- ============================================================

CREATE TABLE public.program_exercises (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_day_id uuid REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) NOT NULL,
  -- Denormalized for RLS performance - avoids 3-table join on every row access
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  order_index int NOT NULL,
  -- Enforce deterministic ordering within a day
  UNIQUE(program_day_id, order_index),

  superset_group int,

  sets int NOT NULL CHECK (sets BETWEEN 1 AND 10),
  reps_min int NOT NULL CHECK (reps_min BETWEEN 1 AND 50),
  reps_max int NOT NULL CHECK (reps_max BETWEEN 1 AND 50),
  -- Heavy compounds: minimum 120 seconds. Isolations: 60-90 seconds.
  rest_seconds int NOT NULL CHECK (rest_seconds BETWEEN 30 AND 300),
  rpe_target int CHECK (rpe_target BETWEEN 1 AND 10),
  rir_target int CHECK (rir_target BETWEEN 0 AND 5),

  rationale text,
  progression_scheme text CHECK (progression_scheme IN (
    'linear', 'double_progression', 'rpe_based', 'maintain'
  )) DEFAULT 'double_progression',

  modification_note text,
  is_flagged_for_injury boolean DEFAULT false
);

-- ============================================================
-- WORKOUT SESSIONS
-- ============================================================

CREATE TABLE public.workout_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- updated_at needed for AI debrief delivery retry logic
  updated_at timestamptz DEFAULT now() NOT NULL,

  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  program_day_id uuid REFERENCES public.program_days(id),
  program_id uuid REFERENCES public.programs(id),

  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds int,

  perceived_effort int CHECK (perceived_effort BETWEEN 1 AND 10),
  energy_level int CHECK (energy_level BETWEEN 1 AND 5),
  user_notes text,

  ai_debrief text,
  next_session_adjustments jsonb,

  status text CHECK (status IN ('in_progress', 'completed', 'skipped')) DEFAULT 'in_progress'
);

-- ============================================================
-- WORKOUT SETS
-- ============================================================

CREATE TABLE public.workout_sets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id uuid REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) NOT NULL,
  program_exercise_id uuid REFERENCES public.program_exercises(id),
  -- Denormalized for RLS performance - avoids session subquery on every row
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  set_number int NOT NULL CHECK (set_number BETWEEN 1 AND 20),
  reps_completed int NOT NULL CHECK (reps_completed BETWEEN 1 AND 100),  -- 0 corrupts progressive overload calculations
  weight_kg numeric(6,2),
  rpe int CHECK (rpe BETWEEN 1 AND 10),
  is_warmup boolean DEFAULT false,
  is_dropset boolean DEFAULT false,

  logged_at timestamptz DEFAULT now()
);

-- ============================================================
-- MUSCLE RECOVERY
-- ============================================================

CREATE TABLE public.muscle_recovery (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  muscle_group text NOT NULL,
  last_trained_at timestamptz,
  estimated_recovery_pct int DEFAULT 100 CHECK (estimated_recovery_pct BETWEEN 0 AND 100),
  sets_this_week int DEFAULT 0,
  -- Trigger ensures this stays current (added below)
  updated_at timestamptz DEFAULT now() NOT NULL,

  UNIQUE(user_id, muscle_group)
);

-- ============================================================
-- PERSONAL RECORDS
-- ============================================================

-- No UNIQUE(user_id, exercise_id, record_type) constraint here.
-- That constraint would overwrite PR history on every new PR.
-- The progressive overload engine needs historical baselines.
-- Query current record with: WHERE user_id = X AND exercise_id = Y
--   AND record_type = Z ORDER BY achieved_at DESC LIMIT 1

CREATE TABLE public.personal_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) NOT NULL,
  set_id uuid REFERENCES public.workout_sets(id),

  record_type text CHECK (record_type IN (
    '1rm_estimated', '3rm', '5rm', 'max_reps', 'max_volume'
  )) NOT NULL,
  value numeric(8,2) NOT NULL,
  achieved_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- AI INTAKE CONVERSATIONS
-- ============================================================

CREATE TABLE public.intake_conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,

  messages jsonb NOT NULL DEFAULT '[]',
  is_complete boolean DEFAULT false,
  extracted_profile jsonb,

  -- GDPR: auto-delete after 90 days via pg_cron job in supabase/functions/
  -- The expires_at column is only informational without the cron job.
  -- See supabase/functions/purge-expired-conversations/index.ts
  expires_at timestamptz DEFAULT (now() + INTERVAL '90 days')
);

-- ============================================================
-- BODY MEASUREMENTS
-- ============================================================

CREATE TABLE public.body_measurements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  measured_at timestamptz DEFAULT now() NOT NULL,

  weight_kg_encrypted bytea,
  body_fat_pct_encrypted bytea,
  chest_cm_encrypted bytea,
  waist_cm_encrypted bytea,
  hips_cm_encrypted bytea,

  notes text
);

-- ============================================================
-- PROGRESS PHOTOS
-- ============================================================

CREATE TABLE public.progress_photos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,

  storage_path text NOT NULL,
  photo_type text CHECK (photo_type IN ('front', 'back', 'side_left', 'side_right', 'custom')),
  body_weight_kg_encrypted bytea,
  notes text,
  is_private boolean DEFAULT true
);

-- ============================================================
-- SOCIAL - FOLLOWS
-- (Only active when NEXT_PUBLIC_SOCIAL_ENABLED=true)
-- ============================================================

CREATE TABLE public.user_follows (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,

  UNIQUE(follower_id, following_id),
  -- Cannot follow yourself
  CHECK (follower_id != following_id)
);

-- ============================================================
-- SOCIAL - CHALLENGES
-- ============================================================

CREATE TABLE public.challenges (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  name text NOT NULL,
  description text,
  challenge_type text CHECK (challenge_type IN (
    'most_volume', 'most_consistent', 'strength_gain', 'streak'
  )),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_public boolean DEFAULT true
);

CREATE TABLE public.challenge_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  current_score numeric(10,2) DEFAULT 0,

  UNIQUE(challenge_id, user_id)
);

-- ============================================================
-- PUSH NOTIFICATION SUBSCRIPTIONS (PWA)
-- ============================================================

CREATE TABLE public.push_subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,

  -- Web Push API subscription object stored as JSONB
  endpoint text NOT NULL,
  subscription_json jsonb NOT NULL,
  -- User agent info for debugging delivery failures
  user_agent text,
  is_active boolean DEFAULT true,

  UNIQUE(user_id, endpoint)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_substitutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- PROFILES: separated policies for each operation
-- INSERT has WITH CHECK. profiles has no DELETE policy (intentional).
-- Account deletion must go through a Server Action that handles Stripe cleanup
-- and cascade verification. Do NOT add a client-facing DELETE RLS policy here.
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- EXERCISES: read by all authenticated users, written by service role only
CREATE POLICY "exercises_read_authenticated" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "exercise_substitutes_read_authenticated" ON public.exercise_substitutes
  FOR SELECT USING (auth.role() = 'authenticated');

-- PROGRAMS: own rows only, with INSERT protection
CREATE POLICY "programs_own" ON public.programs
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- PROGRAM DAYS: owned via program
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

-- PROGRAM EXERCISES: uses denormalized user_id for performance
-- No longer requires 3-table join
CREATE POLICY "program_exercises_own" ON public.program_exercises
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- WORKOUT SESSIONS: own rows only
CREATE POLICY "sessions_own" ON public.workout_sessions
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- WORKOUT SETS: uses denormalized user_id for performance
-- At scale, the old subquery (via workout_sessions) degraded significantly
CREATE POLICY "sets_own" ON public.workout_sets
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- All remaining tables: simple user_id equality with WITH CHECK
CREATE POLICY "muscle_recovery_own" ON public.muscle_recovery
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "personal_records_own" ON public.personal_records
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "intake_conversations_own" ON public.intake_conversations
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "body_measurements_own" ON public.body_measurements
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "progress_photos_own" ON public.progress_photos
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "follows_select_own" ON public.user_follows
  FOR SELECT USING (
    (SELECT auth.uid()) = follower_id
    OR (SELECT auth.uid()) = following_id
  );
CREATE POLICY "follows_insert_own" ON public.user_follows
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = follower_id);
CREATE POLICY "follows_delete_own" ON public.user_follows
  FOR DELETE USING ((SELECT auth.uid()) = follower_id);

CREATE POLICY "challenges_read_public" ON public.challenges
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "challenge_participants_own" ON public.challenge_participants
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "push_subscriptions_own" ON public.push_subscriptions
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================
-- INDEXES
-- ============================================================

-- RLS policy columns - essential for query performance
CREATE INDEX idx_programs_user_id ON public.programs(user_id);
CREATE INDEX idx_program_exercises_user_id ON public.program_exercises(user_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sets_user_id ON public.workout_sets(user_id);
CREATE INDEX idx_muscle_recovery_user_id ON public.muscle_recovery(user_id);
CREATE INDEX idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX idx_progress_photos_user_id ON public.progress_photos(user_id);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Hot path query optimization
-- body_measurements time-series: "show my weight trend" sorts by measured_at DESC
CREATE INDEX idx_body_measurements_user_measured
  ON public.body_measurements(user_id, measured_at DESC);
CREATE INDEX idx_exercises_slug ON public.exercises(slug);
CREATE INDEX idx_exercises_movement_pattern ON public.exercises(movement_pattern);
CREATE INDEX idx_workout_sessions_user_created ON public.workout_sessions(user_id, created_at DESC);
CREATE INDEX idx_workout_sets_session ON public.workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise ON public.workout_sets(exercise_id);
CREATE INDEX idx_personal_records_lookup ON public.personal_records(user_id, exercise_id, record_type, achieved_at DESC);
CREATE INDEX idx_program_days_program ON public.program_days(program_id);
CREATE INDEX idx_program_exercises_day ON public.program_exercises(program_day_id);
CREATE INDEX idx_profiles_stripe ON public.profiles(stripe_customer_id);
-- Social indexes
CREATE INDEX idx_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_follows_following ON public.user_follows(following_id);
-- Expiry index for GDPR cleanup job
CREATE INDEX idx_intake_conversations_expires ON public.intake_conversations(expires_at);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Every table with updated_at gets this trigger
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- workout_sessions updated_at: needed for AI debrief delivery retry logic
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- muscle_recovery updated_at: needed for recovery heatmap accuracy
CREATE TRIGGER muscle_recovery_updated_at BEFORE UPDATE ON public.muscle_recovery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
