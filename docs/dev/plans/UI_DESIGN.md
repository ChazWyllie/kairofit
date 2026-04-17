# KairoFit - UI Design Reference

> **Source of truth priority:** `CLAUDE.md` > code > this document.
> This file is a human-readable summary for designers and engineers.
> When values here conflict with `CLAUDE.md` or `src/`, the code wins.
> Update this document whenever a design decision is codified.

Last verified: 2026-04-09

---

## Design Principles

1. **Dark always.** No light mode toggle. Ever. The background is `#0A0A0B` on every surface.
2. **Precision over decoration.** Every visual element earns its place by improving comprehension or conversion. No gradients for aesthetics.
3. **Indigo is surgical.** The brand accent (`#6366F1`) appears only on primary CTAs, active states, and key highlights. When it appears, it draws the eye because everything else is restrained.
4. **No em dashes anywhere.** In code, in copy, in Kiro output - use a regular dash (`-`) or restructure. This is enforced by `npm run lint:kiro`.
5. **Kiro voice in copy.** Second person always. Specific numbers always. No motivational phrases. Trust comes from accuracy, not enthusiasm.
6. **Mobile-first.** Design at 375px width first. The primary entry point is web search and direct links, not app stores.
7. **Science transparency is the differentiator.** Every UI decision that makes the science visible is a competitive advantage over FitBod.
8. **Deterministic code, Kiro language.** `src/lib/utils/` owns programming logic. Kiro (Claude API) owns all natural language explanation.

---

## Color System

All values used in production. Do not introduce new colors without updating `CLAUDE.md`.

### Backgrounds

| Token      | Hex       | Usage                                            |
| ---------- | --------- | ------------------------------------------------ |
| Near-black | `#0A0A0B` | Page root background                             |
| Surface    | `#111113` | Section alternates (even sections), nav backdrop |
| Elevated   | `#1A1A1F` | Cards, feature tiles, modal surfaces             |

### Text

| Token     | Hex       | Usage                                       |
| --------- | --------- | ------------------------------------------- |
| Primary   | `#F5F5F4` | Headlines, card titles, active labels       |
| Secondary | `#A1A19E` | Body copy, descriptions, subtitles          |
| Muted     | `#6B6B68` | Captions, metadata, legal text, trust lines |

### Accents

| Token             | Hex       | Usage                                                      |
| ----------------- | --------- | ---------------------------------------------------------- |
| Brand (indigo)    | `#6366F1` | Primary CTAs, active states, section eyebrows, step badges |
| Energy (orange)   | `#F97316` | Streaks, PRs, milestones, feature icon accents             |
| Success (emerald) | `#10B981` | Completions, beta badge, positive feedback                 |
| Danger (red)      | `#EF4444` | Injury flags, contraindication warnings                    |

### Borders

| Token   | Tailwind          | Usage                        |
| ------- | ----------------- | ---------------------------- |
| Default | `border-white/5`  | Card edges, section dividers |
| Hover   | `border-white/10` | Card hover state             |

---

## Typography

| Role              | Font       | Notes                                                      |
| ----------------- | ---------- | ---------------------------------------------------------- |
| UI / all copy     | Geist Sans | Loaded via `next/font/google`. Weights 400, 500, 600, 700. |
| Numbers / metrics | Geist Mono | Monospace. Used for set counts, weights, rep targets.      |

**Heading tracking:** `-0.025em` to `-0.04em` (tighter = more premium).
**Body tracking:** `0` to `0.01em`.
**Caps / eyebrows:** `0.05em` to `0.1em` with `uppercase` class.

No more than two font families. Do not introduce a display font without a product decision.

---

## Spacing System

8px base grid. Use Tailwind spacing utilities that map to this scale.

| Scale | Value   | Tailwind |
| ----- | ------- | -------- |
| 4px   | 0.25rem | `p-1`    |
| 8px   | 0.5rem  | `p-2`    |
| 16px  | 1rem    | `p-4`    |
| 24px  | 1.5rem  | `p-6`    |
| 32px  | 2rem    | `p-8`    |
| 48px  | 3rem    | `p-12`   |
| 64px  | 4rem    | `p-16`   |
| 96px  | 6rem    | `p-24`   |

