# Plan: Landing Page Content Improvements

_Authored: 2026-04-09. Branch: `feat/phase-10-landing-page`._
_Subsection of REMAINING_WORK.md Milestone A - detailed spec for `src/app/page.tsx` and its marketing components._

---

## Spec

`src/app/page.tsx` was built with correct design quality, color palette, and section structure. Three issues need fixing before the Phase 10 PR ships:

1. **Brand error** - `HowItWorksSection` Step 2 reads "Claude analyzes your intake" - users see Kiro, not Claude. This leaks the underlying model name.
2. **Missing key differentiators** - The archetype system (8 personality types, emotional peak at onboarding screen 15) is completely absent from the landing page. Injury-aware programming - a core FitBod gap KairoFit exploits - is also unmentioned.
3. **Shallow intake description** - `HowItWorksSection` Step 1 lists 4 data dimensions when the actual onboarding collects 8 (injuries, sleep, body comp, and lifestyle are missing).

No section redesign needed. Targeted copy corrections + one new section + one tile swap.

---

## Interfaces

No API routes, database changes, or new pages. Changes confined to:

| File                                                    | Change type                                    |
| ------------------------------------------------------- | ---------------------------------------------- |
| `src/app/page.tsx`                                      | Metadata, new section import, footer expansion |
| `src/components/marketing/HowItWorksSection.tsx`        | Copy corrections                               |
| `src/components/marketing/FeaturesGrid.tsx`             | Swap tile 6                                    |
| `src/components/marketing/ArchetypeSection.tsx`         | New component                                  |
| `src/components/marketing/__tests__/marketing.test.tsx` | Test coverage for above                        |

---

## Milestones

### Milestone A: Brand + copy corrections

**Deliverables:**

`HowItWorksSection.tsx` Step 1 description - before:

```
Answer questions about your experience level, available equipment, schedule, and goals. Kiro uses this to calibrate volume, intensity, and split selection - not to generate a template.
```

Step 1 description - after:

```
Answer 22 focused questions covering experience level, equipment, schedule, goals, injury history, sleep quality, body composition, and work schedule. Kiro uses this to calibrate volume, intensity, and split selection - not to generate a template.
```

`HowItWorksSection.tsx` Step 2 description - before: `"Claude analyzes your intake..."`
Step 2 description - after: `"Kiro analyzes your intake..."`

New tests in the existing `HowItWorksSection` describe block:

```typescript
it('references Kiro, not Claude, for program analysis', () => {
  const json = JSON.stringify(HowItWorksSection())
  expect(json).toContain('Kiro analyzes your intake')
  expect(json).not.toContain('Claude analyzes')
})

it('mentions injury and sleep data collection', () => {
  const json = JSON.stringify(HowItWorksSection())
  expect(json).toContain('injury')
  expect(json).toContain('sleep')
})
```

**Acceptance criteria:**

- [ ] "Claude analyzes" is gone from `HowItWorksSection`
- [ ] "Kiro analyzes your intake" appears in Step 2
- [ ] Step 1 mentions injury history, sleep, body composition, work schedule
- [ ] No em dashes introduced
- [ ] `npm test` passes

---

### Milestone B: Archetype section

**Deliverables:**

New `src/components/marketing/ArchetypeSection.tsx`:

- Server Component (no `'use client'`)
- Import: `import { ARCHETYPES } from '@/lib/onboarding/archetypes'`
- Iterate with `Object.values(ARCHETYPES)` - no hardcoded list
- Each card: emoji, name (`text-[#F5F5F4]` bold), headline (`text-sm text-[#A1A19E]`)
- Card style: `rounded-2xl border border-white/5 bg-[#1A1A1F] p-6 transition-colors hover:border-white/10`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (8 archetypes = 2 rows x 4 cols on desktop)
- Section label: `"Personality-matched training"` in `text-[#6366F1]`
- H2: `"Your archetype, your program"`
- Description: `"Not everyone responds to the same motivation style. Kiro identifies your training psychology and tailors program emphasis, science depth, and feedback style to match how you actually work."`

`src/app/page.tsx` changes:

- Import `ArchetypeSection`
- Insert `<ArchetypeSection />` between `<HowItWorksSection />` and `<FeaturesGrid />`
- Update section comment block in the file header
- Update metadata description: `'Kiro identifies your training archetype and builds your program from exercise science. Personality-matched training. Every set has a reason. Free during beta.'`

New tests in `marketing.test.tsx`:

