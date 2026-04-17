# KairoFit Marketing Site - Build Brief

You are building the flagship marketing homepage and supporting subpages for KairoFit, a research-backed AI fitness coaching app currently in closed beta. This brief is prescriptive. Follow it literally unless a decision produces a technical problem, in which case flag it in your response before diverging.

No em dashes anywhere in code, copy, comments, or commit messages. Use regular dashes, colons, or restructure sentences.

---

## 0. Project Context (read before writing a line)

Before any code, read the following files in this exact order:

1. `/CLAUDE.md` - product decisions, voice rules, visual identity constraints, tech stack
2. `/README.md` - FitBod comparison table, growth strategy, positioning
3. `/docs/competitive/FITBOD_ONBOARDING_AUDIT.md` - the 15 gaps KairoFit exploits
4. `/docs/competitive/FITBOD_NAV_AUDIT.md` - UX gap inventory
5. `/docs/science/PROGRAMMING_RULES.md` - research citations you will surface on the page
6. `/docs/science/CONTRAINDICATIONS.md` - injury screening positioning
7. `/docs/research/KAIROFIT_RESEARCH_SCAFFOLD.md` - market context, pricing rationale
8. `/src/lib/ai/kiro-voice.ts` if it exists - Kiro voice rules and prompts; if it does not exist, note that and proceed using the voice rules in CLAUDE.md

External references to study before designing:

- https://kairo.business (parent coaching brand, for tonal continuity only - do NOT copy the cream/editorial palette)
- https://kairo.business/mobile (current app landing page - the raw material we are rebuilding better)
- https://chazwyllie.com (founder portfolio - use for founder bio and photo)

Aesthetic benchmarks to internalize:

- Linear marketing pages (information density, restraint, scroll choreography)
- Vercel homepage (dark precision, numerics, technical polish)
- Whoop (athletic confidence, data as hero)
- Apple Fitness (restraint, product-as-art)
- Nike SNKRS (bold typography, motion discipline)

---

## 1. Project Identity