Section vertical padding: `py-24` (96px). Max content width: `max-w-6xl` (1152px). Side padding: `px-4 sm:px-6`.

---

## Border Radius

| Token          | Value  | Usage                                |
| -------------- | ------ | ------------------------------------ |
| `rounded-lg`   | 8px    | Buttons, small elements              |
| `rounded-xl`   | 12px   | CTA buttons                          |
| `rounded-2xl`  | 16px   | Cards, feature tiles, section blocks |
| `rounded-full` | 9999px | Pills, badges, step number circles   |

---

## User Personas

KairoFit identifies each user's training archetype during onboarding (screens 12-14).
The archetype is revealed at screen 15 and drives program emphasis, science depth defaults,
and Kiro's feedback style throughout the app.

**Authoritative source:** `src/lib/onboarding/archetypes.ts`

### The 8 Archetypes

| Archetype            | Emoji | Headline                                                                 | Default Science Depth |
| -------------------- | ----- | ------------------------------------------------------------------------ | --------------------- |
| **System Builder**   | 🏗️    | You thrive with structure. Knowing the why is what makes the difference. | Expanded              |
| **Milestone Chaser** | 🎯    | Progress stacking up each week is your fuel.                             | Collapsed             |
| **Explorer**         | 🧭    | You need variety to stay engaged - and the science supports that.        | Collapsed             |
| **Pragmatist**       | ⚡    | You want results. You want efficiency. No overhead.                      | Collapsed             |
| **Comeback Kid**     | 🔄    | Getting back is harder than starting. We will make it easier.            | Collapsed             |
| **Optimizer**        | 📊    | You have been at this long enough to know that details matter.           | Expanded              |
| **Challenger**       | 🔥    | You train to see what you are capable of.                                | Collapsed             |
| **Understander**     | 📖    | You want to know why, and that makes you train better.                   | Expanded              |

### Archetype Assignment Logic

Four Likert scores (1-5) from onboarding:

1. "Seeing my progress metrics each week keeps me motivated." (progress)
2. "I love when my workouts challenge me more each session." (challenge)
3. "I prefer structure - knowing exactly what to do each day." (structure)
4. "Understanding why an exercise is in my program motivates me." (understanding)

`Comeback Kid` is assigned first when `challenge <= 2 AND progress <= 2`. All others
are scored against weighted profiles and the highest wins. See `assignArchetype()` in
`src/lib/onboarding/archetypes.ts` for the exact formula.

---

## Landing Page

> Note: the live root route now serves the internal showcase directory at `/`. The landing-page structure below remains the canonical design reference for the Signal baseline and future public landing work.

File: `src/app/page.tsx`
Route: `/` (public, no auth required)

The landing page has 7 sections plus a footer, rendered in this order:

```
LandingNav
HeroSection
ScienceHookSection
HowItWorksSection
ArchetypeSection
FeaturesGrid
LandingCTA
Footer (inline in page.tsx)
```

### 1. LandingNav

**File:** `src/components/marketing/LandingNav.tsx`

Sticky header. Transparent at top, frosted glass on scroll.

- Left: `KAIROFIT` wordmark
- Right: `Sign in` (text link) + `Get started` (indigo pill button)
- Mobile: hamburger that opens a full-screen overlay
- On scroll: `backdrop-blur` + subtle `border-b border-white/5`

### 2. HeroSection

**File:** `src/components/marketing/HeroSection.tsx`

Full viewport height (`min-h-screen`). Vertically centered. Text-center on all breakpoints.

- **Eyebrow pill:** `border border-white/10 bg-[#111113]` - emerald dot + "Free during beta"
- **Headline:** `Research-backed AI / workout programming. / Now you know why.`
  - Size: `text-5xl sm:text-6xl lg:text-7xl`
  - "workout programming." in `text-[#6366F1]`
