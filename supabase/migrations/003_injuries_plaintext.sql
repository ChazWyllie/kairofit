-- KairoFit Migration 003
-- Temporarily replace injuries_encrypted bytea with injuries text[]
--
-- Rationale: The health-data encryption utility (skills/health-data-encryption/SKILL.md)
-- is not yet built. With the bytea column in place, the application layer has no way to
-- decrypt it, so profile.injuries returns null and workout-generator.ts falls back to
-- profile.injuries ?? [] (empty array). This means contraindication logic is silently
-- skipped and users with injuries can receive unsafe exercise assignments.
--
-- This migration restores the column to a plain text array so injuries flow correctly
-- through the AI pipeline until the encryption layer is implemented in Phase 14.
--
-- When health-data encryption is built (Phase 14 pre-launch):
--   1. Re-add height_cm_encrypted, weight_kg_encrypted, body_fat_pct_encrypted,
--      and injuries_encrypted as bytea columns
--   2. Migrate data from injuries text[] into injuries_encrypted bytea
--   3. Drop injuries text[]
--   4. Update all query functions to encrypt on write and decrypt on read
-- See: skills/health-data-encryption/SKILL.md

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS injuries_encrypted,
  ADD COLUMN injuries text[] DEFAULT '{}';

-- Note: height/weight/body_fat encrypted columns remain bytea for now.
-- They are not yet read by any production code path so they cause no harm.
-- injuries was the only encrypted column actively read by the AI pipeline.
