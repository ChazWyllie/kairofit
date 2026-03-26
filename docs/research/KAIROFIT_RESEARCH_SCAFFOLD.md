# KairoFit: Complete Research Scaffold

> **PRICING MODEL CORRECTION - Read before the pricing section below**
> The three-tier model described in this document (/bin/sh / .99 / 9.99) was evaluated
> and rejected. The final pricing decision is documented in CLAUDE.md:
>
> - Free at launch (no trial countdown, no AI limits)
> - .99/month when monetized (flip NEXT_PUBLIC_PAYWALL_ENABLED=true)
>   No Premium+ tier. No free tier with limited AI. Do not build toward the three-tier model.

Generated via comprehensive research. Last updated with all review corrections.

CORRECTIONS FROM CODE REVIEWS:

- App Store Optimization is NOT the primary acquisition channel for a PWA.
  The growth strategy now reflects PWA-first acquisition channels.
- Volume hard cap is level-specific. Global max is 25 but only for level 5.
- Compound rest minimum is 120 seconds throughout.

---

## Market Opportunity

The fitness app market hit $3.4 billion in 2025 (up 24.5% YoY).
Only 1.7% of fitness app downloads convert to paid - industry-wide failure.
FitBod generates approximately $24M/year but loses users after an average of 8 workouts.

KairoFit targets the $9.99/month "smart middle ground" between:

- Dumb trackers (Hevy, Strong: $4-5/month, zero programming intelligence)
- Expensive AI coaches (Dr. Muscle: $49/month, poor UX)

---

## Competitive Landscape

### FitBod ($15.99/month)

What works: zero-friction daily workout generation, muscle recovery heatmap, equipment profiles,
multi-gym switching, 1,600+ exercise library, pre-filled sets/reps/weights.
What fails: fatigue rotation not periodization, averages 8 workouts before churn, inaccurate
weight suggestions, no injury screening, no intermediate level, email gate at screen 31.
Our edge: better science, better transparency, lower price, injury screening, 5 experience levels.

### Hevy ($3.99/month, 10M users)

Best pure workout tracker. Zero intelligence. No program generation.

### Strong ($4.99/month, 3M users)

Fastest logging UX. Passive tracker only.

### Dr. Muscle ($48.99/month)

Most sophisticated AI adaptation. RPE-based. Auto-deloads. Prohibitively expensive, bad UX.

### RP Hypertrophy ($34.99/month)

Dr. Israetel's volume landmarks methodology. Best science, hypertrophy-only, intermediate+ only.

### Pricing Position

KairoFit at $9.99/month: better science than FitBod at half the price of Dr. Muscle.
Free at launch. Paywall enabled via feature flag when ready.

---

## Exercise Science Foundation

### Volume

Schoenfeld (2017) meta-analysis: clear dose-response for hypertrophy.
Baz-Valle (2022): optimal for trained individuals is 12-20 sets/week.

Level-specific caps (NOT a universal 25):

- Beginner (1-2): 4-16 sets maximum
- Intermediate (3): 8-20 sets maximum
- Advanced (4-5): 12-25 sets maximum

### Rep Ranges

Hypertrophy across 5-30+ reps when taken close to failure. Proximity matters more than range.
Strength: 1-6 reps. Hypertrophy: 6-15 reps. General: 8-12 reps.

### Rest Periods

Schoenfeld (2016): 3-minute rest = 13.1% quad growth vs 6.8% with 1-minute rest.
Compound minimum: 120 seconds. Isolation: 60-90 seconds. Absolute minimum: 30 seconds.

### Frequency

Minimum: 2x/week per muscle for hypertrophy.
Higher frequency = volume distribution tool, not multiplier.

### Progressive Overload

Plotkin et al. (2022): both load and rep progression produce similar hypertrophy.
Beginners: linear. Intermediate: double progression. Advanced: RPE-based or DUP.

### Deload

Intermediate: every 5 weeks (documented decision).
Beginner: every 6 weeks. Advanced: every 4 weeks.
Reduce volume 40-50%, maintain intensity.

### Splits

Ramos-Campo (2024): no significant difference between split types when volume is equated.
Split is a scheduling preference. Recommend based on days available, not ideology.

---

## Claude API Production Patterns

### Structured Outputs

Anthropic's Structured Outputs (GA on Sonnet 4.5+) use constrained decoding.
Mathematical guarantee of JSON schema compliance.
Numerical constraints (min/max) are NOT enforced - validate post-response.
Monitor stop_reason: 'refusal' overrides schema compliance.

### Prompt Caching (critical for cost)

KIRO_BASE_SYSTEM_PROMPT is ~2000 tokens. Cache with cache_control: { type: 'ephemeral' }.
Cache reads cost 0.1x base price (90% discount).
See buildCachedSystemMessage() in workout-generator.ts.
Missing prompt caching increases AI costs by approximately 40%.

### Model Selection by Task