- **Site name**: KairoFit
- **Domain**: kairofitdev.vercel.app (standalone, no cross-reference to kairo.business beyond the founder's backstory)
- **Positioning**: AI fitness coaching that adapts to your real life, so consistency is possible
- **Target user**: busy students and professionals with limited fitness or nutrition experience who want the thinking automated
- **Primary competitor to position against**: FitBod. Secondary context: MacroFactor, MyFitnessPal, Future.
- **Current state**: closed beta, free, pre-launch, waitlist capture via email
- **Future state**: $9.99/month behind a feature flag
- **AI coach**: Kiro (named character, direct, science-literate, no motivational fluff)

---

## 2. Architecture Decision

Build the marketing site as a route group inside the existing kairofit repo.
src/app/
(marketing)/
layout.tsx # Marketing-only root layout (no PWA shell, no auth middleware)
page.tsx # Homepage (the flagship long-scroll)
science/
page.tsx # Full methodology and research citations
founder/
page.tsx # Chaz's story, longer form
tour/
page.tsx # Product tour (see section 6 for scope)
waitlist/
thank-you/
page.tsx # Post-submit confirmation
legal/
privacy/page.tsx
terms/page.tsx
(app)/ # Existing authenticated app routes

If `(app)/` does not exist yet, move the existing authenticated routes into it as part of this build. Update `middleware.ts` so it only guards `(app)/` routes and lets `(marketing)/` pass through without auth.

**Do not build**: a pricing page for v1. Pricing is "Free during beta, $9.99/month at launch" expressed inline on the homepage, not on a dedicated page.

---

## 3. Design System (Dark Precision, KairoFit Variant)

This is a new expression of the brand. It does NOT match `CLAUDE.md`'s internal app palette (indigo/orange). Those colors stay inside the authenticated product. The marketing site runs on the system below.

### Color Tokens

```ts
// src/app/(marketing)/_tokens.ts
export const marketingTokens = {
  // Base
  bg: '#0A0A0B', // primary background (near-black)
  bgElevated: '#111113', // cards, elevated surfaces
  bgSubtle: '#17171A', // hover states, subtle panels
  border: '#1F1F23', // default border
  borderStrong: '#2A2A2F', // emphasized border on cards and dividers

  // Text
  textPrimary: '#F5F5F4', // body and headlines
  textSecondary: '#A1A19E', // subheads, metadata
  textMuted: '#6B6B68', // timestamps, tertiary UI

  // Single brand accent (THE thread, used disciplined)
  accent: '#CAFF4C', // neon yellow-green, the signature color
  accentMuted: '#CAFF4C26', // 15% opacity version for glows and washes
  accentOn: '#0A0A0B', // text that goes ON the accent (near-black)

  // Semantic
  success: '#10B981', // checkmarks in "what's included" lists only
  danger: '#EF4444', // form validation errors only
}
```

Indigo (`#6366F1`) and orange (`#F97316`) from CLAUDE.md do NOT appear on this site. Those are product-internal colors.

### Typography

Install three fonts. Load via `next/font/google` or `next/font/local`.

- **Display (headlines, hero, section heads)**: Geist Sans or Inter, weight 600-700, tight tracking (-0.02em to -0.04em on large sizes). This is the athletic-confident voice.
- **Body**: Geist Sans or Inter, weight 400-500, normal tracking. Restrained premium baseline.
- **Mono (numbers, stats, timestamps, data moments, code-ish accents)**: Geist Mono or JetBrains Mono, weight 400-500. This is the engineering-precise voice.

Type scale:
display-xl: 72px / 1.05 / -0.04em (hero headline)
display-lg: 56px / 1.05 / -0.03em (section headlines)
display-md: 40px / 1.1 / -0.02em (sub-section)
heading: 24px / 1.3 / -0.01em (card titles)
body-lg: 18px / 1.5 / normal (lead paragraphs)
body: 16px / 1.6 / normal (default)
small: 14px / 1.5 / normal (metadata)
mono-stat: 48px / 1 / -0.02em (hero numbers)
mono-label: 12px / 1.4 / 0.08em uppercase (tags, eyebrows)

On mobile (below 768px), scale display sizes down ~40%.

### Spacing, Layout, Grid

- Max content width: 1280px
- Section vertical padding: 160px desktop, 96px mobile
- Grid: 12-column desktop, 4-column mobile, 32px gutter desktop, 16px mobile
- Use generous whitespace between sections. Density within sections, air between them.

### Accent Usage Rules (#CAFF4C as a thread)

Present in every major section, never dominant. Specifically:

- Primary CTA button background (accent fill, near-black text)
- One or two words highlighted in each section headline (wrapped in an accent-colored span)
- Key stat numerics in mono type
- Subtle glow on interactive elements (buttons, links, focus rings)
- Hover state on secondary CTAs (border goes from subtle to accent)
- **Never** as a full-section background wash. **Never** as large blocks of text. **Never** more than one "punch" moment per section.

### Component Primitives to Build

Build these as reusable components in `src/app/(marketing)/_components/`:

- `<Button variant="primary|secondary|ghost" />`
- `<Eyebrow>` - uppercase mono label above section heads
- `<SectionHeader eyebrow headline sub />`
- `<Card>` - elevated surface with border
- `<Stat value label />` - mono numeric display
- `<Marquee items />` - infinite horizontal scroller (for social proof strip)
- `<PhoneFrame>` - device mockup shell for product screens
- `<AccentText>` - the `#CAFF4C` span wrapper for highlight words

---

## 4. Motion System

Motion density target: 5 out of 5 (cinematic). Library: **GSAP with ScrollTrigger** for scroll-based choreography, **Framer Motion** for component-level interactions (hovers, enter animations, layout animations).

Install:

```bash
npm install gsap @gsap/react framer-motion
```

### Motion Rules

Motion is everywhere, but it is **intentional**. Before animating anything, ask: "does this motion communicate something, or is it noise?" If noise, cut it.

**Where motion lives:**

- Hero: ambient animation on a phone mockup (UI states cycling), a subtle parallax on floating UI cards, a slow drift on background ambient elements, text reveal on headline
- Section transitions: sticky scroll-pinned moments for the "How it adapts" pillars (one pillar per scroll step, phone screen morphs between each)
- Product screenshots: scroll-triggered reveals, staggered children
- Stats and numbers: count-up animation on first view
- Science section: citations fade in as user scrolls through them
- Comparison table: rows animate in sequentially, with the KairoFit column cells glowing subtly
- Hover states: every interactive element has a motion response (buttons lift and glow, cards tilt slightly, CTAs shift)

**Where motion does NOT live:**

- Body paragraphs (no reveal-on-scroll on paragraph text; reveals happen on headlines and cards only)
- FAQ accordion (use standard height animation, nothing flashy)
- Footer (static)
- Form inputs (focus ring only, no extravagance)

### Reduced Motion

Respect `prefers-reduced-motion: reduce` fully. All GSAP ScrollTrigger instances must check for reduced motion and replace with instant state changes. All Framer Motion components use `useReducedMotion()` and collapse to opacity transitions only. Test this by enabling reduced motion in dev tools before shipping.

### Performance-Motion Balance (the tension you flagged)

The page will run GSAP ScrollTrigger AND Framer Motion. To hit performance targets (see section 8), apply these rules:

- No motion on initial LCP element (hero headline renders static, then animates after mount)
- Lazy-load GSAP only on routes that use it (dynamic import at layout level for marketing group)
- All `motion.*` components are client components; server render their container
- Background ambient animation uses CSS `@keyframes` or `transform` only, never JS-animated properties that trigger layout
- Use `will-change` sparingly and only on actively animating elements

---

## 5. Homepage Section Spec (the flagship)

This is a long-scroll page with 10 sections. Every section has: eyebrow label, headline (with accent highlight), sub-copy, content, one clear reading path. Content density is 4/5 (reward close reading, not Apple-style minimalism).

### Section 1: Hero

**Layout**: Full-viewport height on desktop (min 100vh), edge-to-edge with max-width content. Split composition: 60% left column (typography), 40% right column (animated product composition).

**Copy**:

- Eyebrow: `KAIROFIT // CLOSED BETA`
- Headline: `Fitness that adapts <AccentText>when life happens.</AccentText>`
- Sub: `Tell Kairo your constraints. Get a plan that fits today, not the perfect version of your week that never shows up.`
- Primary CTA: `Join the waitlist` (anchors to the waitlist section OR opens a modal with email capture - your call, modal is cleaner)
- Secondary CTA: `See how it works` (anchors to section 4, "How it adapts")

**Right column composition**:

- Central element: a phone mockup with the Today screen from `/mobile` (the "Good morning, how are you feeling?" screen). Use the same UI content but redesign it cleaner, more premium, with better hierarchy than the current /mobile page has.
- Animated: the phone's screen cycles between 4 states every 4 seconds. States: Today screen → Quick Log screen → Kiro chat screen → Insights screen. Smooth crossfade with a subtle scale pulse on transition.
- Floating UI elements around the phone (breaking out of the frame):
  - Top-right: a small "streak" card showing `11 day streak` in mono
  - Bottom-left: a Kiro message bubble: `You're 22g short on protein from yesterday. Today's meals adjusted.`
  - Right edge: a small metric card: `Workouts 4/5 this week`
- These float with subtle parallax as the user scrolls, drifting slightly out of their resting positions.

**Ambient**: a very subtle radial gradient behind the phone, accent color at 8% opacity, pulsing slowly (6s cycle). Tiny accent-colored dots scattered in the background, slowly drifting.

### Section 2: Social Proof Marquee

**Layout**: Full-width horizontal marquee. Single row. Infinite scroll.

**Copy**: strip out the fake claims from `/mobile`. Be honest. Replace with:

- `Closed beta`
- `Built on 50+ peer-reviewed studies`
- `Adapts to your week, not the other way around`
- `30-second daily logging`
- `Travel mode built in`
- `Injury-aware programming`
- `No rigid 12-week programs`
- `Consistency beats perfection`
- `One AI coach, not a library of generic plans`

Separate with a small accent-colored bullet (`●`). Scroll speed slow enough to read comfortably (~40px/sec).

### Section 3: The Problem

**Eyebrow**: `THE PROBLEM`
**Headline**: `You already know what to do. <AccentText>You can't stay consistent doing it.</AccentText>`

**Layout**: Two-column on desktop. Left: the narrative. Right: a visual representation of the problem (see below).

**Copy (left column)**:
Most fitness apps assume an idealized week that never happens.
They give you a rigid 12-week program and when you miss a
Tuesday, the whole thing breaks. You start over. Again.
The problem isn't motivation. It's architecture.
Real weeks have travel. Bad sleep. Work deadlines. Old injuries
flaring up. Gyms closed for a holiday. A plan that can't handle
any of this was never actually a plan. It was a wishlist.

**Right column visual**: An abstract, data-driven diagram. Two lines side by side:

- Left line (labeled `RIGID PROGRAMS`): a flat horizontal line that plummets to zero around week 3, in muted gray
- Right line (labeled `KAIROFIT`): a gently oscillating line that dips and recovers, trending upward, in accent color

Animate: lines draw themselves as the user scrolls the section into view.

### Section 4: How It Adapts (the adaptation pillars)

This is the scrollytelling centerpiece. Use GSAP ScrollTrigger with pinning.

**Eyebrow**: `THE PRODUCT`
**Headline**: `Four ways your plan adapts <AccentText>to reality.</AccentText>`

**Layout**: Sticky split-screen. Left side sticks in place and contains a phone mockup that morphs between screens. Right side scrolls through four pillars, one at a time. Each pillar triggers a different phone screen.

**The four pillars** (improving on the three in your existing `/mobile` page):

**Pillar 1: You miss a day**
`Log "I missed" in one tap. No guilt spiral, no program reset. Tomorrow's plan quietly absorbs what happened and keeps you moving forward. Consistency compounds; perfection doesn't.`
Phone shows: Quick Log screen with "I missed" tapped, then Today screen updating for tomorrow.

**Pillar 2: Bad week, bad sleep, high stress**
`Your morning check-in captures how you actually feel. Slept 5 hours? Stress high? Kairo shortens today's workout, prioritizes recovery work, and quietly drops the accessory volume you won't benefit from anyway.`
Phone shows: "How are you feeling?" → "Tired" selected → workout shortens from 45 to 30 minutes.

**Pillar 3: You're traveling, or the gym is closed**
`Hit Travel Mode or tell Kairo what equipment you have today. Hotel room with a resistance band? Bodyweight only? Your plan rebuilds itself around what's actually available, not what your profile says you own.`
Phone shows: Equipment selector → plan regenerates with bodyweight variations.

**Pillar 4: An old injury flares up**
`Tap the affected area. Kairo excludes contraindicated exercises, substitutes safer alternatives, and Kiro explains exactly why each swap was made. This is the FitBod gap - no injury screening, ever. KairoFit is built around it.`
Phone shows: Injury zones screen → a "Lower back" toggle activates → exercise list updates with substitutions highlighted.

Each pillar's right-column content: a large number (01, 02, 03, 04) in mono, the pillar headline, the pillar copy, and a small "related research" link that tooltips a citation from `/docs/science/`.

**Improvements/suggestions on the pillars** (your ask): I replaced the generic "auto-adapts" framing with four specific failure modes of rigid programs. This makes the differentiation concrete instead of abstract. Pillar 4 in particular (injury screening) is the single sharpest FitBod gap from your competitive doc, and it deserves to be its own pillar, not buried in a feature list.

### Section 5: Meet Kiro

**Eyebrow**: `YOUR AI COACH`
**Headline**: `This is Kiro. <AccentText>She knows why.</AccentText>`

_(Note: "she" is a placeholder. If Kiro has a defined gender in your product, update. If not, consider keeping it ungendered: "Kiro knows why.")_

**Layout**: Single column, centered, feels like a character introduction. Kiro is rendered as a chat interface mockup, large, centered, showing a real conversation exchange.

**Kiro prompt source**: Before writing any Kiro dialogue in this section, check for `src/lib/ai/kiro-voice.ts` in the repo. If it exists, source sample messages from there and from the voice rules it defines. If it does not exist, use the voice rules from CLAUDE.md (second person always, specific numbers, no em dashes, no motivational fluff) to write three exchanges.

**Example exchange to show** (write in Kiro's voice, sourced from the repo where possible):

User message: `Why is my chest volume only 12 sets this week? I thought more was better.`

Kiro response: `You're at level 3, intermediate. Optimal chest volume for your level is 14-16 sets per week at MAV. You're at 12 because you're ramping from MEV after your last deload. Two weeks from now you'll be at 16. Going higher than that this week would fatigue faster than you'd grow. The curve matters more than the number.`

This exchange does three things at once: shows Kiro's voice, demonstrates research-backed programming, references volume landmarks from your PROGRAMMING_RULES doc. Use similar exchanges for two more examples: one about exercise substitution for an injury, one about adjusting to a missed workout.

**Supporting copy below the exchange**:
Kiro is direct, specific, and science-literate. No "You've got this!"
No "Let's crush it!" Just real programming decisions explained in a
way that holds up to scrutiny.
Every answer is backed by peer-reviewed research. Every swap has a
reason. Every number on your screen came from somewhere.

**Link**: `Read Kiro's full methodology →` pointing to `/science`.

### Section 6: The Science

**Eyebrow**: `THE FOUNDATION`
**Headline**: `Programming decisions, <AccentText>not programming guesses.</AccentText>`

**Layout**: Three-column grid of research principle cards on desktop. Each card cites a specific study and explains how it shapes the app.

**The four to six cards** (pull from `/docs/science/PROGRAMMING_RULES.md`):

1. **Volume Landmarks** - cite Israetel (RP Volume Landmarks) and Schoenfeld (2017). Card explains MEV, MAV, MRV and shows the level-specific table truncated.
2. **Rep Range Equivalence** - cite Schoenfeld (2019), Plotkin et al. (2022). Card explains hypertrophy across 5-30 reps when proximity to failure is matched.
3. **Rest Periods** - cite Schoenfeld (2016). Card surfaces the 13.1% vs 6.8% quad growth study. Lead with the number.
4. **Periodization Over Rotation** - cite Ramos-Campo et al. (2024). Card explains why scheduled deloads beat fatigue-rotation, contrasting with FitBod's approach by name.
5. **Injury Screening** - cite your own `CONTRAINDICATIONS.md` (6 injury zones, auto-filter). Frame as "industry-first" because no consumer AI fitness app does this.
6. **Adaptive vs Rigid** - cite the retention research from your scaffold (Baz-Valle 2022 context, 5% retention improvement produces 25-95% profit improvement).

Each card:

- Research icon or diagram (simple SVG in accent color)
- Citation in mono (`Schoenfeld et al., 2016`)
- Headline (card title, ~6 words)
- 2-3 sentence explanation
- "What this means in the app" micro-footer

CTA at section end: `See the full methodology →` linking to `/science`.

### Section 7: KairoFit vs FitBod Comparison

**Eyebrow**: `HOW WE'RE DIFFERENT`
**Headline**: `Why we built this instead of <AccentText>using what already existed.</AccentText>`

**Layout**: Two-column comparison table. FitBod column is muted gray, KairoFit column is emphasized with accent-tinted row backgrounds. Header row has each product's logo and one-line positioning.

**Rows** (from your README, edited for punch):

| FitBod                                                                       | KairoFit                                                                          |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| No injury screening. You tell them you have a bad shoulder? They don't care. | 6 injury zones, screened at onboarding. Contraindicated exercises auto-excluded.  |
| No body composition. Height, weight, body fat all unasked.                   | Height, weight, and goal used to project your actual timeline.                    |
| Fatigue rotation dressed up as programming.                                  | Real mesocycles. Scheduled deloads. Progressive overload, not shuffled volume.    |
| 3 experience levels: Beginner, Advanced, or "figure it out."                 | 5 levels with behavioral descriptions. No one slips between the cracks.           |
| Email gate at screen 31. You're asked after 30 screens of fake loading.      | Email gate at screen 16, right after your archetype reveal. We respect your time. |
| $15.99/month. Opaque algorithm.                                              | Free during beta. $9.99/month when monetized. Kiro explains every decision.       |

Animate: rows fade in one at a time as the table scrolls into view. KairoFit column cells have a subtle accent glow that pulses once on enter.

### Section 8: Founder Note

**Eyebrow**: `BEHIND THE APP`
**Headline**: `Built by someone who <AccentText>lived the problem.</AccentText>`

**Layout**: Two columns. Left: founder photo from `chazwyllie.com/assets/images/profile-photo.jpg`, treated with a subtle monochrome tint and accent-colored border frame. Right: founder note.

**Copy** (use the existing kairo.business version, edited to remove coaching-specific language):
I'm Chaz. I built KairoFit because I lived the problem.
Balancing a full CS degree at ASU with consistent training taught
me that the plans that actually work aren't the rigid ones. They're
the ones that bend without breaking.
I spent years at Powerhouse Fitness watching people start strong
and fall off, not because they lacked motivation, but because their
plan couldn't handle a real week. KairoFit is the system I wish
existed: daily adaptation, 30-second logging, and a coach (Kiro)
that treats consistency as the goal, not perfection.
My mindset: consistency, feedback loops, and measurable progress.
The same principles I apply to engineering are the ones KairoFit
is built on.

Small credentials row beneath:
`CS @ ASU   //   Powerhouse Fitness alumni   //   Built KairoFit from scratch`

CTA: `Read the full story →` linking to `/founder`.

### Section 9: Final CTA and Waitlist

**Eyebrow**: `EARLY ACCESS`
**Headline**: `Be first when we open <AccentText>the next wave of beta.</AccentText>`

**Layout**: Centered, full-width, generous vertical space. One large email input with a primary CTA button.

**Copy**:
KairoFit is in closed beta. We're onboarding new users in small
waves to keep programming quality high. Join the waitlist and
we'll reach out when a slot opens.
No spam. No drip funnel. One email when you're in.

**Form**:

- Single input field (email), mono placeholder text
- Primary CTA: `Join the waitlist` (accent background)
- On success: smooth transition to thank-you state with copy `You're in. We'll be in touch.`
- Supabase integration: insert into a `waitlist` table with email and timestamp. If table does not exist, create a migration for it with RLS policies (see section 8.4).

**Social trust line beneath form**:
`Closed beta. Free during beta. $9.99/month when we open to the public.`

### Section 10: Footer

Minimal. Three columns:

- **Column 1**: KairoFit wordmark, tagline `Fitness that adapts when life happens.`, small copyright line
- **Column 2**: Product links (How it works, Science, Tour, Founder, Pricing note - not a link, just inline)
- **Column 3**: Connect (Instagram @chazwyllie linking to instagram.com/chazwyllie, Contact email, Legal: Privacy, Terms)

Accent-colored bottom border. No social proof or CTAs in the footer, keep it light.

---

## 6. Subpages (v1 scope)

### `/science` - The Science Page

Long-form methodology. Expand the six homepage cards into full sections with:

- The full research citation
- A direct link to the study (where publicly available)
- A longer explanation of how it shapes KairoFit's programming
- Cross-references to the `docs/science/PROGRAMMING_RULES.md` doc

Design: same system as homepage, but text-dense, reading-optimized. Single column max-width 720px for body content. Sidebar (desktop) with a sticky table of contents.

Sections to include:

1. How we decide volume
2. How we decide rep ranges
3. How we decide rest periods
4. How we adapt between sessions
5. How we screen for injuries
6. How we handle deloads and periodization
7. Our research bibliography (full list of citations from the docs folder)

### `/founder` - Founder Story

Longer-form version of the homepage founder note. Pull content from `chazwyllie.com` about section and from the kairo.business founder section. Sections:

- Why KairoFit exists (problem narrative)
- My background (CS at ASU, Powerhouse Fitness, Kairo coaching)
- What I believe about fitness programming
- Why I built this as AI-first instead of a coaching business
- How to reach me

Design: reading-focused, single column 720px max, founder photo as hero, small credential row, link back to homepage waitlist.

### `/tour` - Product Tour

You said you need to build this from scratch. For v1, build it as a **structured scrollytelling page**, not a video or interactive demo. It walks through the app experience sequentially:

1. Hero: `This is what a week with KairoFit actually looks like.`
2. Monday morning check-in (phone screen + narrative)
3. Tuesday: you're tired, plan shortens (phone screen + narrative)
4. Wednesday: travel mode (phone screen + narrative)
5. Thursday: old knee flares (phone screen + narrative)
6. Friday: Kiro's weekly debrief (phone screen + narrative)
7. Saturday and Sunday: rest and recovery, streak preserved
8. Final CTA: waitlist

This is essentially a longer, more personal version of the homepage's "How it adapts" section, told as a weekly narrative. Uses the same phone mockups, extended.

### `/waitlist/thank-you` - Confirmation

Simple, polished. Headline confirming submission, what to expect, social follow prompt (Instagram), link back to homepage. No motion beyond a subtle accent glow on the confirmation icon.

### `/legal/privacy` and `/legal/terms`

Standard boilerplate for a closed beta fitness app. Reference that health data is encrypted at column level (per your SECURITY.md). Keep simple, dense, readable. Single column, no motion.

---

## 7. Content Inventory (what exists, what you write)

### Use as-is (cite source)

- FitBod comparison table (from `/README.md`)
- Research citations and study numbers (from `/docs/science/PROGRAMMING_RULES.md`)
- Founder photo (`https://chazwyllie.com/assets/images/profile-photo.jpg`)
- Founder backstory paragraphs (from kairo.business /about section)

### Generate fresh

- All hero copy (keep the "Fitness that adapts when life happens" headline from /mobile, write fresh sub-copy)
- All four adaptation pillar narratives (write new, per spec above)
- Kiro voice samples (check `src/lib/ai/kiro-voice.ts` first, generate if missing)
- Science card blurbs (fresh, grounded in the citations)
- All CTAs, form copy, footer copy

### Remove from existing material

- All fake testimonials (Jordan M., Priya S., Marcus T.) - do not use these on the KairoFit site. They belong to the coaching business at kairo.business. Use none on the marketing site for v1. If honesty demands a social proof section, replace with research-citation strip or omit entirely.
- "Trusted by early testers in 12+ countries" claim from /mobile - do not repeat. We are pre-launch; do not invent traction.
- Three-tier pricing model from any older docs - irrelevant. It's free now, $9.99 later.

### Imagery

- Founder photo: use the one from chazwyllie.com
- App mockups: redesign the `/mobile` screens cleaner. Do not screenshot and reuse; rebuild as React/SVG mockups so they can animate.
- No stock photography. No gym lifestyle shots. No hands-holding-phone images. The visual language is UI-first, typography-first, color-disciplined.
- Logo: use a simple KairoFit wordmark (text-only, matching the display font, weight 700, accent-colored dot or underscore as a signature mark). If a logo file exists in `/public/`, use that. Otherwise generate the wordmark in code.

---

## 8. Technical Constraints and Acceptance Criteria

### 8.1 Stack (confirmed)

- Next.js 15 App Router with Turbopack
- TypeScript strict mode (no `any`, use `unknown` and narrow)
- Tailwind CSS + shadcn/ui primitives where applicable
- GSAP + ScrollTrigger for scrollytelling
- Framer Motion for component-level animation
- Supabase for waitlist storage
- PostHog for analytics
- Deploy target: kairofitdev.vercel.app

### 8.2 Performance Budget

Ruthless. Non-negotiable thresholds:

- Lighthouse Performance: 90+ on mobile, 95+ on desktop
- LCP: under 2.5s on 3G Fast
- CLS: under 0.05
- First Input Delay: under 100ms
- Total JS bundle for homepage: under 200kb gzipped (excluding GSAP, which lazy-loads)
- All images WebP or AVIF, responsive, lazy-loaded below the fold
- Fonts use `font-display: swap`, subset to Latin, preload display font only

If motion-5 ambitions threaten these thresholds, motion loses. Performance wins every tradeoff.

### 8.3 Accessibility (WCAG AA minimum)

- `prefers-reduced-motion` respected on 100% of animations (no exceptions)
- All interactive elements keyboard-navigable with visible focus rings (accent-colored)
- Color contrast: `#F5F5F4` on `#0A0A0B` passes AAA for body. `#CAFF4C` on `#0A0A0B` passes AA for large text only, so accent color is used for display type and button fills, never for body copy.
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, proper heading hierarchy (one h1 per page, h2 per section, h3 for cards)
- All images have alt text (or `alt=""` if purely decorative)
- Form inputs have associated labels
- Skip-to-content link at the top of each page

### 8.4 Waitlist Backend (Supabase)

Create a migration: `supabase/migrations/XXX_marketing_waitlist.sql`

```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT DEFAULT 'marketing_homepage',
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can join waitlist)
CREATE POLICY "Anyone can insert into waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Block all reads from anon role (only service role can read)
-- No SELECT policy means no reads. Intentional.

CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);
```

Follow the RLS patterns in `skills/rls-migration-checklist/` - every write policy needs `WITH CHECK`.

Form submission uses a Server Action (next-safe-action v7, per the repo's existing pattern). Validate email with Zod before insert.

### 8.5 Analytics (PostHog)

Fire these events:

- `WAITLIST_PAGE_VIEWED` - homepage load
- `WAITLIST_CTA_CLICKED` - primary CTA click
- `WAITLIST_SUBMITTED` - successful email submission
- `WAITLIST_FAILED` - submission error (with error reason)
- `SCIENCE_LINK_CLICKED` - any link to /science
- `FOUNDER_LINK_CLICKED` - any link to /founder
- `TOUR_LINK_CLICKED` - any link to /tour
- `INSTAGRAM_CLICKED` - footer Instagram link

See `skills/posthog-event-taxonomy/` for naming conventions.

### 8.6 SEO

Target keywords (prioritized):

1. `AI workout app`
2. `adaptive fitness app`
3. `research-based workout app`

Implementation:

- H1 on homepage includes one of the primary keywords naturally
- Meta title: `KairoFit - The AI workout app that adapts to your real life`
- Meta description: 150-char compelling summary hitting primary keyword
- Open Graph image: a clean composition of the hero phone mockup on dark background with headline overlaid, 1200x630
- Structured data: `SoftwareApplication` schema on homepage, `Person` schema on /founder, `Article` schema on /science
- Sitemap.xml generated via Next.js built-in
- Robots.txt allows all (beta, no blocking)
- All images have descriptive alt text
- URLs are clean, no query strings
- Each subpage has its own meta, OG image, and structured data

### 8.7 No em dashes

Anywhere. Run a grep at build time or add to the existing `npm run lint:kiro` rule. If any em dash ships, the build fails.

---

## 9. Explicit Non-Goals (out of scope for v1)

Do NOT build any of these:

- Pricing page (pricing is expressed inline: "Free during beta, $9.99/month at launch")
- Login/signup flow (those live in the authenticated app, not on the marketing site)
- Live chat widget (no Intercom, no Crisp, no Drift)
- Blog with real articles (can scaffold an empty `/blog` route if Claude Code considers it trivial; do not populate with content)
- Multi-language support (English only)
- Newsletter beyond waitlist (one email capture point, one purpose)
- Dark/light mode toggle (dark only, always)
- A "Compare to FitBod" dedicated page (the homepage comparison section is enough for v1)
- Interactive product demo (Arcade, Storylane, etc.) - the `/tour` page is a scrollytelling narrative, not an interactive embed
- Video hero (phone mockup with animated UI states is the hero; no video production needed)
- Real testimonials or beta user counts (we don't have them; don't invent them)
- Affiliate or referral program UI (post-revenue feature)
- App Store or Google Play badges (KairoFit is a PWA; those badges would be dishonest)

---

## 10. Delivery Expectations

Structure your work in this order:

1. **Setup**: route group, layouts, design tokens, font loading, base components
2. **Homepage sections 1-2**: hero and marquee. Ship these first and verify motion/performance before continuing.
3. **Homepage sections 3-5**: problem, adaptation pillars (scrollytelling), Kiro
4. **Homepage sections 6-7**: science cards, comparison table
5. **Homepage sections 8-10**: founder, waitlist, footer
6. **Subpages**: /science, /founder, /tour, /waitlist/thank-you, /legal/\*
7. **Polish pass**: motion refinement, reduced-motion verification, accessibility audit, Lighthouse pass
8. **Waitlist backend**: Supabase migration + Server Action
9. **Analytics**: PostHog events wired up

At each milestone, run `npm run typecheck`, `npm run lint`, `npm run lint:kiro`, and a Lighthouse check. Do not move to the next milestone with failing checks.

Commit in small, reviewable pieces following the repo's git workflow (see `skills/git-workflow/SKILL.md`). One commit per section is ideal.

---

## 11. Acceptance Criteria (the definition of done)

The build is done when:

- [ ] All 10 homepage sections built and behave per spec on desktop and mobile
- [ ] All five subpages exist with real content (no lorem ipsum, no TODO comments in visible copy)
- [ ] Motion density is cinematic but respects `prefers-reduced-motion` fully
- [ ] Lighthouse Performance score 90+ mobile, 95+ desktop
- [ ] LCP under 2.5s on 3G Fast
- [ ] All keyboard-navigable, all focus rings visible in accent color
- [ ] Zero em dashes anywhere (grep passes)
- [ ] No `any` in TypeScript (strict mode clean)
- [ ] All fake testimonials and traction claims removed
- [ ] Waitlist form submits successfully to Supabase and fires the correct PostHog event
- [ ] Thank-you page renders after submission
- [ ] Meta tags, OG images, and structured data present on every page
- [ ] All existing authenticated routes still work (moving them to `(app)/` did not break anything)
- [ ] `npm run build` succeeds clean, no warnings
- [ ] `npm run test` and `npm run test:e2e` pass (add minimal tests for the waitlist submission path)

---

## 12. Final Rule

If you hit a decision this brief doesn't cover, choose the option that best serves this order: **credibility first, aesthetic shock second, SEO third, conversion fourth.** The page has to look undeniable, feel legitimate to a due-diligence visitor, rank for real queries, and capture emails. In that order. Any tradeoff goes that way.

Begin.
