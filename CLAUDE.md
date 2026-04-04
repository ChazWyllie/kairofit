# KairoFit - Claude Code Intelligence File

Read this ENTIRE file before writing, editing, or reviewing ANY code.
Every decision here is final unless explicitly overridden in conversation.
No em dashes anywhere in this file or in any generated code or content.

---

## Project Identity

**Name:** KairoFit
**AI Coach Name:** Kiro (named, direct, science-literate, no motivational fluff)
**Tagline:** Research-backed AI workout programming. Now you know why.
**Primary competitor:** FitBod - full teardown at docs/competitive/
**Market position:** Free at launch. $9.99/month behind a feature flag.

---

## Commands

```bash
npm run dev           # Start dev server (localhost:3000, Turbopack)
npm run build         # Production build
npm run typecheck     # TypeScript check - run before every commit
npm run lint          # ESLint
npm run lint:kiro     # Kiro voice linter (em dashes, banned phrases)
npm run format        # Prettier write - run before committing
npm run format:check  # Prettier dry-run (used in CI)
npm test              # Vitest unit tests
npm run test:coverage # Vitest with coverage report
npm run test:e2e      # Playwright end-to-end tests
npm run db:push       # Push schema to Supabase
npm run db:migrate    # Create new migration file
npm run db:seed       # Seed exercise library
npm run db:reset      # Reset local DB (dev only)
npm run db:types      # Regenerate Supabase TypeScript types -> src/types/supabase.generated.ts
npm run generate:fallbacks  # Pre-generate fallback programs for AI resilience (scripts/generate-fallback-programs.ts)
```

---

## Local Setup (exact sequence - do not skip steps)

```bash
git clone https://github.com/yourusername/kairofit
cd kairofit
npm install
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, UPSTASH values

npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push       # Apply schema + triggers
npm run db:types      # Generate TypeScript types <- REQUIRED before dev
npm run db:seed       # Seed exercise library
npm run dev
```

`npm run db:types` MUST run after `db:push` and before `npm run dev`.
Missing this step causes a TypeScript missing-module error that looks like a setup failure.

---

## Security Warning: Keep This Repo Private

docs/competitive/ and docs/research/ contain:

- Specific competitor revenue figures
- Screen-by-screen competitor onboarding teardowns
- Exact pricing strategy and paywall timing decisions
- Retention targets and conversion benchmarks

If this repo goes public, ALL of this is visible.
Before open-sourcing: move docs/competitive/ and docs/research/ to a separate private repo.

---

## Final Product Decisions

### Visual Identity

