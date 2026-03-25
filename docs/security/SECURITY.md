# KairoFit Security Architecture

All security decisions, compliance requirements, and implementation patterns.

FIXES FROM CODE REVIEWS:
- FOR ALL without WITH CHECK is an INSERT bypass vulnerability (all tables fixed in migration)
- CSP updated: added PostHog and Stripe domains, unsafe-eval guarded for prod-only exclusion
- Apple Sign In is NOT required for PWAs (not an App Store app). Offered for UX, not compliance.
- GDPR DPA enrollment is a pre-launch legal blocker, not just a nice-to-have.
- No client-facing DELETE policy on profiles (intentional - documented below).

---

## Regulatory Landscape

### FTC Health Breach Notification Rule (effective July 29, 2024)
KairoFit is covered by this rule as a vendor of personal health records.
The amended rule explicitly covers health apps and connected devices.

Requirements:
- Notify affected users within 60 days of discovering a breach
- Notify FTC within 60 days for breaches affecting 500+ people
- Notify state media outlets for breaches affecting 500+ in a state
- Penalties: up to $43,792 per violation per day

What counts as a breach:
- Unauthorized access to health data
- Unauthorized disclosure to third parties (including advertisers without consent)
- Sharing user data without explicit consent

What this means for KairoFit:
- Never share health or fitness data with advertising networks
- Require explicit consent before any third-party data sharing
- Keep breach detection and notification procedures documented
- injuries_encrypted, weight_kg_encrypted, body_fat_pct_encrypted are all in scope

### GDPR (applies to all EU users)
Fitness data, body composition, and injury information qualify as "data concerning health" under GDPR Article 9.

Requirements:
- Explicit opt-in consent (not pre-checked boxes)
- Data export within 30 days of request (Article 15)
- Complete account deletion within 30 days (Article 17)
- Breach notification to supervisory authority within 72 hours
- Data Protection Impact Assessment for health data processing
- Data Processing Agreements (DPAs) with all sub-processors

GDPR DPA ENROLLMENT IS A PRE-LAUNCH LEGAL BLOCKER.
All three sub-processors require active enrollment. They do not apply automatically.
- Supabase DPA: https://supabase.com/dpa
- Anthropic DPA: must be signed before using the API with EU user data
- Stripe DPA: via Stripe dashboard

Do this before onboarding any EU users. Add to the launch checklist.

### HIPAA
KairoFit is almost certainly NOT a covered entity.
Design with HIPAA-adjacent controls anyway as defense in depth.

### State Privacy Laws (US)
Washington My Health My Data Act: opt-in consent for consumer health data.
California CPRA: health-derived data is "sensitive personal information".
Design for Washington MHMDA (strictest standard) to future-proof all US compliance.

---

## Authentication

Primary method: Magic Link (passwordless email).
No password storage means no password breach risk.
Magic links expire in 1 hour.

Secondary method: OAuth.
- Google OAuth (highest adoption rate)
- Apple Sign In (recommended for good UX, NOT required for PWA compliance)
  Apple Sign In is only required for App Store distribution. KairoFit is a PWA.
  Offer it for UX reasons, not compliance reasons.

Session management:
- JWT access tokens: 1 hour expiry
- Refresh tokens: 7 days, rotating
- Sessions invalidated on password change

---

## Row Level Security (RLS)

CRITICAL: Every table has RLS enabled with both USING and WITH CHECK.
FOR ALL with only USING is an INSERT bypass vulnerability.
A malicious authenticated user can insert rows with any user_id if WITH CHECK is absent.

