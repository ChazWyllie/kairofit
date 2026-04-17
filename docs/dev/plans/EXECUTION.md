# EXECUTION - Landing Page Showcase Redesign

> Implementation plan for rebuilding `src/app/page.tsx` + `src/app/showcase/[1-3]/page.tsx` at production polish.
> Source of truth for design: `docs/dev/plans/UI_DESIGN.md`.
> Trigger: user feedback that the current showcase reads as "skeleton work".

---

## Spec

Rebuild the KairoFit internal landing-page showcase so that each surface (the directory index and three full-page variants) is a finished, production-grade landing page rather than a sparse skeleton. The showcase is an internal design tool: stakeholders browse 3 distinct directions, click into a full preview, and pick the one that should become the public landing page. Every variant must respect `UI_DESIGN.md`'s color, type, spacing, copy, and Kiro voice rules; the three variants differ in composition and accent density, not in brand system.

### Assumptions

- Root route `/` is the internal directory (already repurposed away from the public landing). The production landing page content lives today in the marketing components (`LandingNav`, `HeroSection`, etc.); Showcase Option 1 reuses those components, Options 2-3 are self-contained files.
- The public-facing landing page (currently at `/` per UI_DESIGN.md line 146) will be re-hosted at `/landing` OR the winning showcase variant later replaces `/` post-decision. Out of scope for this plan; we do not break existing marketing components.
- "Production polish" means: dense typography hierarchy, real product UI mocks (not lorem placeholders), layered depth (gradient borders, inset highlights, soft glows), signature moments per variant, mobile-first layouts tested at 375px.
- No new dependencies. Icons via `lucide-react` (already in the tree). No Framer Motion unless a scroll-triggered moment demands it.

---

## Interfaces

### Pages (modified)

| Path                          | Status  | Purpose                                                        |
| ----------------------------- | ------- | -------------------------------------------------------------- |
| `src/app/page.tsx`            | rewrite | Showcase directory index. Header, 3 option cards, footer note. |
| `src/app/showcase/1/page.tsx` | rewrite | Option 1 - "Signal" (indigo, science-first, premium minimal).  |
| `src/app/showcase/2/page.tsx` | rewrite | Option 2 - "Edge" (orange, bold athletic, conversion-focused). |
| `src/app/showcase/3/page.tsx` | rewrite | Option 3 - "Atlas" (violet, editorial, authority tone).        |

### New components (scoped to showcase)

Colocate under `src/app/showcase/_components/` (leading underscore excludes from routing). These are Showcase-only; they do not pollute `src/components/marketing/`.

| File                     | Purpose                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| `PreviewBanner.tsx`      | Shared bottom-pinned "Option N - Name / Back to directory" chip.  |
| `ProgramPreviewMock.tsx` | Reusable in-page UI mock of a Kiro program card + set logger row. |
| `ArchetypeMarquee.tsx`   | Horizontal scroll of the 8 archetypes (reads `ARCHETYPES`).       |
| `KiroQuoteBlock.tsx`     | Inline Kiro rationale card (mono numbers, indigo eyebrow).        |
| `GradientBorderCard.tsx` | `p-px` gradient-border wrapper producing the "signature" edge.    |
| `ScienceLayerStack.tsx`  | Stacked Layer 1/2/3 transparency mock (used in Option 1).         |
| `EdgeMetricsStrip.tsx`   | Option 2 stats strip with monospace figures.                      |
| `AtlasArticleList.tsx`   | Option 3 editorial three-up article list with divide-y rules.     |

Each component accepts only primitive or small-object props; no client state except `PreviewBanner` (scroll awareness).

### Data

No DB or API changes. No new server actions. Reads from static local arrays for:

- Archetype cards -> import from `src/lib/onboarding/archetypes.ts` (existing).
- Features, metrics, testimonials, article teasers -> inline constants in each page file.
- Icons -> `lucide-react` (existing dep).