**Base:** Dark premium minimalist (Whoop + Notion aesthetic)
**Accents:** Bold energetic for CTAs and key moments (Nike + Strava energy)
**Backgrounds:** Near-black (#0A0A0B), surface (#111113), elevated (#1A1A1F)
**Text:** Primary (#F5F5F4), secondary (#A1A19E), muted (#6B6B68)
**Brand accent:** Indigo (#6366F1) for primary actions
**Energy accent:** Orange (#F97316) for streaks, PRs, milestones
**Danger:** Red (#EF4444) for injury flags
**Success:** Emerald (#10B981) for completions
**Dark mode:** Always on. No light mode toggle. Ever.
**Typography:** Geist Sans for UI, monospace for numbers/metrics
**No em dashes anywhere.** Use regular dashes (-) or restructure sentences.

### AI Coach "Kiro"

Named coach with a consistent voice. Direct, precise, science-literate.
No motivational fluff. Trust comes from accuracy not enthusiasm.

Persona toggle is a per-user preference stored in `profiles.kiro_persona_enabled boolean DEFAULT true`.
It is NOT a global environment variable. Do not create NEXT_PUBLIC_KIRO_PERSONA_ENABLED.

**Kiro voice rules:**

- Second person always ("your quads" not "quadriceps require")
- Specific numbers always ("3 sets of 8-12" not "moderate volume")
- No em dashes anywhere in Kiro output
- No: "Let's crush it!", "You've got this!", "Amazing work!"
- Yes: explain the why, concisely, with numbers
- Uncertainty acknowledged honestly: "Research varies here - we default to X but watch your data"

### Pricing

**Current state:** Free - `NEXT_PUBLIC_PAYWALL_ENABLED=false`
**Future state:** $9.99/month or $79.99/year
**Stripe is integrated.** Flip the flag to monetize. Do not build a permanent free tier until retention data supports it.

### Science Transparency (3-layer system)

Layer 1 (default): One-line rationale beneath every exercise card
Layer 2 (program overview): Full rationale paragraph from Kiro
Layer 3 (expandable per exercise): Full research notes

Adaptive: experience levels 4-5 have Layer 3 open by default. Levels 1-3 see it collapsed.

### Archetypes (8 total - all implemented)

System Builder, Milestone Chaser, Explorer, Pragmatist, Comeback Kid, Optimizer, Challenger, Understander.
Code lives in: src/lib/onboarding/archetypes.ts (NOT in kiro-voice.ts).
Type definition: KairoArchetype in src/types/index.ts must include all 8.

### Onboarding

22 screens. Email gate at screen 16 (after archetype reveal at screen 15).
Full spec: docs/onboarding/FLOW.md
The email gate is at screen 16. Not screen 17. 16.

**Post-signup race condition guard:** After screen 16 captures email and starts auth creation,
screens 17-21 can complete before auth resolves. Screen 22 MUST await an explicit auth-ready
check before initiating program generation. See docs/onboarding/FLOW.md for the coordination mechanism.

### Feature Flags (defaults and status)

```
NEXT_PUBLIC_PAYWALL_ENABLED=false       # flip when monetizing
NEXT_PUBLIC_SOCIAL_ENABLED=false        # flip when social tables + UI are built
NEXT_PUBLIC_NUTRITION_ENABLED=false     # post-MVP, not scaffolded
NEXT_PUBLIC_WEARABLES_ENABLED=false     # post-MVP, not scaffolded
```

Do NOT set any of these to true until the corresponding feature is actually built.
Enabling a feature flag for a non-existent feature causes immediate broken UI.
Kiro persona is a per-user database column, not an env flag.

### Volume Limits (level-specific - not a universal 25)

| Level                  | Minimum Effective | Maximum Adaptive | Hard Cap |
| ---------------------- | ----------------- | ---------------- | -------- |
| 1 (beginner)           | 4-6 sets/week     | 10-12 sets/week  | 16 sets  |
| 2 (early intermediate) | 4-8 sets/week     | 12-14 sets/week  | 16 sets  |
| 3 (intermediate)       | 8-10 sets/week    | 14-16 sets/week  | 20 sets  |
| 4 (experienced)        | 10-14 sets/week   | 16-20 sets/week  | 24 sets  |
| 5 (advanced)           | 12-16 sets/week   | 18-22 sets/week  | 25 sets  |

The global maximum is 25 sets but only for level 5. Beginners cap at 16.
Any code or doc that states "hard cap: 25 sets" as a universal rule is wrong.

### Post-Workout Experience (all 4, in sequence)

1. Streak + milestone animation
2. Muscle recovery heatmap update
3. Kiro AI debrief (streaming inline, not a popup)
4. Shareable workout card (on demand)

### Growth Strategy

KairoFit is a PWA. It does NOT appear in iOS App Store or Google Play search.
The research doc's reference to App Store Optimization as the #1 channel is WRONG for this architecture.

**Actual acquisition channels for KairoFit:**

1. Web SEO (Google search for "AI workout app", "research-based workout program", etc.)
2. Content marketing (expert-authored articles on training science)
3. Referral program (word of mouth with trial extensions)
4. Reddit and fitness communities (r/fitness, r/weightroom - authentic, not spam)
5. YouTube fitness creator partnerships
6. App Store via Capacitor wrapper (post-revenue roadmap item, not day one)

---

## Tech Stack

| Layer           | Technology                        | Notes                                              |
| --------------- | --------------------------------- | -------------------------------------------------- |
| Framework       | Next.js 15 App Router + Turbopack |                                                    |
| Database + Auth | Supabase (PostgreSQL + RLS)       | NEVER bypass RLS                                   |
| AI              | Anthropic Claude API              | Sonnet for generation, Haiku for safety checks     |
| AI SDK          | Vercel AI SDK (@ai-sdk/anthropic) | For streaming                                      |
| Styling         | Tailwind CSS + shadcn/ui          | Dark theme always                                  |
| State           | Zustand + TanStack Query v5       |                                                    |
| Payments        | Stripe                            | Feature-flagged off                                |
| Hosting         | Vercel                            |                                                    |
| Rate limiting   | Upstash Redis                     | Protect ALL AI endpoints                           |
| Analytics       | PostHog                           | See skills/posthog-event-taxonomy/ for event names |
| Testing         | Vitest + Playwright               |                                                    |
| PWA             | Serwist (@serwist/next)           | NOT next-pwa - incompatible with Turbopack         |
| Offline storage | Dexie.js (IndexedDB)              | See skills/offline-sync-pattern/                   |

---

## Architecture: The Core Rule

**Deterministic code owns programming logic. Kiro owns language.**

`src/lib/utils/` owns: volume math, progressive overload rules, split selection, recovery windows, deload logic, volume landmarks, rep/rest validation, contraindication matching.

Kiro (Claude API) owns: intake interview, substitution reasoning, program rationale, post-workout debrief, adapting programs from free text, science explanations.

---

## Security Rules

1. NEVER expose SUPABASE_SERVICE_ROLE_KEY to client code
2. NEVER expose ANTHROPIC_API_KEY to client code
3. NEVER skip RLS - every new table gets RLS in the same migration
4. RLS policies: ALWAYS include both USING and WITH CHECK on write-capable policies
   See skills/rls-migration-checklist/ - the FOR ALL without WITH CHECK pattern is an INSERT bypass vulnerability
5. ALWAYS validate with Zod before touching Supabase or Claude API
6. ALWAYS rate limit AI endpoints - see src/lib/utils/rate-limit.ts
7. ALL Claude prompts pass through src/lib/ai/safety-filter.ts first
8. Health data fields use column-level encryption - see skills/health-data-encryption/
9. Stripe webhooks verified with signature on every event

---

## Code Quality Rules

- No `any` in TypeScript. Use `unknown` and narrow.
- No raw SQL in components or actions. Use src/lib/db/queries/ functions.
- No direct Anthropic SDK calls from components. Use src/lib/ai/ modules.
- All LLM output passes through src/lib/ai/workout-validator.ts before saving.
- No em dashes (--) anywhere. Use regular dashes.
- No console.log in production. console.error for errors only.
- Components under 200 lines. Extract sub-components.
- Every async operation needs loading and error states.
- Never use select('\*') on Supabase. Always specify columns.
- Comment every non-obvious decision. Built for Claude Code + beginners.
- Server Actions use next-safe-action v7 API - see skills/server-action-builder/
- Events use PostHog taxonomy - see skills/posthog-event-taxonomy/

---

## Known Dependency Gotchas

**framer-motion v11 + Next.js 15 App Router:**
Any component using `motion.*` MUST be a Client Component (`'use client'`).
Using motion in a Server Component throws a hard-to-diagnose error.
Use LazyMotion with the domAnimation feature bundle to reduce bundle size.

**date-fns v3:**
date-fns v3 dropped the CommonJS build and changed some function signatures.
If copying v2 examples from documentation, they will fail at runtime.
Always check the v3 changelog before using a date-fns function.

**next-safe-action v7:**
The v7 API changed significantly from v6. createSafeActionClient() setup,
middleware chaining, and error handling all changed.
See skills/server-action-builder/ for the correct v7 patterns.
Do NOT follow v6 examples from older blog posts.

**Prompt caching (cost critical):**
KIRO_BASE_SYSTEM_PROMPT is ~2000 tokens and stable.
Without prompt caching, every AI call pays full input price for it.
With caching, reads cost 0.1x base price (90% discount).
Implementation:

```typescript
{
  role: 'system',
  content: KIRO_BASE_SYSTEM_PROMPT,
  // Add to the message object passed to the Anthropic SDK:
  cache_control: { type: 'ephemeral' }
}
```

This MUST be implemented before production. Missing it increases AI costs by ~40%.

**Serwist not next-pwa:**
next-pwa conflicts with Turbopack. Only use @serwist/next.

**AI circuit breaker requires Redis (not memory):**
Vercel serverless functions are ephemeral - module-level singletons reset on every cold start.
A memory-only circuit breaker provides zero production protection: after 5 failures the circuit
"opens", then the next request arrives as a cold start with a reset counter and tries again.
The implementation at `src/lib/ai/circuit-breaker.ts` stores state in Upstash Redis.
Do NOT replace it with an in-memory alternative. See skills/ai-resilience/SKILL.md.

**Prettier is configured:**
`prettier.config.js` uses `prettier-plugin-tailwindcss` for class sorting.
Run `npm run format` before committing. CI runs `npm run format:check` and will fail on unformatted files.

---

## File Conventions

```
src/
  middleware.ts         # Edge runtime auth guard - protects (app)/ routes, passes
                        # through /api/webhooks (Stripe does its own auth) and
                        # /api/sync (auth handled inside route). Keep lean - no DB calls.
  app/
    layout.tsx          # Root layout (providers, HTML structure)
    globals.css         # Global Tailwind styles
    manifest.ts         # PWA manifest generation
    sw.ts               # Serwist service worker (excluded from tsconfig)
    (auth)/             # Login, signup (no app layout)
    (app)/              # All authenticated routes (with shell layout)
    onboarding/         # Onboarding quiz (multi-step, client components)
    api/
      webhooks/         # Stripe webhooks (auth via signature verification)
      sync/
        workout-sets/   # Offline sync endpoint - receives batched sets from service worker
      debrief/
        [sessionId]/    # Streaming debrief route (Vercel AI SDK streamText, rate-limited)
    (app)/
      workout/
        [sessionId]/
          complete/     # Post-workout experience (streak, heatmap, debrief, share card)
  actions/              # Server Actions (next-safe-action v7)
    workout.actions.ts  # Session logging, completeSessionAction, generateDebriefAction
    program.actions.ts  # Program generation, adjustment
    profile.actions.ts  # Profile read/write, kiro_persona toggle
    onboarding.actions.ts # Onboarding data save, createAccountAction
    social.actions.ts   # Requires NEXT_PUBLIC_SOCIAL_ENABLED=true
  components/
    ui/                 # shadcn/ui base - never modify directly
    workout/            # WorkoutCard, SetLogger, RestTimer, etc.
    onboarding/         # Quiz screens, ArchetypeReveal, etc.
    ai/                 # KiroDebrief, StreamingText, etc.
    charts/             # RecoveryHeatmap, ProgressChart, etc.
    social/             # ShareCard, Leaderboard, etc.
  lib/
    ai/
      workout-generator.ts  # Core generation logic (includes Anthropic SDK client + prompts)
      workout-validator.ts  # Post-generation rule enforcement
      safety-filter.ts  # Input safety check (runs before EVERY Claude call)
      circuit-breaker.ts    # Redis-backed circuit breaker for Claude API resilience
                            # Tracks failures per key in Upstash Redis - MUST use Redis,
                            # memory-only breaks on Vercel cold starts. Keys: PROGRAM_GENERATION,
                            # DEBRIEF, ADJUSTMENT, INTAKE. See skills/ai-resilience/SKILL.md
      kiro-voice.ts     # Kiro voice constants and task-specific prompts
                        # (imports from src/lib/onboarding/archetypes.ts)
      # rag.ts          <- DEFERRED to post-MVP. See RAG Decision section below.
    db/
      supabase.ts       # Client + server Supabase singletons
      queries/          # Typed query functions - no raw SQL in components
    offline/
      db.ts             # Dexie.js IndexedDB schema
      # sync.ts         <- TODO: background sync queue (not yet built)
    onboarding/
      archetypes.ts     # ALL archetype logic lives here (8 archetypes)
      flow-config.ts    # Onboarding screen config (drives UI)
    utils/
      rate-limit.ts     # Upstash Redis rate limiting
      progressive-overload.ts  # Deterministic overload calculations
      recovery-model.ts # SRA curve per muscle group
      equipment.ts      # Equipment categorization (classifyEquipmentBucket)
      contraindications.ts  # Injury-to-exercise mapping
      # workout-share.ts <- TODO: share card image generation (not yet built)
    validation/
      schemas.ts        # All Zod schemas
  hooks/                # Custom React hooks
  types/
    index.ts            # All TypeScript types (import from here)
    supabase.generated.ts  # Auto-generated (run npm run db:types)
  stores/
    workout.store.ts    # Zustand: active workout state
    onboarding.store.ts # Zustand: onboarding quiz progress
```

---

## Reference Documents

| What you are building                          | Read first                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Any git commit, branch, or PR                  | skills/git-workflow/SKILL.md                                                   |
| AI resilience / fallback programs              | skills/ai-resilience/SKILL.md                                                  |
| Any Server Action                              | skills/server-action-builder/SKILL.md                                          |
| Any Supabase query or DB read/write            | skills/supabase-query-patterns/SKILL.md                                        |
| Any TypeScript type error or strict flag issue | skills/typescript-strict-patterns/SKILL.md                                     |
| Onboarding screens                             | docs/onboarding/FLOW.md                                                        |
| Any AI feature                                 | docs/science/PROGRAMMING_RULES.md + skills/exercise-science-grounding/SKILL.md |
| Exercise selection or injuries                 | docs/science/CONTRAINDICATIONS.md                                              |
| Offline workout logging                        | skills/offline-sync-pattern/SKILL.md                                           |
| Auth, RLS, encryption                          | docs/security/SECURITY.md + skills/rls-migration-checklist/SKILL.md            |
| Health data read/write                         | skills/health-data-encryption/SKILL.md                                         |
| Kiro voice or AI content                       | skills/kiro-output-auditor/SKILL.md                                            |
| Analytics events                               | skills/posthog-event-taxonomy/SKILL.md                                         |
| New database migration                         | skills/rls-migration-checklist/SKILL.md                                        |
| FitBod gaps to exploit                         | docs/competitive/FITBOD_ONBOARDING_AUDIT.md                                    |
| Navigation patterns                            | docs/competitive/FITBOD_NAV_AUDIT.md                                           |
| Full market context                            | docs/research/KAIROFIT_RESEARCH_SCAFFOLD.md                                    |
| Database schema                                | supabase/migrations/001_initial_schema.sql                                     |
| All decisions + full context                   | skills/kairofit-dev-assistant/SKILL.md                                         |

---

## RAG Decision (Deliberately Deferred)

The research scaffold designed a full pgvector knowledge base:

- 1536-dimensional embeddings on the exercises table
- Cosine similarity retrieval per query
- XML-injected context chunks (exercises, anatomy, contraindications)
- Architecture: stable base prompt cached at 90% discount + dynamic RAG for query-specific context

**Decision: RAG is deferred to post-MVP.**

Rationale: the static system prompt approach is sufficient for the top 150 enriched exercises
that ship at launch. At 1,300+ exercises with full enrichment, RAG becomes necessary.
Trigger for implementation: when users begin swapping exercises at >15% rate
(indicating Kiro lacks specific knowledge) or when the system prompt exceeds 4,000 tokens.

When building RAG:

1. ~~Add `CREATE EXTENSION vector` to a new migration~~ - DONE in `supabase/migrations/002_resilience_and_rag_prep.sql`
2. Add `embedding vector(1536)` column to exercises table (new migration)
3. Create retrieval function using cosine similarity
4. Create src/lib/ai/rag.ts
5. Update workout-generator.ts to inject retrieved context before generation

---

## Testing Roadmap (Five Layers)

Only Layer 1 currently exists. Layers 2-5 are planned:

Layer 1 - Structural validation (EXISTS): workout-validator.ts checks volume caps, rep ranges, rest periods, injury contraindications.

Layer 2 - Property-based testing (TODO): fast-check library generates random UserProfile objects and verifies universal invariants hold (no program exceeds volume caps, no contraindicated exercises assigned, all rest periods valid). File: src/lib/ai/workout-validator.test.ts

Layer 3 - LLM-as-judge (TODO): after generation, a secondary Haiku call evaluates quality on 5 dimensions (safety, scientific accuracy, personalization, Kiro voice, completeness). Score threshold for acceptance: 4/5 minimum. File: src/lib/ai/quality-judge.ts

Layer 4 - Snapshot regression (TODO): 50-100 expert-validated "golden profiles" with expected program outputs. New generation must match within acceptable deviation. File: src/lib/ai/**tests**/golden-profiles/

Layer 5 - A/B production (TODO): workout completion rate as the quality proxy. Apps with >70% completion see 43% higher LTV. Track WORKOUT_COMPLETED / WORKOUT_STARTED ratio in PostHog per program generation model/prompt version.

---

## Learned Skills (Cross-Device Sync)

Claude Code learns patterns from this project and saves them to `~/.claude/skills/learned/`.
These are committed to `.claude/skills/learned/` so they sync across devices.

**New device setup** (after cloning):

```bash
bash scripts/sync-skills.sh import
```

**After learning a new skill** (before committing):

```bash
bash scripts/sync-skills.sh export
git add .claude/skills/learned/
git commit -m "chore: add learned skill - <name>"
```

**Check what's out of sync:**

```bash
bash scripts/sync-skills.sh status
```

---

## Workflow Patterns for Claude Code Sessions

### Git Worktrees for Parallel Sessions

Run multiple isolated Claude Code sessions without context bleed:

```bash
git worktree add ../kairofit-feature-x -b feature/x
# Open a separate terminal in ../kairofit-feature-x
# Each session has its own working tree but shares the git history
```

Use case: one session builds the onboarding flow while another builds the workout logger.

### Staff Engineer Review Pattern

After planning a feature but before implementing, open a second Claude Code session and say:
"Here is my plan for [feature]. Act as a senior engineer reviewing this plan. What are the risks, missing edge cases, and better alternatives?"
Implement only after the critique session.

### after() API for Non-Blocking Analytics

Next.js 15 `after()` runs code after the response is sent. Use for analytics that should not delay the user:

```typescript
import { after } from 'next/server'

export async function completeSessionAction(input) {
  const session = await saveSession(input)
  // This runs AFTER the response is returned to the client
  after(async () => {
    await posthog.capture('WORKOUT_COMPLETED', { session_id: session.id })
    await updateMuscleRecovery(session)
  })
  return session
}
```

### useActionState + useOptimistic Together

CLAUDE.md previously only mentioned useOptimistic. Both serve different purposes:

- `useOptimistic`: immediate UI update before server confirms (set logging)
- `useActionState`: form error handling and pending state (onboarding forms)
  Use useOptimistic for set logging. Use useActionState for form submissions that need error display.

### Specific Cache Revalidate Values

```typescript
// Exercise library - changes rarely, stale for 24 hours is fine
export const revalidate = 86400 // 24 hours

// Leaderboards - should be relatively fresh
export const revalidate = 300 // 5 minutes

// Active program - user expects immediate updates
export const revalidate = 0 // no cache, always fresh

// User profile - subscription status must be current
export const revalidate = 0
```

---

## Directory Structure: lib/db/queries/

All database query functions live in `src/lib/db/queries/`.
This applies to both Server Component usage and Client Component usage.

`src/lib/db/queries/` - All typed Supabase query functions

- Called directly from Server Components, Server Actions, and Route Handlers
- Example: `getActiveProgram(userId: string): Promise<Program>`

When a Client Component needs reactive data (loading state, refetch, cache invalidation),
add a TanStack Query hook alongside the query function in the same file or a co-located
`*.hooks.ts` file. There is no separate `src/lib/queries/` directory.

Note: `src/lib/queries/` was removed. Do not recreate it.
