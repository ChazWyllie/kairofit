---
name: kairofit-dev-assistant
description: >
  The full KairoFit product and engineering knowledge base. Use this skill for any
  KairoFit development task - it knows the full codebase structure, all product decisions,
  the competitive strategy, the tech stack, the AI architecture, and every document in the
  docs/ folder. Triggers when: starting a new KairoFit Claude Code session, asked "how does
  X work in KairoFit", asked to build a new feature, or when the user says "help me build"
  anything related to KairoFit. Always read CLAUDE.md at the project root in addition to
  this skill.
---

# KairoFit Development Assistant

Always read CLAUDE.md first. Then use this skill for task-specific guidance.

---

## Quick Context

KairoFit: AI-powered workout programming PWA competing with FitBod.
AI coach name: Kiro (direct, science-literate, no motivational fluff, no em dashes).
Stack: Next.js 15 + Supabase + Claude API + Tailwind + Vercel.
Pricing: Free at launch. $9.99/month behind NEXT_PUBLIC_PAYWALL_ENABLED=false.

Core differentiators: injury screening (screen 8), body composition (screen 9),
real periodization (not fatigue rotation), transparent AI decisions, 5 experience levels,
email gate at screen 16 (not screen 31 like FitBod), 8 archetypes, all 4 post-workout elements.

---

## Feature Status

| Feature                         | Status             | Flag                                |
| ------------------------------- | ------------------ | ----------------------------------- |
| Workout generation              | MVP                | Always on                           |
| Onboarding (22 screens)         | MVP                | Always on                           |
| Workout logging (offline-first) | MVP                | Always on                           |
| Progressive overload engine     | MVP                | Always on                           |
| Muscle recovery heatmap         | MVP                | Always on                           |
| AI post-workout debrief (Kiro)  | MVP                | Always on                           |
| Rest timer with haptic          | MVP                | Always on                           |
| Progress photos + measurements  | MVP                | Always on                           |
| Social layer                    | NOT YET BUILT      | NEXT_PUBLIC_SOCIAL_ENABLED=false    |
| Paywall / Stripe billing        | Ready, off         | NEXT_PUBLIC_PAYWALL_ENABLED=false   |
| Nutrition tracking              | Post-MVP           | NEXT_PUBLIC_NUTRITION_ENABLED=false |
| Wearables                       | Post-MVP           | NEXT_PUBLIC_WEARABLES_ENABLED=false |
| Kiro persona toggle             | Per-user DB column | profiles.kiro_persona_enabled       |

DO NOT set any flag to true until the feature is built. Enabling a non-existent feature causes immediate runtime errors.

---

## Critical Architecture Decisions

### Archetypes

8 archetypes total (System Builder, Milestone Chaser, Explorer, Pragmatist, Comeback Kid, Optimizer, Challenger, Understander).
Logic lives in: src/lib/onboarding/archetypes.ts
Do NOT look for it in kiro-voice.ts.
KairoArchetype type in src/types/index.ts includes all 8.

### Email Gate

Email gate is at screen 16. Not screen 17. Screen 16.
After email submission: auth creation runs in background during screens 17-21.
Screen 22 MUST await auth_ready=true before generating the program.
This prevents the post-signup race condition.

### Kiro Persona

Per-user column: profiles.kiro_persona_enabled (boolean, DEFAULT true).
NOT an environment variable. Do not create NEXT_PUBLIC_KIRO_PERSONA_ENABLED.

### Volume Caps

Level-specific. NOT a universal 25.
Beginners cap at 16 sets/week. Advanced caps at 25. See PROGRAMMING_RULES.md.

### Compound Rest

Minimum 120 seconds. Not 90. 120.
Any code or doc saying 90s for compounds is incorrect.

### Feature Flag Defaults

