# KairoFit Marketing Site Redesign — Specification

Status: DRAFT, awaiting user approval before any Stage 2 implementation.
Source of truth: [`redesign.md`](../../../redesign.md).
Governing execution plan: `/Users/chazwyllie/.claude/plans/starry-juggling-forest.md`.
Branch: `feat/redesign-spec`.

This document satisfies the Phase 1 Stage 1 alignment gate. It captures every decision the
redesign turns on so Stage 2 can execute without ambiguity. No production code is written
until the user approves this spec.

---

## Spec

We are shipping a production-ready marketing surface for KairoFit at `/`, `/science`,
`/founder`, `/tour`, `/waitlist/thank-you`, `/legal/terms`, `/legal/privacy`, plus a
bespoke `not-found`. The redesign is a ground-up token-first rebuild, not a polish pass.
Credibility is the primary buyer: the site must feel like a research-backed tool, not a
typical fitness app landing page. Priority order from `redesign.md` §12: \*\*credibility > aesthetic

> SEO > conversion\*\*. The single systemic blocker is that `tailwind.config.ts` ships an
> empty `theme.extend`, so every page leans on hardcoded arbitrary values (`text-[#F5F5F4]`,
> `text-[48px]`, `bg-[#111113]`). Fixing that unlocks consistent type scale, responsive audit,
> accessibility tuning, and future maintainability in one move.

Assumption: the current 7-page IA, 20-component inventory, and copy in
`src/app/(marketing)/_content.ts` are directionally correct and stay. Structural rework is
scoped to (a) mirroring `_tokens.ts` into Tailwind, (b) eliminating hardcoded arbitrary
values site-wide, (c) enforcing accent-usage rules, (d) responsive audit at 375/768/1024/1440,
(e) accessibility hardening, and (f) hardening the waitlist flow end-to-end.

---

## Section 1 — Design direction and mood

### Palette (reaffirmed from redesign.md §3)

| Token           | Hex                     | Usage                                                         |
| --------------- | ----------------------- | ------------------------------------------------------------- |
| `bg`            | `#0A0A0B`               | Page background                                               |
| `bgElevated`    | `#111113`               | Cards, form surfaces                                          |
| `bgSubtle`      | `#17171A`               | Inline surfaces inside cards (Kiro chat bubbles, code panels) |
| `border`        | `#1F1F23`               | Default dividers, card borders                                |
| `borderStrong`  | `#2A2A2F`               | Elevated surface borders, CTA outlines                        |
| `textPrimary`   | `#F5F5F4`               | Headlines, body                                               |
| `textSecondary` | `#A1A19E`               | Supporting copy                                               |
| `textMuted`     | `#6B6B68`               | Eyebrow labels, metadata                                      |
| `accent`        | `#CAFF4C`               | One punch per section (see accent rules)                      |
| `accentMuted`   | `rgba(202,255,76,0.15)` | Glow fills, badge backgrounds                                 |
| `accentOn`      | `#0A0A0B`               | Foreground color on accent fills                              |
| `success`       | `#10B981`               | Rare, reserved for waitlist success confirmation              |
| `danger`        | `#EF4444`               | Form errors, rate-limit messages                              |

### Benchmarks — what we borrow

| Site          | What we borrow                                                                              | Where it shows up                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Linear        | Typographic restraint — giant display weights, zero decorative effects, generous whitespace | Hero H1, section headers, `display-xl` treatment                                        |
| Vercel        | Metric cards and pristine grid system                                                       | Hero Stat trio, Science Foundation cards                                                |
| Whoop         | Data-dense mono numeric labels + minimal color on near-black                                | Eyebrow labels, `mono-stat` components, floating cards                                  |
| Apple Fitness | Lifestyle-grade photography treatment, warm composition                                     | Founder section portrait treatment, OG imagery                                          |
| Nike SNKRS    | Drop cadence energy in a single accent punch                                                | Accent usage rules: headline hits + primary CTA + streak pill, never washed backgrounds |

### Motion language

- Framer Motion drives element-level motion (reveals, hover tilts, floating cards on hero).
- GSAP + ScrollTrigger only drives pinned scrollytelling. Already used in
  `AdaptationPillars.tsx`. Stage 2 keeps this; it does not add GSAP elsewhere.
- All motion respects `useReducedMotion()`. If a user prefers reduced motion, we skip:
  intro reveal blur, hero marquee scroll, floating card drifts, Framer `whileInView`
  opacity/translate animations, GSAP pinning. Layout stays identical.
- No parallax on body copy, no marquee that blocks keyboard focus, no autoplay video.

### Aesthetic guardrails (non-negotiable)

1. Dark mode only. No light theme toggle. Ever.
2. No gradients except the two spec-approved ones: hero radial accent glow, Adaptation
   Pillars radial glow behind phone mock.
