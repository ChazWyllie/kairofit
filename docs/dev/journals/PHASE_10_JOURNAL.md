# Phase 10 Development Journal - Landing Page & UI Design System

**Date:** 2026-04-09
**Branch:** feat/phase-10-landing-page
**Status:** Complete - PR ready

---

## Objective

Build a public-facing landing page for KairoFit that converts cold visitors into onboarding starters. Secondary objective: audit and rewrite UI_DESIGN.md, which described a completely different product.

---

## What Was Found at Session Start

### UI_DESIGN.md was wrong about everything

The original file described a human-coach waitlist product:

- $50/month, "Apply Now" CTA
- Cabinet Grotesk font (not Geist Sans)
- Electric lime `#E0FF4F` accent (not indigo `#6366F1`)
- 9 sections, none mapping to KairoFit's actual components
- No mention of archetypes, Kiro, science transparency, or PWA

**Decision:** Full rewrite, not a patch. The file is a living design reference now.

### Landing page components were already in working tree

All three milestones from LANDING_PAGE_IMPROVEMENTS.md had already been implemented before this session's workflow execution began. The task became: verify quality, commit cleanly, document, open PR.

---

## Milestones

### Milestone A - Brand and copy corrections

**Commits:** `c9f25e3`, `313bb61` (HowItWorksSection)

- Replaced "Claude analyzes your intake" with "Kiro analyzes your intake" everywhere
- This was a critical brand leak - exposing the AI vendor breaks the Kiro persona
- Step 1 copy now lists all 22 intake data points explicitly (experience, equipment, schedule, goals, injury history, sleep, body composition, work schedule)

### Milestone B - ArchetypeSection new component

**Commit:** `313bb61`

- `src/components/marketing/ArchetypeSection.tsx` - Server Component, no `'use client'`
- Sources archetypes from `ARCHETYPES` constant in `src/lib/onboarding/archetypes.ts`
- Iterates `Object.values(ARCHETYPES)` - zero hardcoded strings
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (8 archetypes = 2 rows on desktop)
- Cards render: emoji, name, headline (from ArchetypeDefinition type)
- Inserted between HowItWorksSection and FeaturesGrid in page.tsx

### Milestone C - FeaturesGrid tile swap and footer expansion

**Commit:** `313bb61`

- Tile 6: "Science citations" -> "Injury-aware programming"
  - Icon changed: `FlaskConical` -> `ShieldAlert` (danger red `#EF4444`)
  - Rationale: injury safety is a real differentiator vs FitBod; science citations are less visible at a landing page level
- Footer: single copyright line -> 4-column grid
  - Col 1: KairoFit brand + tagline
  - Col 2: Product links (functional `Link` to `/onboarding`, `/auth/login`)
  - Col 3: Company links (placeholder `<span>` - pages not built yet)
  - Col 4: Legal links (placeholder `<span>` - pages not built yet)

### UI_DESIGN.md rewrite

**Commit:** `4860a31`

Complete replacement with accurate product reference. New sections:

1. Source of Truth Disclaimer (this file is the reference, not a spec)
2. Design Principles (8 principles with rationale)
3. Color System (7 token groups, hex values, usage rules)
4. Typography (Geist Sans, size/weight scale)
5. Spacing and Radius (8px base grid table)
6. User Personas (8 archetypes, assignment logic pointer)
7. Landing Page Sections (7 sections mapped to component files)
8. Key In-App Components (6 components with UX constraints)
9. Animation Patterns (framer-motion guidance)
10. Mobile Requirements
11. Pricing Copy (current free state, future $9.99/month)
12. What Not To Build Here
13. Quality Checklist

---

## Test Results

```
Test Files  27 passed (27)
      Tests  327 passed (327)
   Duration  15.07s
```

38 tests cover all marketing components:

- HowItWorksSection: "Kiro analyzes" present, "Claude" absent, injury/sleep data mentioned
- FeaturesGrid: "Injury-aware programming" present, "Science citations" absent
- ArchetypeSection: renders, all 8 archetype names present, section headline present, no em dashes
- Export shape: all 6 marketing components export correctly

---

## Quality Checks

| Check                  | Result                                      |
| ---------------------- | ------------------------------------------- |
| `npm run typecheck`    | Clean                                       |
| `npm run lint`         | Clean                                       |
| `npm run lint:kiro`    | Clean                                       |
| `npm run format:check` | Clean (UI_DESIGN.md needed one format pass) |

---

## Key Decisions

### ArchetypeSection as Server Component

No interactivity needed - pure display. Server Component avoids sending archetype data to the client bundle unnecessarily. If hover animations are added later, the minimal interactive elements can be isolated to a child Client Component.

### "Injury-aware programming" over "Science citations"

Science citations are a layer-3 feature - visible only when a user drills into exercise research notes. Injury safety is visible at program generation (intake captures full injury history) and in exercise selection. It's a better landing page differentiator.

### Footer placeholders as spans not links

Company and Legal pages don't exist. Using `<Link href="#">` would create 404s. Using `<span>` with the same visual styling is honest about current state and avoids broken navigation. Replace with real links when pages exist.

### UI_DESIGN.md in docs/dev/plans/

Placed alongside the feature plans that reference it. Future sessions can read the design spec and the implementation plan from the same directory.

---

## Patterns Learned

### Brand leak vector: step-by-step descriptions

"Claude analyzes your intake" was buried in a How It Works step - easy to miss in review. The pattern to watch: anywhere a verb + "your intake/data/program" appears, verify the subject is Kiro not a vendor name.

### Source archetypes from constants, never hardcode

ArchetypeSection uses `Object.values(ARCHETYPES)` not a local array. When an archetype is added or renamed, the landing page updates automatically. This pattern applies to any UI that enumerates a system-defined set.

### Prettier check as final gate before commit

`npm run format:check` caught the UI_DESIGN.md formatting issue before commit. The docs directory is included in Prettier scope. Always run format:check even for markdown-only changes.

---

## Next Steps

See `docs/dev/plans/NEXT_STEPS.md` for the full Phase 11 backlog.

Top priorities post-landing:

1. Onboarding flow polish (22-screen review against FLOW.md)
2. Program generation UI (loading state, fallback UX)
3. Post-workout experience (streak animation, recovery heatmap)
4. SEO: metadata per page, OpenGraph images
5. Performance: Lighthouse audit, image optimization
