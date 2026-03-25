---
name: kairofit-changelog
description: >
  Auto-generates KairoFit release notes from git commits for the in-app "What's new"
  section and the public changelog page. Use this skill when preparing a release,
  updating the changelog, or generating the weekly update notification content.
  Triggers when asked to "write release notes", "update the changelog",
  "generate what's new content", or when the user says a version is ready to ship.
---

# KairoFit Changelog Generator

Converts git commits into user-facing release notes for the in-app changelog.

---

## Commit Convention

KairoFit uses conventional commits:

```
feat: add muscle recovery heatmap
fix: resolve deload triggering at week 0
perf: reduce workout set logging latency
chore: update dependencies
docs: clarify archetype assignment logic
```

Prefixes included in changelog: `feat`, `fix`, `perf`, `security`
Prefixes excluded: `chore`, `docs`, `refactor`, `test`, `ci`

---

## Generating a Changelog Entry

Run this to get commits since last release:
```bash
git log v0.1.0..HEAD --oneline --no-merges
```

Then use this prompt with Claude:

```
Here are the git commits since the last release:

[paste commits]

Generate release notes for KairoFit version [version].

Rules:
1. Group by: New features, Improvements, Bug fixes
2. Translate technical commit language to user-facing benefit language
3. Keep each entry to one sentence
4. No em dashes
5. No technical jargon (no "RLS", "Supabase", "migration", "component", "refactor")
6. Focus on what changed for the user, not what changed in the code
7. Kiro-adjacent voice: direct and specific, no fluff

Output format:
## v[version] - [date]
### New
- [feature]: [user benefit]

### Improved
- [component]: [what got better]

### Fixed
- [bug]: [what was broken, now works]
```

---

## In-App Changelog Storage

Changelogs are stored in Supabase as rows in a `changelogs` table.
The "What's new" badge appears when the user's `last_seen_changelog_version`
in their profile is behind the current version.

```sql
-- Add to a future migration when the feature is built
CREATE TABLE public.changelogs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  version text NOT NULL UNIQUE,
  released_at timestamptz DEFAULT now() NOT NULL,
  entries jsonb NOT NULL  -- array of { category, text }
);

-- Profile addition
ALTER TABLE public.profiles ADD COLUMN last_seen_changelog_version text;
```

---

## Example Output

```markdown
## v0.2.0 - March 2026

### New
- Muscle recovery heatmap: see which muscle groups are ready to train and which need more rest
- Shareable workout cards: generate an image of your completed workout for Instagram Stories
- Weekly challenges: compete with friends for most volume, most consistent, or longest streak

### Improved
- Program loading screen: now shows your personalized timeline and live preview as the program builds
- Exercise cards: research rationale now expandable for every exercise

### Fixed
- Rest timer now vibrates on completion
- Program would sometimes show the same day twice in the weekly view
```