3. No em dashes (`--`). `lint:kiro` enforces.
4. One accent punch per section, placed deliberately.
5. No rounded-2xl orphans. Radius scale is fixed (see Section 2).
6. No drop shadows on text. Shadows on surfaces only.
7. No icon-only CTAs in the marketing shell. Every CTA has a text label.

---

## Section 2 — Design token foundation

### Target: `tailwind.config.ts` `theme.extend`

The Phase 1 critical-path change. We mirror `src/app/(marketing)/_tokens.ts` and the
`redesign.md` §3 scale into Tailwind so every component can use class tokens instead of
arbitrary values. Namespace marketing tokens under `marketing.*` to keep them isolated from
the internal `(app)/` palette (indigo/orange).

#### Colors (under `theme.extend.colors.marketing`)

```
marketing: {
  bg: '#0A0A0B',
  bgElevated: '#111113',
  bgSubtle: '#17171A',
  border: '#1F1F23',
  borderStrong: '#2A2A2F',
  textPrimary: '#F5F5F4',
  textSecondary: '#A1A19E',
  textMuted: '#6B6B68',
  accent: '#CAFF4C',
  accentMuted: 'rgba(202,255,76,0.15)',
  accentOn: '#0A0A0B',
  success: '#10B981',
  danger: '#EF4444',
}
```

#### Font families (under `theme.extend.fontFamily`)

```
sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
```

`src/app/layout.tsx` already loads Geist Sans + Geist Mono via `next/font`. Stage 2 wires
the CSS variables into the Tailwind config.

#### Font sizes (under `theme.extend.fontSize`, tuple form)

```
'display-xl':  ['72px',  { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '600' }],
'display-lg':  ['56px',  { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
'display-md':  ['40px',  { lineHeight: '1.10', letterSpacing: '-0.02em', fontWeight: '600' }],
'heading':     ['24px',  { lineHeight: '1.30', letterSpacing: '-0.01em', fontWeight: '600' }],
'body-lg':     ['18px',  { lineHeight: '1.50' }],
'body':        ['16px',  { lineHeight: '1.60' }],
'small':       ['14px',  { lineHeight: '1.50' }],
'mono-stat':   ['48px',  { lineHeight: '1',    letterSpacing: '-0.02em', fontWeight: '500' }],
'mono-label':  ['12px',  { lineHeight: '1.40', letterSpacing: '0.08em',  fontWeight: '500' }],
```

Mobile responsive behavior: `display-xl` drops to 52px on sub-sm viewports, `display-lg` to
44px, `display-md` to 32px. Implemented via responsive utility classes
(`text-[40px] sm:text-[56px]` → `text-display-md sm:text-display-lg`). These mobile variants
ship as additional `fontSize` entries named `display-xl-mobile`, `display-lg-mobile`,
`display-md-mobile`.

#### Spacing (additions under `theme.extend.spacing`)

```
'section-y-desktop': '160px',
'section-y-mobile': '96px',
'container-max': '1280px',
'grid-gutter': '32px',
```

Combined with standard 4pt Tailwind spacing. `max-w-[1280px]` becomes `max-w-container`.

#### Border radius (under `theme.extend.borderRadius`)

```
'xs': '8px',
'sm': '12px',
'md': '16px',
'lg': '24px',
'xl': '32px',
'pill': '9999px',
```

Usage: pill for buttons and eyebrow chips; lg for cards; xl for framed hero/founder
photos; md for interior surfaces; sm for form inputs.

#### Box shadow (under `theme.extend.boxShadow`)

```
'accent-glow-sm': '0 0 24px rgba(202,255,76,0.15)',
'accent-glow': '0 0 44px rgba(202,255,76,0.25)',
'surface': '0 24px 80px -48px rgba(0,0,0,0.9)',
```

### Secondary: `src/app/globals.css`

Import tokens as CSS custom properties so non-Tailwind contexts (structured content, OG
image generation, SVG fills) can reference them. Mirror the same color names.

### Secondary: `src/app/(marketing)/_tokens.ts`

Keep `marketingTokens` export as the TypeScript-facing source (used by
`MarketingOgImage.tsx`). Add a runtime assertion in a unit test that TS token values match
the Tailwind config so drift is caught. Remove `marketingClassNames.section` and `.reading`
helpers in favor of direct class tokens.

---

## Section 3 — Component inventory

Status legend: `keep` = already aligned, `migrate` = token-migration only (structure ok),
`rework` = structural change required, `new` = build new, `remove` = delete.

