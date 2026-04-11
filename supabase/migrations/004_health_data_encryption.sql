-- KairoFit Migration 004
-- Health data encryption: Vault-based encrypt/decrypt helpers + body measurement RPCs
--
-- Prerequisites (one-time setup in Supabase SQL editor - NOT part of this migration):
--
--   SELECT vault.create_secret('kairofit_health_key', 'health_data_key');
--   -- Copy the returned UUID and set it in Supabase environment if needed for reference.
--   -- The functions below look up the key by name, so no UUID is needed in app code.
--
-- pgcrypto is already enabled via migration 001.
-- body_measurements table and RLS already exist via migration 001.
--
-- New objects added here:
--   1. encrypt_health_value(text) -> bytea     - symmetric encrypt via Vault key
--   2. decrypt_health_value(bytea) -> text     - symmetric decrypt via Vault key
--   3. log_body_measurement(...)   -> uuid     - insert encrypted measurement row
--   4. get_body_measurements(uuid) -> SETOF    - read + decrypt rows for a user
--
-- Security model:
--   All four functions are SECURITY DEFINER so they run as the postgres role
--   (which has access to vault.secrets). The Vault key never reaches application code.
--   RLS on body_measurements enforces row-level ownership on top of function auth checks.

-- ============================================================
-- ENCRYPT / DECRYPT HELPERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.encrypt_health_value(value text)
RETURNS bytea AS $$
DECLARE
  key_value text;
BEGIN
  IF value IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT secret INTO key_value FROM vault.secrets WHERE name = 'health_data_key' LIMIT 1;

  IF key_value IS NULL THEN
    RAISE EXCEPTION 'health_data_key not found in Vault - run setup SQL first';
  END IF;

  RETURN pgp_sym_encrypt(value, key_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrypt_health_value(encrypted_value bytea)
RETURNS text AS $$
DECLARE
  key_value text;
BEGIN
  IF encrypted_value IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT secret INTO key_value FROM vault.secrets WHERE name = 'health_data_key' LIMIT 1;

  IF key_value IS NULL THEN
    RAISE EXCEPTION 'health_data_key not found in Vault - run setup SQL first';
  END IF;

  RETURN pgp_sym_decrypt(encrypted_value, key_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- LOG BODY MEASUREMENT
-- Called by logMeasurementAction. Encrypts each value before INSERT.
-- Returns the new row's UUID so the client can reference it.
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_body_measurement(
  p_user_id       uuid,
  p_weight_kg     text DEFAULT NULL,
  p_body_fat_pct  text DEFAULT NULL,
  p_chest_cm      text DEFAULT NULL,
  p_waist_cm      text DEFAULT NULL,
  p_hips_cm       text DEFAULT NULL,
  p_notes         text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Defense in depth: verify the caller owns this user_id (RLS already enforces this,
  -- but an explicit check inside a SECURITY DEFINER function is belt-and-suspenders).
  IF p_user_id IS DISTINCT FROM (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO public.body_measurements (
    user_id,
    weight_kg_encrypted,
    body_fat_pct_encrypted,
    chest_cm_encrypted,
    waist_cm_encrypted,
    hips_cm_encrypted,
    notes
  ) VALUES (
    p_user_id,
    public.encrypt_health_value(p_weight_kg),
    public.encrypt_health_value(p_body_fat_pct),
    public.encrypt_health_value(p_chest_cm),
    public.encrypt_health_value(p_waist_cm),
    public.encrypt_health_value(p_hips_cm),
    p_notes
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- GET BODY MEASUREMENTS
-- Called by MeasurementHistory (Server Component).
-- Decrypts on the way out so the application layer never touches bytea.
-- Returns rows newest-first, limited to the last 90 entries.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_body_measurements(p_user_id uuid)
RETURNS TABLE(
  id            uuid,
  measured_at   timestamptz,
  weight_kg     numeric,
  body_fat_pct  numeric,
  chest_cm      numeric,
  waist_cm      numeric,
  hips_cm       numeric,
  notes         text
) AS $$
BEGIN
  -- Defense in depth: caller must own the requested user_id
  IF p_user_id IS DISTINCT FROM (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.measured_at,
    decrypt_health_value(m.weight_kg_encrypted)::numeric,
    decrypt_health_value(m.body_fat_pct_encrypted)::numeric,
    decrypt_health_value(m.chest_cm_encrypted)::numeric,
    decrypt_health_value(m.waist_cm_encrypted)::numeric,
    decrypt_health_value(m.hips_cm_encrypted)::numeric,
    m.notes
  FROM public.body_measurements m
  WHERE m.user_id = p_user_id
  ORDER BY m.measured_at DESC
  LIMIT 90;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