Social: false (tables don't exist yet)
Wearables: false (not built)
Nutrition: false (post-MVP)
Paywall: false (launch is free)

---

## File Map for Common Tasks

| Task                   | Read first                        | Edit                                                          |
| ---------------------- | --------------------------------- | ------------------------------------------------------------- |
| Any Server Action      | skills/server-action-builder/     | src/actions/\*.actions.ts                                     |
| Onboarding screens     | docs/onboarding/FLOW.md           | src/lib/onboarding/flow-config.ts, src/components/onboarding/ |
| AI generation          | docs/science/PROGRAMMING_RULES.md | src/lib/ai/workout-generator.ts                               |
| AI validation          | docs/science/PROGRAMMING_RULES.md | src/lib/ai/workout-validator.ts                               |
| Injury logic           | docs/science/CONTRAINDICATIONS.md | src/lib/utils/contraindications.ts                            |
| Offline logging        | skills/offline-sync-pattern/      | src/lib/offline/                                              |
| New DB migration       | skills/rls-migration-checklist/   | supabase/migrations/                                          |
| Health data read/write | skills/health-data-encryption/    | Server Actions only                                           |
| AI content review      | skills/kiro-output-auditor/       | Any user-facing strings                                       |
| Analytics events       | skills/posthog-event-taxonomy/    | Any event tracking                                            |
| Archetype logic        | -                                 | src/lib/onboarding/archetypes.ts                              |

---

## Database Quick Reference

| Table                | RLS                               | Health data             |
| -------------------- | --------------------------------- | ----------------------- |
| profiles             | Own rows + INSERT WITH CHECK      | Yes (encrypted columns) |
| exercises            | Read-all for authenticated        | No                      |
| programs             | Own rows + WITH CHECK             | No                      |
| program_days         | Via program + WITH CHECK          | No                      |
| program_exercises    | Denormalized user_id + WITH CHECK | No                      |
| workout_sessions     | Own rows + WITH CHECK             | No                      |
| workout_sets         | Denormalized user_id + WITH CHECK | No                      |
| muscle_recovery      | Own rows + WITH CHECK             | No                      |
| personal_records     | Own rows + WITH CHECK             | No                      |
| intake_conversations | Own rows + WITH CHECK             | Yes (expires 90d)       |
| body_measurements    | Own rows + WITH CHECK             | Yes (encrypted)         |
| progress_photos      | Own rows + WITH CHECK             | No                      |
| user_follows         | Own rows (social)                 | No                      |
| challenges           | Public read                       | No                      |
| push_subscriptions   | Own rows + WITH CHECK             | No                      |

Key: profiles has no DELETE policy (intentional - deletion requires controlled Server Action).

---

## Known Dependency Gotchas

framer-motion v11: Any motion.\* component MUST be 'use client'. Server Component usage throws.
date-fns v3: API changed from v2. Check v3 docs before using any function.
next-safe-action v7: API changed significantly from v6. Read skills/server-action-builder/ before writing any action.
Serwist not next-pwa: next-pwa conflicts with Turbopack. Only use @serwist/next.
Prompt caching: MUST use cache_control: { type: 'ephemeral' } on system prompt or costs increase 40%.

---

## Kiro Voice Rules (quick reference)

No em dashes anywhere (use regular dash -).
Second person: "your quads" not "quadriceps require".
Specific numbers: "3 sets of 8-12" not "moderate volume".
No: "Let's crush it!", "You've got this!", "Amazing work!", "Great job!".
Research citations are for internal grounding only. Do not propagate to user-facing output.
Run npm run lint:kiro to check for violations.

---

## Environment Variables Quick Reference

| Variable                           | Exposed to client | Secret |
| ---------------------------------- | ----------------- | ------ |
| NEXT_PUBLIC_SUPABASE_URL           | Yes               | No     |
| NEXT_PUBLIC_SUPABASE_ANON_KEY      | Yes               | No     |
| SUPABASE_SERVICE_ROLE_KEY          | No                | YES    |
| ANTHROPIC_API_KEY                  | No                | YES    |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Yes               | No     |
| STRIPE_SECRET_KEY                  | No                | YES    |
| STRIPE_WEBHOOK_SECRET              | No                | YES    |
| UPSTASH_REDIS_REST_URL             | No                | YES    |
| UPSTASH_REDIS_REST_TOKEN           | No                | YES    |
| NEXT_PUBLIC_POSTHOG_KEY            | Yes               | No     |
| NEXT_PUBLIC_PAYWALL_ENABLED        | Yes               | No     |
| NEXT_PUBLIC_SOCIAL_ENABLED         | Yes               | No     |