| Component                                 | File                                               | Status        | Notes                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | -------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SiteHeader`                              | `_components/SiteHeader.tsx`                       | migrate       | Token migration only. Keep mobile toggle + tracked links.                                                                                                                                                                                                                                                           |
| `SiteFooter`                              | `_components/SiteFooter.tsx`                       | rework        | Current `border-t-2 border-[#CAFF4C]` violates §3 "accent never as full-section edge". Replace with `border-t border-marketing-border` + optional `accent-glow-sm` decoration over the logo block only.                                                                                                             |
| `Button`                                  | `_components/Button.tsx`                           | migrate       | 3 variants stay. Focus ring uses `ring-marketing-accent`. Min target 44x44 confirmed.                                                                                                                                                                                                                               |
| `Card`                                    | `_components/Card.tsx`                             | migrate       | Unify radius to `rounded-lg`. Remove per-instance `border-[#1F1F23]` in favor of `border-marketing-border`.                                                                                                                                                                                                         |
| `Eyebrow`                                 | `_components/Eyebrow.tsx`                          | migrate       | Use `text-mono-label text-marketing-textMuted`.                                                                                                                                                                                                                                                                     |
| `SectionHeader` + `AccentText`            | `_components/SectionHeader.tsx`                    | migrate       | Consolidate: enforce one `AccentText` per header max. Default uses `display-lg`; prop for `display-md` in tighter sections.                                                                                                                                                                                         |
| `AccentText`                              | (in SectionHeader)                                 | migrate       | Style: `text-marketing-accent`, no background.                                                                                                                                                                                                                                                                      |
| `Stat`                                    | `_components/Stat.tsx`                             | migrate       | Use `text-mono-stat` for value, `text-small text-marketing-textSecondary` for label.                                                                                                                                                                                                                                |
| `Marquee`                                 | `_components/Marquee.tsx`                          | migrate       | Pause on focus/hover. Respect reduced motion (already done — verify). Delimit items with accent dots.                                                                                                                                                                                                               |
| `ProblemChart`                            | `_components/ProblemChart.tsx`                     | migrate       | SVG colors from tokens. Ensure AA contrast on axis labels.                                                                                                                                                                                                                                                          |
| `ComparisonTable`                         | `_components/ComparisonTable.tsx`                  | migrate       | Mobile stacks into alternating cards. Use `bgSubtle` for the KairoFit column, subtle border for FitBod.                                                                                                                                                                                                             |
| `ProductScreens` + `PhoneFrame`           | `_components/ProductScreens.tsx`, `PhoneFrame.tsx` | migrate       | Keep the 4 screen variants. Token migration only.                                                                                                                                                                                                                                                                   |
| `HeroProductComposition`                  | `_components/HeroProductComposition.tsx`           | migrate       | Already correct structurally. Token migration. Add `aria-live="polite"` on the screen change so SR users hear the active screen name.                                                                                                                                                                               |
| `AdaptationPillars`                       | `_components/AdaptationPillars.tsx`                | migrate       | Correction from prior-plan: this already uses GSAP ScrollTrigger with `pin` and per-pillar `onEnter`/`onEnterBack`. No structural rework. Token migration only.                                                                                                                                                     |
| `WaitlistForm`                            | `_components/WaitlistForm.tsx`                     | keep + harden | Keep `useAction` from `next-safe-action/hooks` (exposes `isExecuting`, `result.serverError`, `onSuccess`). Additions: `aria-live="polite"` error region, `autoComplete="email"`, client-side Zod pre-check to avoid a round-trip on malformed input, honeypot field for bot defense, explicit rate-limit messaging. |
| `TrackedLink`                             | `_components/TrackedLink.tsx`                      | migrate       | Already correct. Token migration if any literals.                                                                                                                                                                                                                                                                   |
| `MarketingAnalytics`                      | `_components/MarketingAnalytics.tsx`               | keep          | Event dispatch helper. No visual output.                                                                                                                                                                                                                                                                            |
| `MarketingOgImage`                        | `_components/MarketingOgImage.tsx`                 | migrate       | Reads from `marketingTokens`. Verify it still renders after token centralization.                                                                                                                                                                                                                                   |
| `AccentText` (separate file if extracted) | —                                                  | n/a           | Already inside SectionHeader.                                                                                                                                                                                                                                                                                       |
| **NEW** `MarketingShell`                  | `_components/MarketingShell.tsx`                   | new           | Wraps `<SiteHeader>`, `<main>`, `<SiteFooter>`. Replaces per-page repetition and guarantees semantic landmarks + skip link.                                                                                                                                                                                         |
| **NEW** `SkipToContent`                   | `_components/SkipToContent.tsx`                    | new           | Visually hidden focus-revealed skip link. WCAG 2.4.1.                                                                                                                                                                                                                                                               |
| **NEW** `Reveal`                          | `_components/Reveal.tsx`                           | new           | Framer Motion primitive for in-view fade+translate reveals. Respects reduced motion. Replaces scattered `whileInView` props.                                                                                                                                                                                        |

### Hook pattern decision

Keep `useAction` from `next-safe-action/hooks` in `WaitlistForm`. It is strictly superior
to raw `useActionState` for this flow because it surfaces `isExecuting`, typed
`result.serverError`, typed `result.data`, and `onSuccess`/`onError` callbacks — all of
which the form uses today. This matches the repo-wide v7 pattern documented in
`skills/server-action-builder/SKILL.md`.

---

## Section 4 — Page-by-page wireframes

Each page gets the same `MarketingShell` wrapping and skip link. Sections below describe
content order, typography scale, and CTA placement. Exact copy is already finalized in
`_content.ts`.

### `/` (home)

Ten sections, in order:

1. **Hero** — `display-xl` H1 with one `AccentText` punch, `body-lg` sub, primary + secondary
   CTAs, Stat trio, `HeroProductComposition` right column at `lg:` and above. Radial accent
   glow at bottom only. No hero image swap, no carousel.
2. **Marquee** — single-line `Marquee` under hero, `border-y border-marketing-border`,
   paused on hover/focus and when reduced motion is set.
3. **Problem** — two-column section: `SectionHeader` + body copy left, `ProblemChart` right.
4. **Adaptation Pillars** — full-width section, GSAP-pinned phone mock on the left,
   four `<motion.article>` pillars scrolling on the right (already implemented).
5. **Kiro Voice** — centered `Card` containing three `kiroExamples` conversations. Secondary
   CTA linking to `/science`.
6. **Science Foundation** — three-column grid of `Card` components on `lg:`, one-column
   stack below. Secondary CTA linking to `/science`.
7. **Comparison** — `ComparisonTable` of six `comparisonRows`. FitBod column muted,
   KairoFit column on `bgSubtle`.
8. **Founder** — two-column section: portrait image left (grayscale + accent border),
   `SectionHeader` + body + credential chips + secondary CTA right.
9. **Waitlist** — centered `SectionHeader` + `WaitlistForm` wrapped in `rounded-xl` card.
   ID `#waitlist` (existing anchor target from hero CTA). Success state redirects to
   `/waitlist/thank-you`.
10. **Footer** — `SiteFooter`, three-column grid, accent-muted logo block decoration only.

Mobile reorder (sub-`lg`):

- Hero: headline → sub → CTAs → Stats → `HeroProductComposition` below.
- Problem: copy → `ProblemChart` below.
- Adaptation Pillars: pillars only, GSAP pin disabled, `ProductScreen` inline per pillar.
- Founder: headline → portrait → body → credentials → CTA.

### `/science`

Long-form article layout. Max width 720px for body copy.

1. Shell header.
2. Eyebrow + `display-lg` H1 + deck.
3. Table of contents (sticky on `lg:`) linking to each `sciencePageSections` anchor.
4. Seven sections, each with `mono-label` citation, `heading` subhead, body, anchor id.
5. Secondary CTA back to `/#waitlist`.
6. Footer.

### `/founder`

1. Shell header.
2. Portrait + credentials + eyebrow + headline.
3. Three body sections: the observation, the problem, the system.
4. Signature/credentials strip.
5. CTA to `/` waitlist anchor.
6. Footer.

### `/tour`

Pinned scrollytelling companion to the homepage Adaptation Pillars.

1. Shell header.
2. Eyebrow + headline + deck.
3. Seven `tourSteps` rendered as a vertical scroll-sync list with a sticky `ProductScreen`
   on the right at `lg:`. Each step uses `mono-label` eyebrow, `display-md` title, body.
   Mobile flattens to stacked cards.
4. CTA to `/#waitlist`.
5. Footer.

### `/waitlist/thank-you`

1. Shell header.
2. Centered success state: accent badge, `display-md` headline, `body-lg` sub, three next-steps
   as `mono-label`-headed items.
3. CTA back to `/`.
4. Footer.

### `/legal/terms` and `/legal/privacy`

Shared `LegalLayout` component (extract as needed — can live inside `MarketingShell`).

1. Shell header.
2. Eyebrow + `display-md` H1 + last-updated date.
3. Markdown-style content using `heading` for H2 and `body` for copy.
4. Footer.

### `/not-found`

1. Shell header.
2. Centered display-lg "404" headline, `body-lg` sub, CTA home.
3. Footer.

---

## Section 5 — Responsive strategy

Four target viewports audited per page: **375 (iPhone SE/13 mini), 768 (iPad portrait),
1024 (iPad landscape / small laptop), 1440 (standard desktop)**.

### Global rules

- Container: `max-w-container` (1280px) with `px-6 md:px-8 lg:px-10`.
- Section vertical padding: `py-24 lg:py-40` (96px / 160px).
- Grid: 12-column on `lg:+`, single column below `md`, two-column on `md` for comparison
  and founder-style sections.
- Type scale responsive ramps (see Section 2).
- No horizontal scroll at any viewport. Overflow audit runs per page.

### Per-page breakpoint notes

**Home**

| Viewport | Behavior                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 375      | Hero stack: H1 at 52px, sub, CTAs full-width stacked, Stats 1-col, product comp below. Marquee single-row. Pillars one-col stacked, GSAP pin disabled. Comparison as alternating cards. Founder: image above copy. |
| 768      | Hero still stacked, Stats 3-col. Science cards 1-col → 2-col at 768. Comparison is 2-col table. Founder image + copy stack.                                                                                        |
| 1024     | Hero adopts `lg:` two-column; pillars adopt pinned right-side scrollytelling. Science cards 3-col. Comparison 2-col table with wider gutter.                                                                       |
| 1440     | Full layout, container centered, section padding at desktop max.                                                                                                                                                   |

**/science**

| Viewport | Behavior                                                            |
| -------- | ------------------------------------------------------------------- |
| 375      | Single column article, TOC collapses into a `<details>` at the top. |
| 768      | Article stays centered, body 640px max.                             |
| 1024     | TOC sticky left rail, article body centered.                        |
| 1440     | Same as 1024 with wider gutters.                                    |

**/founder, /tour, /waitlist/thank-you, /legal/\***: single responsive linear flow, no
complex grid reshuffle. Tour's scrollytelling pins right-column product screen at `lg:+`
only.

### Components that change behavior by breakpoint

- `HeroProductComposition` floating badges only render at `lg:` and `xl:` (already gated).
- `AdaptationPillars` GSAP `ScrollTrigger.create({ pin })` only activates on `lg:+`. Use
  a matchMedia guard.
- `Marquee` truncates item count on 375 if overflow risks appear.
- `SiteHeader` mobile toggle active under `md:`.

---

## Section 6 — Accessibility checklist

### Landmarks and structure

- `MarketingShell` renders `<header>`, `<main>`, `<footer>` once per route.
- Skip link targets `<main id="main-content" tabindex="-1">`.
- Every page has exactly one `<h1>`.
- Section order follows the visual order in the DOM.

### Contrast (WCAG AA minimum)

Manual audit required for each pair. Spec-stage assumptions:

| Foreground | Background | Ratio (expected) | WCAG                         |
| ---------- | ---------- | ---------------- | ---------------------------- |
| `#F5F5F4`  | `#0A0A0B`  | ~19:1            | AAA all sizes                |
| `#F5F5F4`  | `#111113`  | ~17:1            | AAA all sizes                |
| `#A1A19E`  | `#0A0A0B`  | ~7.5:1           | AAA body                     |
| `#A1A19E`  | `#111113`  | ~6.8:1           | AA body                      |
| `#6B6B68`  | `#0A0A0B`  | ~4.8:1           | AA large text only           |
| `#CAFF4C`  | `#0A0A0B`  | ~14:1            | AAA all sizes                |
| `#0A0A0B`  | `#CAFF4C`  | ~14:1            | AAA (used on primary button) |

Stage 2 runs axe on every route and fixes anything short of AA body. `#6B6B68` is only
allowed for `mono-label` eyebrows (12px uppercase tracking) and metadata chips, never for
body copy. If any body copy uses `#6B6B68`, promote to `#A1A19E`.

### Keyboard

- All interactive elements reachable by Tab in visual order.
- Visible focus ring on every interactive: `focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg`.
- Mobile nav toggle receives focus when opened; Escape closes it.
- Marquee does not scroll focus; it is purely decorative with `aria-hidden="true"`.
- Sticky TOC on `/science` keyboard-navigable with focus highlighting the active anchor.

### Motion

- `useReducedMotion()` short-circuits all Framer animations.
- GSAP ScrollTrigger pinning disabled under reduced motion (verified in `AdaptationPillars`
  already; extend pattern to any future GSAP usage).
- No animation on form error surfaces — they appear immediately.
- Hero marquee pauses and ceases animation under reduced motion.

### Forms

- `WaitlistForm` email input: `type="email"`, `autoComplete="email"`, `required`,
  `aria-invalid` on error, `aria-describedby` pointing to an `aria-live="polite"` error
  region.
- Submit button announces loading state via `aria-busy="true"`.
- Success redirect does not rely solely on visual change; `/waitlist/thank-you` renders a
  screen-reader-accessible confirmation heading.
- Honeypot field is `aria-hidden` + `tabindex="-1"` + visually hidden, not disabled.

### Images

- Founder portrait `alt="Chaz Wyllie, founder of KairoFit"`.
- `ProductScreen` decorative illustrations use `aria-hidden="true"` so the screen change
  narration is driven by the announced screen name next to them.
- OG images are not announced by SR (they are meta).

---

## Section 7 — SEO and structured data

### Per-route metadata

Each page exports `generateMetadata` (or the `metadata` const) with:

- `title` — unique, under 60 chars.
- `description` — unique, 150–160 chars.
- `openGraph` — title, description, image (from per-route `opengraph-image.tsx`), URL
  canonical.
- `twitter` — card summary-large-image.
- `alternates.canonical` — absolute URL including `https://kairofit.com`.

### Target queries

From `redesign.md` §8.6: "AI workout app", "adaptive fitness app", "research-based workout
app", "fitness app with AI coach", "FitBod alternative", "fitness app that adapts to
injuries".

### Structured data (JSON-LD)

| Route                 | Schema type                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `/`                   | `SoftwareApplication` (already in place)                                                            |
| `/science`            | `Article` with `author: { @type: Organization, name: "KairoFit" }`, `datePublished`, `dateModified` |
| `/founder`            | `Person` with name, jobTitle "Founder of KairoFit", sameAs Instagram + email link                   |
| `/tour`               | `HowTo` with 7 step entries from `tourSteps`                                                        |
| `/waitlist/thank-you` | `WebPage`                                                                                           |
| `/legal/*`            | `WebPage` with `isPartOf` linking to WebSite                                                        |

A shared `StructuredData.tsx` helper renders the `<script type="application/ld+json">` tag
from a typed input. Stage 2 builds this helper.

### `robots.ts` and `sitemap.ts`

Sitemap includes every route above with `changefreq` appropriate to the page (weekly for
home/tour/science, monthly for founder/legal/thank-you). Robots allows all public routes,
disallows `/api/`, `/waitlist/thank-you` indexable (for sharing), `(app)/` and `(auth)/`
do not exist in this build so are irrelevant.

---

## Interfaces

Stage 2 changes or adds the following. No API routes change; the waitlist server action
already exists and is kept.

### Config files

- `tailwind.config.ts` — populate `theme.extend` per Section 2.
- `src/app/globals.css` — export CSS custom properties mirroring Tailwind tokens.

### Components — modified

- `src/app/(marketing)/_components/SiteFooter.tsx` — remove accent top border; see Section 3.
- `src/app/(marketing)/_components/WaitlistForm.tsx` — honeypot, aria-live error region,
  autoComplete, client-side Zod pre-check.
- `src/app/(marketing)/_components/Button.tsx` — focus ring token migration.
- All other `_components/*` — token migration only.

### Components — new

- `src/app/(marketing)/_components/MarketingShell.tsx`
  - Props: `{ children: React.ReactNode; hideFooter?: boolean }`
  - Renders skip link, `<SiteHeader>`, `<main id="main-content" tabIndex={-1}>`, `<SiteFooter>`.
- `src/app/(marketing)/_components/SkipToContent.tsx`
  - No props.
  - Anchor visually hidden, focus-revealed, targeting `#main-content`.
- `src/app/(marketing)/_components/Reveal.tsx`
  - Props: `{ children: React.ReactNode; delay?: number; y?: number; once?: boolean }`
  - Wraps Framer `motion.div` with reduced-motion bail-out.
- `src/app/(marketing)/_components/StructuredData.tsx`
  - Props: `{ data: Record<string, unknown> }`
  - Renders `<script type="application/ld+json">`.

### Pages — modified

- `src/app/(marketing)/page.tsx` — wrap in `MarketingShell`, token migration.
- `src/app/(marketing)/science/page.tsx` — add sticky TOC, structured data.
- `src/app/(marketing)/founder/page.tsx` — structured data.
- `src/app/(marketing)/tour/page.tsx` — pinned scrollytelling at `lg:+`.
- `src/app/(marketing)/waitlist/thank-you/page.tsx` — SR-accessible confirmation.
- `src/app/(marketing)/legal/terms/page.tsx` — shared legal layout pattern.
- `src/app/(marketing)/legal/privacy/page.tsx` — shared legal layout pattern.
- `src/app/not-found.tsx` — rebuild using `MarketingShell`.

### Server actions

No new actions. `src/actions/waitlist.actions.ts` already uses `unauthAction` +
`waitlistJoinSchema` + rate limit + PostHog `after()`. Stage 2 verifies and adds:

- Explicit test for rate-limit messaging surfaced to the client.
- Confirm honeypot field rejection path (action-level, not just client).

### Database

No migrations. `supabase/migrations/005_marketing_waitlist.sql` already ships waitlist
with anon INSERT RLS `WITH CHECK`. Stage 2 verifies only.

### Events

Existing PostHog events stay: `WAITLIST_PAGE_VIEWED`, `WAITLIST_CTA_CLICKED`,
`WAITLIST_SUBMITTED`, `WAITLIST_FAILED`, `SCIENCE_LINK_CLICKED`, `FOUNDER_LINK_CLICKED`,
`TOUR_LINK_CLICKED`, `INSTAGRAM_CLICKED`. No new events.

### E2E

- `e2e/marketing-site.spec.ts` expanded to:
  - Each route returns 200 and exposes exactly one `<h1>` with expected text.
  - Tab order audit: skip link first, header links, CTAs, form field, footer.
  - Waitlist happy path: valid email → redirect to `/waitlist/thank-you`.
  - Waitlist invalid email: inline error announced via `aria-live` region.
  - Waitlist rate limit: sixth submission in a minute surfaces rate-limit copy.
  - Reduced-motion emulation: hero marquee has no scroll transform; AdaptationPillars has
    no pin.
  - Viewports 375 / 768 / 1024 / 1440: zero horizontal overflow on any page.

---

## Milestones

Five atomic milestones. Each is independently reviewable and CI-verifiable.

### Milestone A — Token foundation (no visual regressions)

Deliverables:

- `tailwind.config.ts` populated per Section 2.
- `src/app/globals.css` exports CSS custom properties mirroring Tailwind tokens.
- `_tokens.ts` trimmed to TS-facing exports only (remove `marketingClassNames`).
- Unit test: Tailwind config values match `marketingTokens` to prevent drift.
- No component or page markup changes yet.

Acceptance criteria:

- `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`
  green.
- `npm run test:e2e marketing-site.spec.ts` still passes (existing spec).
- Visual diff on `/` shows no changes (before/after screenshots match).

### Milestone B — Shell, primitives, and homepage migration

Deliverables:

- New components: `MarketingShell`, `SkipToContent`, `Reveal`, `StructuredData`.
- `SiteHeader`, `SiteFooter`, `Button`, `Card`, `Eyebrow`, `SectionHeader`, `Stat`,
  `HeroProductComposition`, `AdaptationPillars`, `Marquee`, `ProblemChart`, `ComparisonTable`,
  `ProductScreens`, `PhoneFrame`, `TrackedLink` — all migrated to token classes.
  Zero arbitrary `bg-[#...]` or `text-[NNpx]` remain in these files.
- `src/app/(marketing)/page.tsx` wrapped in `MarketingShell`, migrated to tokens.
- `SiteFooter` accent top border replaced per spec.

Acceptance criteria:

- `rg 'text-\[[0-9]' src/app/\(marketing\)` returns zero matches.
- `rg 'bg-\[#' src/app/\(marketing\)` returns zero matches.
- `rg 'text-\[#' src/app/\(marketing\)` returns zero matches.
- Exactly one `MarketingShell` call path per route; exactly one `SiteFooter` definition.
- Lighthouse mobile ≥ 90 on `/`.
- All quality gates green: `typecheck`, `lint`, `lint:kiro`, `format:check`, `test`, `build`.

### Milestone C — Subpages and waitlist hardening

Deliverables:

- `/science`, `/founder`, `/tour`, `/waitlist/thank-you`, `/legal/terms`, `/legal/privacy`,
  `/not-found` — all migrated and wrapped in `MarketingShell`.
- `/tour` pinned scrollytelling at `lg:+` via GSAP ScrollTrigger.
- `/science` sticky TOC at `lg:+`.
- `WaitlistForm` hardening: honeypot, `aria-live` error region, `autoComplete="email"`,
  client Zod pre-check, rate-limit copy.
- `StructuredData` usage per route (Article, Person, HowTo, WebPage).

Acceptance criteria:

- Zero arbitrary color/size values in any `(marketing)/**` page.
- All 7 pages pass axe with zero violations.
- Lighthouse mobile ≥ 90, desktop ≥ 95 on every marketing route.
- Waitlist form: submitting honeypot-filled field silently succeeds client-side but is
  rejected server-side with no PostHog event.
- Quality gates green.

### Milestone D — Responsive audit and accessibility hardening

Deliverables:

- Manual breakpoint audit at 375/768/1024/1440 per page with fixes committed.
- Keyboard navigation audit per page with fixes.
- Reduced motion verified per page.
- Contrast audit with axe + manual checks; any `#6B6B68` body copy promoted to `#A1A19E`.
- Screenshot artifacts captured under `docs/dev/plans/screenshots/redesign/` for the record.

Acceptance criteria:

- Zero horizontal overflow at any viewport.
- All interactive elements visibly focused.
- All body copy ≥ AA contrast.
- Reduced motion disables every non-essential animation while preserving layout.
- Quality gates green.

### Milestone E — Tests, SEO, performance, PR

Deliverables:

- `e2e/marketing-site.spec.ts` expanded per Section 7 + Milestone C.
- Unit tests for `Reveal`, `StructuredData`, `MarketingShell`, token drift guard.
- `robots.ts` + `sitemap.ts` cover every marketing route with appropriate changefreq.
- Final Lighthouse CI run recorded.
- PR opened against `main` with full summary + screenshots + Lighthouse numbers.

Acceptance criteria:

- `npm run test:e2e` green at 375/768/1024/1440.
- Unit test coverage for new components ≥ 80%.
- Lighthouse mobile ≥ 90, desktop ≥ 95, LCP < 2.5s, CLS < 0.05, INP < 200ms on every route.
- `npm run typecheck && npm run lint && npm run lint:kiro && npm run format:check && npm test && npm run build` — all green.
- PR CI green (or user-authorized admin merge if external billing blocks CI as before).

---

## Risks

| Risk                                                                                                              | Likelihood | Impact                                       | Mitigation                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind token migration introduces visual regressions invisible in diff review                                   | Medium     | High (visible on production)                 | Milestone A ships token-only with zero markup changes; capture before/after screenshots of every route at 1440 and diff. Only then do components migrate in Milestone B.                                                    |
| GSAP ScrollTrigger pinning interferes with mobile layout or reduced-motion users                                  | Medium     | High (breaks the pillar section on phones)   | Gate ScrollTrigger behind `matchMedia('(min-width: 1024px)')` and `useReducedMotion()` short-circuit. Verified pattern already exists in `AdaptationPillars`. Add explicit e2e test at 375 viewport that no pinning occurs. |
| Waitlist hardening changes (honeypot, aria-live) regress the existing happy-path submission                       | Low        | High (blocks the primary business objective) | Add e2e happy-path test before starting changes; keep server action signature unchanged; honeypot field is additive only.                                                                                                   |
| Axe or Lighthouse reveals issues not visible in local testing (e.g. font rendering, focus ring on Windows Chrome) | Medium     | Medium (delays merge)                        | Run Lighthouse CI in mobile + desktop profiles during Milestone E, not at the end. Budget a short fix-loop window.                                                                                                          |
| Bundle size regresses from new primitives (Reveal, StructuredData) or from GSAP                                   | Low        | Medium (violates <200kb gz budget)           | GSAP is already dynamically imported in `AdaptationPillars`. Keep new primitives small and server-renderable. Run `next build` with bundle analyzer at end of Milestone B and C.                                            |

---

## Acceptance Criteria

Complete when all of the following pass:

- [ ] `docs/dev/plans/REDESIGN_SPEC.md` approved by user (this doc, Stage 1 exit gate).
- [ ] `tailwind.config.ts` `theme.extend` populated with colors (marketing namespace),
      fontFamily (sans/mono with Geist variables), fontSize (display-xl through mono-label
      plus mobile variants), spacing (section-y, container-max, grid-gutter), borderRadius,
      and boxShadow per Section 2.
- [ ] `src/app/globals.css` exposes matching CSS custom properties.
- [ ] `rg 'text-\[[0-9]' src/app/\(marketing\)` returns zero matches.
- [ ] `rg 'bg-\[#' src/app/\(marketing\)` returns zero matches.
- [ ] `rg 'text-\[#' src/app/\(marketing\)` returns zero matches.
- [ ] Exactly one `SiteFooter` component definition; all pages use `MarketingShell`.
- [ ] `SiteFooter` does not use `border-t-2 border-[#CAFF4C]`.
- [ ] Every marketing route exposes exactly one `<h1>`.
- [ ] Every marketing route renders at 375 / 768 / 1024 / 1440 with zero horizontal overflow.
- [ ] Every interactive element has a visible `focus-visible` ring using
      `ring-marketing-accent`.
- [ ] Reduced motion disables hero marquee scroll, floating card drift, GSAP pinning,
      and Framer `whileInView` reveals while preserving layout.
- [ ] `WaitlistForm` includes honeypot, `autoComplete="email"`, `aria-live` error region,
      client Zod pre-check, rate-limit messaging.
- [ ] Per-route JSON-LD: SoftwareApplication (home), Article (/science), Person (/founder),
      HowTo (/tour), WebPage (legal + thank-you).
- [ ] `robots.ts` and `sitemap.ts` cover every marketing route.
- [ ] axe returns zero violations on every marketing route.
- [ ] Lighthouse mobile ≥ 90 and desktop ≥ 95 on every marketing route; LCP < 2.5s,
      CLS < 0.05, INP < 200ms.
- [ ] `npm run typecheck && npm run lint && npm run lint:kiro && npm run format:check &&
npm test && npm run test:e2e && npm run build` — all green.
- [ ] PR merged against `main` with before/after screenshots attached.

---

## Out of scope

- Any change to `supabase/migrations/**`. Migration `005` already covers the waitlist
  schema and RLS; no new migration is needed.
- Re-introduction of `(app)/`, `(auth)/`, or `onboarding/` route groups. The authenticated
  product surface remains deleted per Phase 0 and returns only under a reconfirmed Phase 2+.
- Any change to the internal product palette (`CLAUDE.md` indigo/orange). That palette
  does not apply to the marketing site.
- Stripe paywall, Capacitor wrappers, RAG/pgvector, nutrition, wearables, light theme,
  internationalization, social features, Testing Layer 5 — all deferred per `CLAUDE.md`.
- New analytics events beyond the existing eight. The event taxonomy in
  `src/lib/utils/event-names.ts` is complete for marketing.
- Any copy rewriting. `_content.ts` is the source of truth and stays as-is.
- Blog, changelog, or press pages. Not in the current IA.
- Dark/light theme toggle. Explicitly banned by `CLAUDE.md`.

---

## Alignment gate

Per the governing plan: **No code is written until the user approves this spec.**
The next step after approval is Milestone A, Stage 2 execution.
