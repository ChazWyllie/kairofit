# KairoFit UI Preferences Memory

Last updated: 2026-04-16

## Purpose

This file stores landing-page preferences that should compound across future showcase iterations.
When new landing pages are requested without tight direction, use this file together with `docs/dev/plans/UI_DESIGN.md` as the filter before introducing new visual ideas.

## Brand invariants

- KairoFit stays dark-only.
- Canonical brand accent remains indigo `#6366F1`.
- Product authority comes from science transparency, not hype.
- Kiro copy stays direct, specific, and non-motivational.
- Real product UI mocks are preferred over abstract marketing illustration.
- The product context must stay grounded in workout programming, recovery, injury awareness, and progression.

## Approved patterns

- Internal directory on `/` with multiple side-by-side full-page options.
- Three variants at a time unless a later request explicitly changes that number.
- Shared showcase primitives that accept variant accents rather than hardcoding color behavior.
- Distinct layout directions per variant while preserving KairoFit copy and product truth.
- Pure CSS mini previews on the directory cards instead of static image thumbnails.
- Long-form authority layouts are allowed when they stay grounded in real product behavior.
- Conversion-focused layouts are allowed when they still show believable product proof.

## Rejected patterns

- Light mode or bright neutral backgrounds.
- Generic SaaS copy with no training specificity.
- Motivational coaching phrases in Kiro-facing or product-facing copy.
- Decorative gradients that exist only for style and not emphasis.
- Variants that drift away from KairoFit into a different company or category.
- Placeholder UI blocks with no relation to the actual product.

## Variant notes

### Signal

- Closest to the canonical KairoFit brand.
- Use when the goal is the safest production-ready direction.
- Keep the page clean, science-first, and restrained.

### Edge

- Use when stronger conversion framing is desired.
- Orange can lead, but only in controlled zones: CTA, metrics, and selective emphasis.
- Keep proof dense and visible.

### Atlas

- Use when the goal is premium authority and editorial trust.
- Allow more explanation and longer line lengths than Signal.
- Keep the product grounded in specifics, not abstract wellness language.

## Defaults for future unexplained landing-page requests

- Start from KairoFit brand invariants first.
- Research current landing-page patterns at generation time if the request allows browsing.
- Borrow only patterns that fit KairoFit's dark system, science-first differentiation, and approved copy style.
- Favor real product evidence over generic social-proof fillers.
- Log any newly approved or rejected pattern back into this file after feedback.
