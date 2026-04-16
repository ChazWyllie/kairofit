# KairoFit

**Research-backed AI workout programming. Now you know why.**

KairoFit is a PWA that out-programs FitBod with real periodization, injury screening,
transparent AI reasoning, and a named coach (Kiro) who explains every decision.
No App Store account required.

---

## What Makes KairoFit Different

| FitBod                              | KairoFit                                              |
| ----------------------------------- | ----------------------------------------------------- |
| No injury screening                 | Screen 8: injury zones auto-filter exercises          |
| No body composition                 | Height, weight used for timeline projection           |
| Fatigue rotation, not periodization | Real mesocycles with scheduled deloads                |
| Email gate at screen 31             | Email gate at screen 16, after archetype reveal       |
| Fake 4-second loading screen        | Split-screen: research fact + timeline + live preview |
| 3 experience levels                 | 5 levels with behavioral descriptions                 |
| Black-box algorithm                 | Kiro explains every programming decision              |
| $15.99/month                        | Free at launch, $9.99/month behind a feature flag     |

---

## Setup (follow this exact sequence)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/kairofit
cd kairofit
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, UPSTASH values

# 3. Set up Supabase
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push      # Apply schema and triggers

# 4. Generate TypeScript types (REQUIRED before starting dev)
npm run db:types     # Must run after db:push

# 5. Seed exercise library
npm run db:seed

# 6. Start development
npm run dev          # http://localhost:3000
```

Skipping `npm run db:types` causes a TypeScript missing-module error before you write a line.

---

## Project Structure

```
kairofit/
  CLAUDE.md              # AI coding context - read before any code change
  docs/                  # Research, competitive intel, specs
  scripts/               # Build scripts (kiro-lint.js)
  skills/                # Claude Code skills for AI-assisted development
  src/
    actions/             # Server Actions (next-safe-action v7)
    app/                 # Next.js App Router pages
    components/          # React components
    lib/                 # Business logic
    middleware.ts        # Auth guard for all protected routes
    stores/              # Zustand client state
    types/               # TypeScript types
  supabase/              # Migrations, seeds, Edge Functions
```

---

## Tests

```bash
npm test             # Vitest unit tests
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run lint:kiro    # Kiro voice linter (em dashes, banned phrases)
npm run test:e2e     # Playwright E2E (requires dev server)
```

---

## Monetization

KairoFit is free at launch. To enable the paywall:

```bash
# In Vercel environment variables:
NEXT_PUBLIC_PAYWALL_ENABLED=true
```

Stripe is already wired up. Set `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_ANNUAL`
to your price IDs and the 7-day trial logic activates automatically.

---

## Growth Strategy (PWA-first)

KairoFit is a PWA; it does NOT appear in iOS App Store or Google Play searches.
Acquisition channels that work for a web app:

1. Web SEO - target "AI workout program", "research-based strength training", etc.
2. Content marketing - expert-authored training science articles
3. Referral program - trial extensions for referrer and referred
4. Fitness communities - Reddit (r/fitness, r/weightroom), YouTube partnerships
5. App Store (post-revenue) - Capacitor wrapper once revenue supports the dev account

---

## AI Coach: Kiro

Kiro is direct, specific, and science-literate. Trust comes from accuracy.

"Your chest volume is at 12 sets this week - right in the optimal range for your level."

Not: "Amazing work! You're making incredible progress and should be proud!"

See src/lib/ai/kiro-voice.ts and skills/kiro-output-auditor/ for voice rules.

---

## Security and Compliance

- All health data (weight, body fat, injuries) encrypted at column level
- Row Level Security on every Supabase table with WITH CHECK on all writes
- FTC Health Breach Notification Rule compliant
- GDPR-ready (data export, deletion, DPA enrollment required before EU launch)

See docs/security/SECURITY.md for the full architecture.

---