- **Subheadline:** Explains Kiro's approach in 2 sentences. Max width 540px. `text-[#A1A19E]`
- **Primary CTA:** `Build my program - free` - indigo rounded-xl button -> `/onboarding`
- **Secondary:** `Already have an account? Sign in` - text link -> `/auth/login`
- **Trust line:** "5-minute quiz. No credit card. Works offline." in `text-[#6B6B68] text-xs`
- **Scroll indicator:** Animated chevron-down at `bottom-10`
- **Background glow:** `bg-[#6366F1]/8` radial at 500x700px with `blur-[120px]`
- **Animation:** Three elements (headline, subheadline, CTA row) stagger in with
  `opacity 0 -> 1` + `translateY(20px -> 0)`, 120ms between each, implemented
  with `useEffect` + inline style transitions (no Framer Motion on hero).

### 3. ScienceHookSection

**File:** `src/components/marketing/ScienceHookSection.tsx`
**Background:** `bg-[#111113]`

The core differentiator section. Three cards explaining the science transparency system.

- **Eyebrow:** "Science transparency" in `text-[#6366F1]`
- **Headline:** "Know why every rep."
- Three layer cards on `grid sm:grid-cols-3`:
  - **Layer 1** - One-line rationale (indigo icon) - shown beneath every exercise card
  - **Layer 2** - Full program rationale (orange icon) - program overview paragraph from Kiro
  - **Layer 3** - Research notes (emerald icon) - expandable per exercise, study references
- Each card has a mock quote in a dark inset box showing an example Kiro output
- Levels 4-5 users see Layer 3 open by default; levels 1-3 see it collapsed

### 4. HowItWorksSection

**File:** `src/components/marketing/HowItWorksSection.tsx`
**Background:** `#0A0A0B` (inherits page root - no explicit bg class)

Three numbered steps with a connecting line (indigo gradient).

- **Eyebrow:** "How it works"
- **Headline:** "From intake to first rep."
- **Step 01:** 5-minute intake quiz - 22 questions covering experience, equipment, schedule, goals, injury history, sleep, body comp
- **Step 02:** Kiro builds your program - applies periodization, recovery windows, contraindication matching
- **Step 03:** Train with context - sets/reps/weight + next-session targets computed from logged performance

**Layout:** Vertical on mobile with a left-edge connector line. 3-column grid on `lg` with a horizontal connector line (`bg-gradient-to-r from-[#6366F1]/40 via-[#6366F1]/20 to-transparent`).

**Step number badge:** `rounded-full bg-[#6366F1] text-white text-xs font-bold h-10 w-10`

### 5. ArchetypeSection

**File:** `src/components/marketing/ArchetypeSection.tsx`
**Background:** `#0A0A0B`

Renders all 8 archetypes from `ARCHETYPES` in `src/lib/onboarding/archetypes.ts`.

- **Eyebrow:** "Personality-matched training"
- **Headline:** "Your archetype, your program"
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Each card shows: emoji (2xl), name (semibold `#F5F5F4`), headline (sm `#A1A19E`)
- Cards: `rounded-2xl border border-white/5 bg-[#1A1A1F]` with hover brightening

### 6. FeaturesGrid

**File:** `src/components/marketing/FeaturesGrid.tsx`
**Background:** `bg-[#111113]`

Six feature tiles in a 3-column grid on desktop.

| Feature                  | Icon color | Key detail                                                       |
| ------------------------ | ---------- | ---------------------------------------------------------------- |
| AI Coach Kiro            | Indigo     | Named, direct, science-literate - specific numbers, not phrases  |
| Recovery heatmap         | Orange     | 13-muscle SRA curve visualization per session                    |
| Offline-first            | Emerald    | Logs sets without network; background sync                       |
| Progressive overload     | Indigo     | Computed from actual logged performance                          |
| Adaptive volume          | Orange     | Beginners cap at 16 sets; level 5 up to 25                       |
| Injury-aware programming | Red        | Full injury history in intake; contraindicated movements flagged |