Correct pattern:
```sql
CREATE POLICY "table_own" ON public.table_name
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

See skills/rls-migration-checklist/SKILL.md for the full pattern guide.

Performance optimization: always use (SELECT auth.uid()) not auth.uid().
The SELECT wrapper triggers Postgres initPlan caching (evaluated once per statement, not per row).

No DELETE policy on profiles (intentional):
Account deletion MUST go through a controlled Server Action that:
1. Verifies user identity
2. Cancels Stripe subscription via API
3. Deletes Stripe customer record
4. Exports user data for compliance
5. Triggers Supabase cascade delete
Do NOT add a client-facing DELETE RLS policy on profiles.

---

## Column-Level Encryption

Health data fields use pgcrypto encryption via application layer.
Encrypted columns (bytea type, _encrypted suffix):
- profiles.height_cm_encrypted
- profiles.weight_kg_encrypted
- profiles.body_fat_pct_encrypted
- profiles.injuries_encrypted (injuries are medical data, most sensitive field)
- body_measurements.*_encrypted

Key management: Supabase Vault.
Keys never in application code or environment variables.
See skills/health-data-encryption/SKILL.md for the full implementation pattern.

---

## Content Security Policy

Add to next.config.ts. Note: unsafe-eval is dev-only.

```javascript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // unsafe-eval is dev-only - Next.js hot reloading requires it
      // In production: remove unsafe-eval and implement nonce-based approach
      process.env.NODE_ENV === 'development'
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      [
        "connect-src 'self'",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://api.anthropic.com",
        "https://app.posthog.com",    // PostHog analytics
        "https://eu.posthog.com",     // PostHog EU endpoint
        "https://js.stripe.com",      // Stripe payment elements
        "https://api.stripe.com",     // Stripe API
      ].join(' '),
      "frame-ancestors 'none'",
    ].join('; ')
  },
]
```

---

## Rate Limiting

Upstash Redis via @upstash/ratelimit in Next.js Edge Middleware.
See src/lib/utils/rate-limit.ts for implementation.

Limits by endpoint type:
- AI generation (generateProgramAction): 3 requests per 5 minutes per user
- AI debrief: 10 requests per 1 minute per user
- AI adjustment: 5 requests per 5 minutes per user
- AI intake: 30 requests per 5 minutes per user (multi-turn conversation)
- Auth endpoints: 10 requests per 5 minutes per IP
- General mutations: 60 requests per minute per user

Rate limit by user ID for authenticated requests (prevents shared-IP false positives).
Rate limit by IP for unauthenticated requests.
Return 429 with Retry-After header.

---

## Input Validation

All user input validated with Zod before reaching Supabase or Claude.
See src/lib/validation/schemas.ts for all schemas.
All Claude inputs pass through src/lib/ai/safety-filter.ts first.

Never trust client-provided data. Always re-validate in Server Actions.
Never pass user_id from the client - always use supabase.auth.getUser() server-side.

---

## Data Retention and Deletion

Retention periods:
- Active user data: retained while account is active
- Deleted account data: purged within 30 days
- AI intake conversations: 90 days (enforced by pg_cron job in supabase/functions/)
- Workout logs: available for export before deletion

GDPR data export:
Provide all user data as JSON within 30 days of request.
Include: profile, all workout sessions, all logged sets, all programs, all measurements.
Deliver via secure temporary download URL (expires in 7 days).

The expires_at column on intake_conversations is informational only.
Postgres does not auto-delete rows. Enforcement is the Edge Function at:
supabase/functions/purge-expired-conversations/index.ts

Account deletion cascade (via controlled Server Action only):
1. Cancel Stripe subscription
2. Delete Stripe customer record
3. Generate user data export (valid for 7 days)
4. Delete Supabase auth.users record (cascades to all user data via FK)
5. Confirm deletion to user via email

---

## Incident Response

Detection: Supabase dashboard alerts, Vercel alerts, Upstash rate limit hits.

Response steps:
1. Identify scope: how many users, what data, what time window
2. Contain: revoke affected tokens, disable affected features
3. Assess: FTC HBNR notification required if any health data was exposed
4. Notify users within 60 days (FTC requirement)
5. Notify FTC within 60 days if 500+ users affected
6. Document: post-mortem within 2 weeks
7. Remediate: fix root cause, add prevention controls

Contact: set up security@kairofit.com before launch.