| Task                  | Model                     | Reason                  |
| --------------------- | ------------------------- | ----------------------- |
| Workout generation    | claude-sonnet-4-20250514  | Needs reasoning quality |
| Post-workout debrief  | claude-sonnet-4-20250514  | Nuanced, personalized   |
| Safety classification | claude-haiku-4-5-20251001 | Fast, cheap, sufficient |
| Exercise substitution | claude-haiku-4-5-20251001 | Simple mapping task     |
| Intake interview      | claude-sonnet-4-20250514  | Conversational nuance   |

### Cost Estimate

Sonnet: $3 per MTok input / $15 per MTok output.
Haiku: $0.80 per MTok input / $4 per MTok output.
Cached input: 0.1x base price.
Estimated per workout generation (~3K output tokens): ~$0.045.
At free tier with 10 workouts/month: $0.45/user/month in AI costs.

---

## Technical Architecture

### Stack

Next.js 15 App Router + Turbopack.
Supabase PostgreSQL + Auth + RLS.
Anthropic Claude API via Vercel AI SDK.
Zustand + TanStack Query v5 for state.
Serwist (@serwist/next) for PWA. NOT next-pwa (Turbopack incompatibility).
Dexie.js for offline IndexedDB.
Upstash Redis for rate limiting.
PostHog for analytics.
Stripe for payments (behind feature flag at launch).
Vercel for hosting.

### Key Patterns

- Server Components by default, client only when needed
- Server Actions with next-safe-action v7 for all mutations
- useOptimistic (React 19) for instant set logging UI
- Write-IndexedDB-first, sync-to-Supabase-second for offline workout logging
- Prompt caching on all Kiro system prompts
- Circuit breaker pattern for AI endpoint resilience

---

## Growth Strategy (PWA-first)

KairoFit is a Progressive Web App. It does NOT appear in iOS App Store or Google Play searches.
Any reference to "App Store Optimization as the #1 acquisition channel" is wrong for this architecture.

### PWA-First Acquisition Channels (in order of ROI)

1. Web SEO
   Target: "AI workout app", "research-based strength training", "progressive overload app",
   "personalized workout program", competitor comparison queries.
   Long-tail is high-converting: "best app for intermediate lifters", "workout app with injury modification".

2. Content Marketing
   Expert-authored training science articles.
   Targets the same audience searching for workout guidance.
   Builds topical authority and backlinks over time.

3. Referral Program
   92% trust rate for friend recommendations vs advertising.
   Reward both referrer and referred with trial extensions.
   Gym-going users naturally talk to other gym-going users.

4. Fitness Community Presence
   Reddit (r/fitness, r/weightroom, r/naturalbodybuilding): authentic participation, not spam.
   YouTube fitness creator partnerships.
   Discord servers focused on evidence-based training.

5. App Store (post-revenue roadmap)
   Capacitor or React Native wrapper for iOS App Store and Google Play submission.
   Requires Apple Developer account ($99/year).
   Pursue when monthly revenue justifies the cost and engineering time.

### Key Retention Metrics (from PostHog)

Day 1 retention target: 35-45%
Day 7 retention target: 20-30%
Workout completion rate target: >70% (best AI quality proxy)
Exercise swap rate target: <15% (measures AI recommendation quality)
Free-to-paid conversion target: >5% (industry average is 1.7%)

A 5% retention improvement produces 25-95% profit improvement.
Prioritize retention over acquisition at every stage.

---

## Skills to Build Alongside KairoFit

All 10 skills are in the skills/ directory:

1. exercise-science-grounding - enforce research rules in every AI prompt
2. workout-validator - post-generation safety and quality checker
3. onboarding-flow-builder - generate quiz screens from config
4. kairofit-dev-assistant - full codebase and product knowledge
5. server-action-builder - canonical next-safe-action v7 patterns
6. offline-sync-pattern - Dexie + Serwist offline-first architecture
7. rls-migration-checklist - prevent FOR ALL without WITH CHECK in future migrations
8. kiro-output-auditor - voice linter and AI output review checklist
9. posthog-event-taxonomy - canonical event names for analytics
10. health-data-encryption - pgcrypto + Vault implementation patterns
11. kairofit-changelog - release notes from git commits

---

## Launch Checklist (pre-launch blockers)

Technical:

- npm run db:types run after db:push (developer setup)
- All feature flags default to false (social, wearables, nutrition, paywall)
- Kiro persona is a profile column, not an env flag
- Stripe paywall tested end-to-end in staging
- E2E tests passing in CI
- CSP headers include PostHog and Stripe domains
- GDPR data export and deletion flows tested

Legal/Compliance:

- Supabase DPA signed: https://supabase.com/dpa
- Anthropic DPA signed (required for EU users)
- Stripe DPA enrolled via Stripe dashboard
- Privacy Policy updated for FTC HBNR compliance
- Terms of Service finalized
- security@kairofit.com inbox monitored

Operations:

- Supabase pg_cron or Edge Function scheduled for conversation expiry
- Error monitoring set up (Sentry or similar)
- PostHog events verified firing correctly
- Rate limiting tested under load