### Routes unchanged

No middleware, no RLS, no env flag. All showcase routes are public.

---

## Design System Compliance (per UI_DESIGN.md)

Every variant must ship with:

- Background chain: `#0A0A0B` root, `#111113` section alternates, `#1A1A1F` cards.
- Text: `#F5F5F4` primary, `#A1A19E` secondary, `#6B6B68` muted.
- One primary accent per variant (Signal=`#6366F1`, Edge=`#F97316`, Atlas=`#8B5CF6`). Signal MUST match the production brand accent from UI_DESIGN. Edge and Atlas are showcase-only explorations; the directory card labels them as such.
- Geist Sans for UI; Geist Mono for numbers (sets, reps, weights, metrics).
- Heading tracking `-0.025em` to `-0.04em`. Eyebrow caps `uppercase` with `0.1em` tracking.
- No em dashes anywhere. No motivational Kiro phrases.
- Min touch targets 44x44 on mobile. Hero fits above the fold at 375x812.
- Section `py-24`, max-width `max-w-6xl`, padding `px-4 sm:px-6`.
- All `motion.*` usage requires `'use client'`; hero entrance uses inline-style transitions, not Framer (per UI_DESIGN.md line 352).
- Respect `prefers-reduced-motion` on any non-trivial animation.

---

## Milestones

Each milestone is independently deployable. After each, run `npm run typecheck && npm run lint && npm run format:check` and smoke-test the route in a browser.

### Milestone A - Showcase primitives + directory index

**Deliverables:**