```typescript
// In 'marketing component exports' describe:
it('exports ArchetypeSection as a function', () => {
  expect(typeof ArchetypeSection).toBe('function')
})

// New describe block:
describe('ArchetypeSection', () => {
  it('renders without throwing', () => {
    expect(() => ArchetypeSection()).not.toThrow()
  })

  it('contains all eight archetype names', () => {
    const json = JSON.stringify(ArchetypeSection())
    expect(json).toContain('The System Builder')
    expect(json).toContain('The Milestone Chaser')
    expect(json).toContain('The Explorer')
    expect(json).toContain('The Pragmatist')
    expect(json).toContain('The Comeback Kid')
    expect(json).toContain('The Optimizer')
    expect(json).toContain('The Challenger')
    expect(json).toContain('The Understander')
  })

  it('contains the section headline', () => {
    const json = JSON.stringify(ArchetypeSection())
    expect(json).toContain('Your archetype, your program')
  })

  it('contains no em dashes', () => {
    const json = JSON.stringify(ArchetypeSection())
    expect(json).not.toContain('\u2014')
  })
})
```

**Acceptance criteria:**

- [ ] `ArchetypeSection.tsx` exists, sources data from `ARCHETYPES`
- [ ] All 8 archetypes render (emoji + name + headline)
- [ ] Responsive: 1 col mobile, 2 col tablet, 4 col desktop
- [ ] Section appears between HowItWorks and FeaturesGrid
- [ ] `REMAINING_WORK.md` Milestone A acceptance criteria updated from "6 landing sections" to "7 landing sections"
- [ ] `npm test` passes

---

### Milestone C: Feature tile swap + footer

**Deliverables:**

`FeaturesGrid.tsx` icon imports - before:

```typescript
import { Brain, Activity, WifiOff, TrendingUp, BarChart2, FlaskConical } from 'lucide-react'
```

After:

```typescript
import { Brain, Activity, WifiOff, TrendingUp, BarChart2, ShieldAlert } from 'lucide-react'
```

Tile 6 - before: `"Science citations"` tile (redundant - ScienceHookSection covers this in detail)
Tile 6 - after:

```typescript
{
  icon: <ShieldAlert className="h-5 w-5 text-[#EF4444]" />,
  title: 'Injury-aware programming',
  description: 'Your intake includes your full injury history. Kiro flags contraindicated movements and adapts exercise selection to keep you training safely while making progress.',
}
```

Note: `#EF4444` (red) per design system - "Red (#EF4444) for injury flags" defined in CLAUDE.md.

Footer in `page.tsx` - replace single-line copyright with multi-column layout:

- 4 columns on desktop (`lg:grid-cols-4`), 2 on tablet (`sm:grid-cols-2`), 1 on mobile
- Columns: KairoFit brand | Product (Get started, Sign in - functional `Link` elements) | Company (About, Blog - `span` placeholders) | Legal (Privacy, Terms - `span` placeholders)
- Bottom row: copyright line
- Requires `import Link from 'next/link'` in `page.tsx`

Test updates in `FeaturesGrid` describe:

```typescript
it('contains all six feature titles', () => {
  // replace 'Science citations' with 'Injury-aware programming'
  expect(json).toContain('Injury-aware programming')
})

it('does not contain Science citations tile', () => {
  expect(json).not.toContain('Science citations')
})
```

**Acceptance criteria:**

- [ ] FeaturesGrid tile 6 is "Injury-aware programming" with red `ShieldAlert` icon
- [ ] `FlaskConical` import removed
- [ ] Footer is multi-column; Product links are functional; Company/Legal use `span`
- [ ] `npm test` passes

---

## Risks

| Risk                                                  | Likelihood | Impact | Mitigation                                                           |
| ----------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------- |
| `ShieldAlert` not in installed lucide-react version   | Low        | Low    | Check `node_modules/lucide-react`; fallback to `Shield`              |
| ArchetypeSection breaks if `ARCHETYPES` shape changes | Low        | Medium | Reads only `name`, `emoji`, `headline` - stable fields per CLAUDE.md |
| `Link` import missing in `page.tsx` for footer        | Low        | Low    | Check existing imports at top of file before adding                  |

---

## Acceptance Criteria (complete)

- [ ] `npm test` passes with zero failures
- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] `npm run lint:kiro` clean (no em dashes, no banned phrases in new copy)
- [ ] `npm run format:check` clean
- [ ] Landing page at `/` renders 7 sections in order: Nav, Hero, ScienceHook, HowItWorks, Archetypes, Features, CTA, Footer
- [ ] All 8 archetype cards visible (emoji + name + headline)
- [ ] HowItWorksSection Step 2 reads "Kiro analyzes", not "Claude analyzes"
- [ ] FeaturesGrid shows "Injury-aware programming", not "Science citations"
- [ ] Footer is 4-column on desktop with functional Product links

## Out of scope

- Redesigning existing Hero, ScienceHook, LandingCTA, or LandingNav sections
- Adding About, Blog, Privacy, Terms pages (footer links are placeholders)
- New animations or interactive elements
- Any backend, database, or API changes
