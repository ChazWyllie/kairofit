---
name: health-data-encryption
description: >
  Patterns for reading and writing column-level encrypted health data in KairoFit.
  Use this skill when: writing to or reading from any _encrypted bytea column
  (weight_kg_encrypted, body_fat_pct_encrypted, height_cm_encrypted,
  injuries_encrypted), implementing body measurement logging, displaying health
  data on the profile page, or handling any GDPR health data. Health data must
  NEVER be decrypted on the client. All decryption happens server-side in
  Server Actions or database functions. Wrong implementation exposes user health
  data and violates FTC HBNR and GDPR.
---

# Health Data Encryption

## What Is Encrypted

These columns in profiles and body_measurements use column-level encryption:

```
profiles.height_cm_encrypted          bytea
profiles.weight_kg_encrypted           bytea
profiles.body_fat_pct_encrypted        bytea
profiles.injuries_encrypted            bytea  <- medical data, most sensitive

body_measurements.weight_kg_encrypted  bytea
body_measurements.body_fat_pct_encrypted bytea
body_measurements.chest_cm_encrypted   bytea
body_measurements.waist_cm_encrypted   bytea
body_measurements.hips_cm_encrypted    bytea
```

Disk-level encryption (Supabase default) is not sufficient for health data.
Column-level encryption means even a database administrator cannot read the data
without the encryption key. This satisfies FTC HBNR and GDPR Article 9 requirements.

## Encryption Key Management (Supabase Vault)

Keys are stored in Supabase Vault, not in environment variables or code.

One-time setup (run once in Supabase SQL editor):
```sql
-- Create the health data encryption key in Vault
SELECT vault.create_secret(
  'health_data_key',
  'kairofit_health_key'
);

-- Get the key UUID for use in encrypt/decrypt calls
SELECT id FROM vault.secrets WHERE name = 'health_data_key';
-- Store this UUID as HEALTH_DATA_KEY_ID in Supabase environment
```

## Encryption Pattern (application layer via Supabase function)

Encryption happens in a Postgres function, not in application code.
This keeps the encryption key in the database, never in the application server.

```sql
-- Create a Postgres function for encrypting health values
-- This runs inside Supabase with access to Vault
CREATE OR REPLACE FUNCTION encrypt_health_value(value text)
RETURNS bytea AS $$
DECLARE
  key_value text;
BEGIN
  -- Get key from Vault
  SELECT secret INTO key_value FROM vault.secrets WHERE name = 'health_data_key';
  -- Encrypt with pgcrypto symmetric encryption
  RETURN pgp_sym_encrypt(value, key_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a Postgres function for decrypting
CREATE OR REPLACE FUNCTION decrypt_health_value(encrypted_value bytea)
RETURNS text AS $$
DECLARE
  key_value text;
BEGIN
  SELECT secret INTO key_value FROM vault.secrets WHERE name = 'health_data_key';
  RETURN pgp_sym_decrypt(encrypted_value, key_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Writing Encrypted Data (Server Action)

```typescript
// In a Server Action - never in a component or Route Handler
// src/actions/profile.actions.ts

export const updateBodyCompositionAction = action
  .schema(onboardingBodyCompositionSchema)
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    // Call the Postgres function to encrypt the values server-side
    // The encryption key never leaves the database
    const { error } = await supabase.rpc('update_profile_health_data', {
      p_user_id: user.id,
      p_height_cm: parsedInput.height_cm.toString(),
      p_weight_kg: parsedInput.weight_kg.toString(),
      p_body_fat_pct: parsedInput.body_fat_pct?.toString() ?? null,
    })

    if (error) throw new Error(`Failed to update health data: ${error.message}`)
  })
```

Supporting Postgres function:
```sql
CREATE OR REPLACE FUNCTION update_profile_health_data(
  p_user_id uuid,
  p_height_cm text,
  p_weight_kg text,
  p_body_fat_pct text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET
    height_cm_encrypted = encrypt_health_value(p_height_cm),
    weight_kg_encrypted = encrypt_health_value(p_weight_kg),
    body_fat_pct_encrypted = CASE
      WHEN p_body_fat_pct IS NOT NULL THEN encrypt_health_value(p_body_fat_pct)
      ELSE NULL  -- null stays null, not an encrypted empty string
    END
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Reading Encrypted Data (Server Action only)

```typescript
// NEVER read encrypted data in a Client Component or Route Handler
// Only in Server Actions or Server Components

// Use a Postgres view with SECURITY DEFINER that decrypts for the row owner
// Alternatively, use a Supabase RPC function
const { data } = await supabase.rpc('get_profile_health_data', {
  p_user_id: user.id
})

// data returns: { height_cm: number, weight_kg: number, body_fat_pct: number | null }
// Never returns the raw bytea - always decrypted numbers
```

Supporting function:
```sql
CREATE OR REPLACE FUNCTION get_profile_health_data(p_user_id uuid)
RETURNS TABLE(height_cm numeric, weight_kg numeric, body_fat_pct numeric) AS $$
BEGIN
  -- Check that the requesting user owns this data (defense in depth beyond RLS)
  IF p_user_id != (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    decrypt_health_value(height_cm_encrypted)::numeric,
    decrypt_health_value(weight_kg_encrypted)::numeric,
    CASE
      WHEN body_fat_pct_encrypted IS NOT NULL
        THEN decrypt_health_value(body_fat_pct_encrypted)::numeric
      ELSE NULL
    END
  FROM public.profiles
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Handling NULL Values

```
user skips body fat % during onboarding -> store NULL (not encrypted empty string)
user explicitly sets body fat to 0 -> store encrypt_health_value('0')
user deletes body fat data -> UPDATE to NULL
```

Never encrypt NULL. `pgp_sym_encrypt(NULL, key)` returns NULL in most pgcrypto versions,
but treat NULL as NULL explicitly to avoid ambiguity.

## Key Rotation

When rotating the encryption key:
1. Add a new key to Vault with a new name
2. Write a migration that decrypts all values with the old key and re-encrypts with the new key
3. This migration must run in a transaction or be idempotent
4. After migration completes, retire the old key

Key rotation is a data migration, not a schema migration. Plan accordingly.

## What NOT to Do

- Do not store the key in environment variables
- Do not decrypt in a Client Component
- Do not log decrypted values
- Do not return bytea columns to the client (they appear as base64 blobs)
- Do not use NULL to mean "user cleared their data" if you also use NULL for "user never entered data"
  (use a separate boolean `cleared_at` timestamp or a sentinel value)