Icon container: `h-10 w-10 rounded-xl bg-[#0A0A0B]`

### 7. LandingCTA

**File:** `src/components/marketing/LandingCTA.tsx`
**Background:** `#0A0A0B`

Centered conversion section. Max width `max-w-3xl`.

- **Headline:** "Start with a 5-minute quiz." / "Walk into the gym with a reason." (second line in `text-[#6366F1]`)
- **Body:** Reinforces free + no credit card + offline gym use
- **CTA:** `Build my program - free` -> `/onboarding`
- **Below:** "Already have an account? Sign in" link

### 8. Footer

**Location:** Inline in `src/app/page.tsx`
**Background:** inherits `#0A0A0B`, `border-t border-white/5`

Four-column grid on `lg`: Brand, Product links, Company links, Legal links.
Product links: Get started (`/onboarding`), Sign in (`/auth/login`).
Company and Legal links are placeholders (`<span className="text-[#6B6B68]">`) until pages exist.
Copyright: `&copy; {new Date().getFullYear()} KairoFit. All rights reserved.`

---

## Key Interface Components

These are in-app surfaces rendered after authentication. They are not visible on the landing page.

### WorkoutCard

**File:** `src/components/workout/WorkoutCard.tsx`

Displays a single exercise in the active session.

- Shows exercise name, target sets x reps, target weight, and Layer 1 science rationale (one sentence)
- Red border/badge when the exercise is contraindicated for the user's injury zones
- Layer 3 expand toggle for full research notes
- Science depth defaults are archetype-driven: System Builder, Optimizer, Understander default to expanded

### SetLogger

**File:** `src/components/workout/SetLogger.tsx`

Offline-first set logging. This is a critical UX constraint:

- **Always writes via `logSetOffline()`** - never calls a server action directly
- Stores to Dexie.js (IndexedDB) first; background sync pushes to Supabase
- Shows optimistic UI immediately; sync state is communicated with a subtle indicator
- Failure mode: sets are never lost - they persist in IndexedDB until sync succeeds
- See `skills/offline-sync-pattern/SKILL.md` for the full pattern

### RestTimer

**File:** `src/components/workout/RestTimer.tsx`

Countdown timer shown between sets. Rest period is determined by the exercise type
and user's experience level. Displays the science rationale for the rest duration
(e.g., "3 min rest - compound movements need full phosphocreatine resynthesis").

### KiroDebrief

**File:** `src/components/ai/KiroDebrief.tsx`

Post-workout debrief that streams inline (not a popup or modal). Uses Vercel AI SDK
`streamText` via the route at `app/api/debrief/[sessionId]/`.

- Renders streaming text progressively as tokens arrive
- Kiro voice applies: specific numbers, no motivational phrases
- Rate-limited via Upstash Redis (see `src/lib/utils/rate-limit.ts`)
- Circuit breaker at `src/lib/ai/circuit-breaker.ts` - if Claude API fails, falls back
  to a pre-generated program summary (Redis-backed state, not in-memory)

### RecoveryHeatmap

**File:** `src/components/charts/RecoveryHeatmap.tsx`

13-muscle visualization showing where each muscle group sits on the SRA
(Stimulus, Recovery, Adaptation) curve after a session logs.

- Color encodes recovery state: fully recovered (green), recovering (amber), fatigued (red)
- Updates immediately after session completion
- Drives next-session exercise selection in the generator

### ShareCard

**File:** `src/components/social/ShareCard.tsx`

On-demand shareable workout card generated after session completion. Part of the
4-step post-workout experience: streak animation -> heatmap update -> Kiro debrief -> share card.
The share card is the final step and is triggered by user action, not auto-shown.

---

## Animation and Motion

KairoFit uses CSS transitions for simple hover states and `useEffect` with inline styles
for entrance animations. Framer Motion is available for complex scroll-triggered animations
but is not currently used on the landing page.

Any component using `motion.*` from Framer Motion **must be a Client Component** (`'use client'`).
Using motion in a Server Component throws a hard-to-diagnose runtime error.