- Create `src/app/showcase/_components/` with `PreviewBanner.tsx`, `GradientBorderCard.tsx`, `KiroQuoteBlock.tsx`, `ProgramPreviewMock.tsx`.
- Rewrite `src/app/page.tsx` as the showcase directory:
  - Sticky frosted header with the real KairoFit wordmark treatment (KAIRO<span indigo>FIT</span>) plus "Internal" pill.
  - Opening hero strip: eyebrow "Design directory", H1 "Landing Page Options", one-sentence Kiro-voice subtitle.
  - Three option cards using `GradientBorderCard`. Each card shows: large tabular numeral `01/02/03`, option name in accent color, one-line tagline, 2-3 sentence description, tag pills, mini live preview thumbnail (240x160 tile illustrating the variant's hero via pure CSS, no image files).
  - Footer note and signature line.
- Add a radial page glow matching the winning variant's accent (indigo by default).

**Acceptance criteria:**

- `/` renders on mobile (375px) and desktop without horizontal scroll.
- No `console.log`, no em dashes, no hardcoded secrets.
- Typecheck, lint, format all green.
- Lighthouse performance >= 90 on mobile emulation (static page, trivial budget).

### Milestone B - Option 1 "Signal" (indigo, science-first)

**Deliverables:**

- Rewrite `src/app/showcase/1/page.tsx`. Reuses marketing components where they meet the polish bar; otherwise inlines richer sections.
- Composition order:
  1. `LandingNav` (existing).
  2. Hero: headline "Research-backed AI / workout programming. / Now you know why." per UI_DESIGN.md line 181, with indigo `workout programming.` emphasis, stagger entrance, background radial glow.
  3. `ScienceLayerStack`: new, denser replacement for `ScienceHookSection`. Three layer cards each with a real mock of the UI surface the layer produces (Layer 1 = under-exercise caption, Layer 2 = program rationale paragraph, Layer 3 = expandable research notes). Includes a real citation styled like `[Schoenfeld 2017]`.
  4. `HowItWorksSection` (existing).
  5. `ArchetypeMarquee`: new horizontal-scroll row of all 8 archetypes (reads from `ARCHETYPES` in `src/lib/onboarding/archetypes.ts`).
  6. `ProgramPreviewMock` in a tilted frame: real Kiro program card (Romanian Deadlift 4x8-10 @ 70%, hamstrings primary, 3 min rest) with Kiro rationale block.
  7. `FeaturesGrid` (existing).
  8. `LandingCTA` (existing).
  9. Footer.
- `PreviewBanner` pinned bottom with indigo dot.

**Acceptance criteria:**

- Section rhythm alternates `#0A0A0B` / `#111113` per UI_DESIGN.md.
- Hero visible above fold on 375x812.
- Archetype marquee is keyboard-accessible (tab through cards, focus ring visible).
- `npm run lint:kiro` passes (no em dashes, no banned phrases).
- Typecheck clean.

### Milestone C - Option 2 "Edge" (orange, athletic, conversion-focused)

**Deliverables:**

- Rewrite `src/app/showcase/2/page.tsx` as a self-contained file.
- Composition:
  1. Scroll-aware nav with KAIRO<span orange>FIT</span>.
  2. Hero with oversized `text-7xl` headline "Train with / a reason.", orange glow, grid background at 3% opacity, primary CTA `Build my program - free`. Replace the current metrics strip with `EdgeMetricsStrip` using monospace figures (`text-mono`), sub-line per metric.
  3. "Why it works" section: three features, each featuring a real UI mock (not just icon+text). E.g. "Built for real schedules" renders a mini calendar grid showing 3 selected days; "Zero guesswork" renders a set-logger mock.
  4. `ProgramPreviewMock` in orange accent variant.
  5. Conversion block: split layout, left = benefit bullets with check icons, right = an enlarged "what you get in 5 minutes" stack.
  6. Testimonials with star row, avatar monograms, 3 column desktop, horizontal snap on mobile.
  7. Final CTA card with orange radial glow.
  8. Footer.
- `PreviewBanner` in orange.

**Acceptance criteria:**

- No placeholder copy. Every metric, testimonial, and benefit bullet is specific and Kiro-voice compliant.
- Orange accent usage remains restrained (primary CTAs, metric numerals, eyebrows only). Body remains `#A1A19E`.
- All touch targets >= 44px.
- Typecheck, lint, format green.

### Milestone D - Option 3 "Atlas" (violet, editorial, authority)

**Deliverables:**

- Rewrite `src/app/showcase/3/page.tsx` as a self-contained editorial composition.
- Composition:
  1. Nav with gradient-square logo (violet -> indigo) and serif-weighted wordmark using Geist heavy weight with tight tracking.
  2. Asymmetric hero: left 60% = headline "Training with a reason" + dek paragraph + `ProgramPreviewMock` stacked below; right 40% = large sticky quote block from Kiro (KiroQuoteBlock at heading size).
  3. Principles section: four long-form principle blocks (SRA, volume landmarks, progressive overload, contraindications) laid out as a 2-col editorial with big ordinals (`I`, `II`, `III`, `IV`) in the gutter.
  4. `AtlasArticleList`: three featured articles with `divide-y border-white/5`, each row showing category eyebrow, title, 2-line excerpt, author monogram, read-time.
  5. Archetype grid (4-up) pulled from `ARCHETYPES`.
  6. CTA band: 5-column grid (stat / stat / CTA / stat / stat) with violet glow.
  7. Footer.
- `PreviewBanner` in violet.

**Acceptance criteria:**

- Editorial feel: longer line lengths (max `max-w-[640px]` for body paragraphs), generous leading (`leading-relaxed` or `leading-8` on body).
- Every article teaser is believable (real article titles tied to training science).
- Mobile layout: hero stacks vertically, quote block moves below headline.
- Typecheck, lint, format green.

### Milestone E - QA pass and handoff

**Deliverables:**

- Run the full verify chain: `npm run typecheck`, `npm run lint`, `npm run lint:kiro`, `npm run format:check`, `npm run test`.
- Playwright smoke: navigate `/`, click each option card, confirm route, take a full-page screenshot per variant into `docs/dev/plans/screenshots/`.
- Update `docs/dev/plans/TASKS.md` with a new row for the showcase rebuild (mark complete).
- Write a short delta to `docs/dev/plans/UI_DESIGN.md` under a new `## Showcase Variants` section, noting Options 2-3 are internal-only explorations and do not override the production system.

**Acceptance criteria:**

- All verify commands exit 0.
- Four PNG screenshots exist and each clearly shows a finished, dense page (not skeleton).
- `UI_DESIGN.md` updated; PR description references the screenshots.

---

## Risks

| Risk                                                                            | Likelihood | Impact              | Mitigation                                                                                                                                                               |
| ------------------------------------------------------------------------------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tailwind JIT drops unseen utilities (we saw `sm:flex` issues in prior session). | Medium     | High                | Keep all classes as string literals, avoid dynamic class composition. Confirm `npm run build` succeeds before handing off each milestone.                                |
| Option 2/3 accents (orange/violet) creep into Option 1 via shared primitives.   | Medium     | Medium              | Scope shared primitives to accept an `accent` prop; pass variant-specific values. Do not hardcode accent in `_components/`.                                              |
| Real Kiro copy drifts into motivational phrases.                                | Medium     | High (breaks brand) | Run `npm run lint:kiro` per milestone. Reuse exact copy from UI_DESIGN.md where specified.                                                                               |
| Mobile regressions at 375px (hero overflow, touch targets).                     | Medium     | High                | Every milestone must be visually checked at 375x812 in Playwright before merge.                                                                                          |
| Visual density slides back into "skeleton" feel.                                | High       | High                | Each variant must ship with at least one real UI mock (`ProgramPreviewMock` or equivalent), not just icon+text tiles. Per-section density check during milestone review. |

---

## Acceptance Criteria (overall)

- [ ] `/` is a dense, polished directory index with real per-variant preview thumbnails.
- [ ] `/showcase/1`, `/showcase/2`, `/showcase/3` each render a full, finished landing page with hero + 5+ substantive sections + footer.
- [ ] Every page contains at least one real KairoFit product UI mock (not generic placeholders).
- [ ] Color tokens match UI_DESIGN.md exactly on every surface.
- [ ] No em dashes, no banned motivational phrases, no `console.log`.
- [ ] No new dependencies installed.
- [ ] `npm run typecheck && npm run lint && npm run lint:kiro && npm run format:check && npm run test` all exit 0.
- [ ] 375px mobile layout verified for all four routes.
- [ ] `prefers-reduced-motion` respected on any entrance animation.
- [ ] Four Playwright screenshots captured in `docs/dev/plans/screenshots/`.

---

## Out of scope

- Replacing the production landing page at `/` with a winning variant. That is a separate decision + migration after the showcase is reviewed.
- Adding a fourth or fifth landing page option. Ship with exactly three.
- Internationalization, RTL support, light mode.
- Analytics events on the showcase pages (internal tool).
- New marketing copy beyond what is required to feel complete on each variant.
- Auth-gated preview of in-app surfaces (Program page, Dashboard) - we use static mocks.
- Image/photo assets. All visuals are CSS-generated to keep the bundle lean.
- Changes to `src/components/marketing/*` beyond incidental fixes required to import from Option 1.
- Backend, DB, RLS, migrations, new server actions.

---

## Execution Notes

- Order of implementation: A -> B -> C -> D -> E. B-D can be parallelized across sessions if using git worktrees (see CLAUDE.md Workflow Patterns), but each must rebase on A before merge.
- After Milestone A lands, every subsequent milestone can be demoed to the user as a standalone diff. Solicit feedback per variant; defer polish iterations until all three variants exist so comparative judgments are possible.
- When the user later requests new variants without direction, draw inspiration from current 2026 dark-theme SaaS references (Linear, Vercel, Whoop) but always filter through UI_DESIGN.md. Log distinctive patterns the user approves of in a new `docs/dev/plans/UI_PREFERENCES.md` so future generations compound.