### Landing Page Entrance Pattern

Hero elements use `useEffect` with sequential `setTimeout`:

- Initial state: `opacity: 0; transform: translateY(20px)`
- Revealed state: `opacity: 1; transform: translateY(0)`
- Transition: `0.6s ease` on both properties
- Stagger: 120ms between headline, subheadline, CTA row

### Hover States

- Cards: `transition-colors hover:border-white/10` (border brightening)
- Buttons: `hover:bg-[#5558E6]` (darkened indigo)
- Text links: `hover:text-[#F5F5F4]` (secondary -> primary)

### Scroll Indicator

Bounce animation on the hero chevron: Tailwind `animate-bounce` class.

### Accessibility

All animations must respect `prefers-reduced-motion`. Wrap any non-trivial animation
in a media query check or Framer Motion's `useReducedMotion()` hook.

---

## Mobile Requirements

- Design at **375px width first**, then scale to 1440px
- Touch targets: minimum 44x44px
- Font sizes: body minimum 16px on mobile (prevents iOS auto-zoom)
- Form inputs: minimum 16px font-size (prevents iOS auto-zoom)
- Hero: headline + subheadline + CTA must all be visible without scrolling on 375x812
- Horizontal carousels: `scroll-snap-type: x mandatory` + momentum scrolling
- Buttons: full-width (`w-full`) on mobile, auto-width on desktop (`sm:w-auto`)
- iOS safe area: `pb-[env(safe-area-inset-bottom)]` on sticky footers
- No hover-dependent interactions on mobile - all interactions must work with tap

---

## Pricing and CTA Copy

**Current state:** Free during beta. `NEXT_PUBLIC_PAYWALL_ENABLED=false`.
**Future state:** $9.99/month or $79.99/year. Stripe is wired up.

CTA copy reflects the free state:

- Primary: `Build my program - free`
- Trust line: `5-minute quiz. No credit card. Works offline.`
- Bottom CTA body: `Free during beta. No credit card. Works offline at the gym.`

When `NEXT_PUBLIC_PAYWALL_ENABLED=true`, CTA copy will need to be updated.
Do NOT flip this flag until pricing copy is reviewed.

---

## What Not To Do

- No light mode, no theme toggle, no system preference detection
- No em dashes in any copy, including Kiro AI output
- No motivational phrases in Kiro output ("Let's crush it", "Amazing work", "You've got this")
- No gradients on text (except very sparingly for one decorative hero moment if ever)
- No electric lime (`#E0FF4F`) - that was an early draft color, it is not in this product
- No `select('*')` on Supabase queries - always specify columns
- No direct Anthropic SDK calls from components - use `src/lib/ai/` modules only
- No carousels that auto-play without user control
- No `console.log` in production - `console.error` for errors only
- Do not recreate `src/lib/queries/` - all DB queries live in `src/lib/db/queries/`

---

## Quality Checklist

Before shipping any UI change:

- [ ] All hex values match the color system table above
- [ ] No em dashes in any copy or Kiro output strings
- [ ] Mobile layout tested at 375px (Hero above the fold, touch targets >= 44px)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No `console.log` statements in modified files
- [ ] Any `motion.*` component has `'use client'` directive
- [ ] New Supabase queries specify columns, not `select('*')`
- [ ] Kiro voice copy reviewed against `skills/kiro-output-auditor/SKILL.md`
- [ ] Color contrast passes WCAG AA on all text

## Showcase Variants

The internal showcase directory lives at `/` and links to three full-page previews under `/showcase/1`, `/showcase/2`, and `/showcase/3`.

- `Signal` is the closest expression of the canonical KairoFit design system.
- `Edge` is an internal orange-led exploration for stronger conversion framing.
- `Atlas` is an internal violet-led exploration for editorial authority.
- Options 2 and 3 do not replace the brand system. They test layout and emphasis patterns while keeping KairoFit product truth and copy rules intact.
- Future showcase generations should inherit approved patterns from `docs/dev/plans/UI_PREFERENCES.md`.
