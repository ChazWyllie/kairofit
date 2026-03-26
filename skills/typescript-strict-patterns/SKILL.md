---
name: typescript-strict-patterns
description: >
  KairoFit TypeScript strict mode patterns and gotchas. Use when writing any
  TypeScript, hitting type errors from strict flags, or adding new files to
  the project. Covers noUncheckedIndexedAccess, exactOptionalPropertyTypes,
  noUnusedLocals/Parameters, tsconfig excludes, and library-specific quirks.
---

# TypeScript Strict Patterns

## Active strict flags in tsconfig.json

Beyond `"strict": true`, four additional flags are enabled:

```json
{
  "noUncheckedIndexedAccess": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
}
```

Each flag has specific patterns that will fail to compile if you don't know them.

---

## noUncheckedIndexedAccess

Array and object index access returns `T | undefined`, not `T`.

```typescript
// WRONG - TypeScript error: 'number | undefined' is not assignable to 'number'
const scores: number[] = [3, 4, 2, 5]
const first: number = scores[0]

// CORRECT - use optional chaining
const first = scores[0]?.toString()

// CORRECT - use non-null assertion when you are certain the index exists
// Only use ! when you have just checked .length or the index is structurally guaranteed
const value = scores[0]!
```

**In the onboarding store (psych scores specifically):**
```typescript
// CORRECT pattern for accessing psych_scores array
const currentValue = psych_scores[0]?.toString()

// When passing to a function expecting a 4-element tuple:
// setPsychScore(0, parseInt(value, 10)) - this is fine, it's a setter not a getter
```

**In loops where index is always valid:**
```typescript
for (let i = 0; i < items.length; i++) {
  const item = items[i]!  // guaranteed by loop bounds
  // ...
}

// OR use for...of which avoids indexing entirely
for (const item of items) {
  // item is T, not T | undefined
}
```

**Object index signatures:**
```typescript
const map: Record<string, number> = {}
const value = map['key']  // type is number | undefined, not number
if (value !== undefined) {
  console.log(value + 1)  // safe
}
```

---

## exactOptionalPropertyTypes

Optional properties in TypeScript types cannot be assigned `undefined` explicitly
when `exactOptionalPropertyTypes` is enabled. The difference:

```typescript
interface WithOptional {
  name?: string  // means: property may be ABSENT - not the same as { name: undefined }
}

// WRONG - exactOptionalPropertyTypes error
const obj: WithOptional = { name: undefined }

// CORRECT - omit the property entirely
const obj: WithOptional = {}

// CORRECT - use null if you need an explicit empty signal
interface WithNullable {
  name: string | null
}
const obj: WithNullable = { name: null }
```

**Common pain point - Zod .optional() vs Supabase nullable columns:**

Zod's `.optional()` produces `T | undefined`. Supabase nullable columns expect `T | null`.
These are not compatible under `exactOptionalPropertyTypes`.

```typescript
// Zod schema
const schema = z.object({
  body_fat_pct: z.number().optional()  // produces number | undefined
})

// Supabase update - nullable column expects number | null
const { error } = await supabase
  .from('profiles')
  .update({
    // WRONG: number | undefined is not assignable to number | null
    body_fat_pct: parsed.body_fat_pct,

    // CORRECT: convert undefined to null explicitly
    body_fat_pct: parsed.body_fat_pct ?? null,
  })
```

Always apply `?? null` when writing optional Zod fields to Supabase nullable columns.

---

## noUnusedLocals

Module-level `const` declarations that are never used cause a compile error.
The `_` prefix convention does NOT suppress this for locals - only for parameters.

```typescript
// WRONG - unused local, causes error even with _ prefix
const _unusedHelper = computeSomething()

// CORRECT - delete it if it is unused
// (If you need it for documentation only, leave it as a comment instead)
```

**For imports:** unused imports are caught by `noUnusedLocals` too.
```typescript
// WRONG - imported but never used
import { format } from 'date-fns'

// CORRECT - remove the import or use the symbol
```

---

## noUnusedParameters

Function parameters that are never used cause a compile error.
The `_` prefix DOES suppress this for parameters (unlike locals).

```typescript
// WRONG - unused parameter
function process(data: string, options: ProcessOptions): string {
  return data.trim()
  // options is never used - error
}

// CORRECT option 1 - prefix with _
function process(data: string, _options: ProcessOptions): string {
  return data.trim()
}

// CORRECT option 2 - use the parameter
function process(data: string, options: ProcessOptions): string {
  return options.trim ? data.trim() : data
}
```

**Callback patterns:**
```typescript
// When an event handler must match a specific signature but you don't use all args:
items.map((_item, index) => index)
// _item suppresses the unused warning; index is used
```

---

## tsconfig excludes

These files are excluded from type-checking:

```json
"exclude": [
  "node_modules",
  "src/app/sw.ts",
  "playwright.config.ts",
  "scripts/**",
  "supabase/functions/**"
]
```

**Why `src/app/sw.ts` is excluded:**
The service worker file uses `ServiceWorkerGlobalScope` types and Background Sync API
types that conflict with standard DOM types. It also imports from `@serwist/sw` which
has its own type declarations. Excluding it prevents type pollution into the rest of the app.

**Why `scripts/**` is excluded:**
Scripts run with `ts-node` or `tsx` directly, not compiled through Next.js.
They may import Anthropic SDK in ways that conflict with client-safe rules.

**If you need to type-check an excluded file**, run TypeScript directly:
```bash
npx tsc --noEmit --project tsconfig.json path/to/file.ts
# Won't work for excluded files - they are excluded globally

# For scripts, use ts-node's type-check mode:
npx tsx --check scripts/generate-fallback-programs.ts
```

---

## Library-specific gotchas

### Dexie.js table types

Dexie 3.x uses `Table<T, TKey>`, not the `EntityTable` export from older docs.

```typescript
import Dexie, { type Table } from 'dexie'

class KairoDb extends Dexie {
  workoutSets!: Table<LocalWorkoutSet, string>  // Table<RowType, PrimaryKeyType>
}
```

If TypeScript shows `EntityTable is not exported from 'dexie'`, you are reading
Dexie 4.x docs. This project uses Dexie 3.x.

### Serwist default import

`@serwist/next` and `@serwist/sw` use default exports, not named exports:

```typescript
// CORRECT
import { installSerwist } from '@serwist/sw'
import { defaultCache } from '@serwist/next/worker'

// In next.config.ts:
import withSerwist from '@serwist/next'  // default import
```

### framer-motion in App Router

Any component using `motion.*` must be a Client Component:

```typescript
'use client'
import { motion } from 'framer-motion'
```

TypeScript will not catch this - it is a runtime error. If you see:
`Error: (0 , _framerMotion.motion) is not a function`
you forgot `'use client'`.

### next-safe-action v7 typed results

The `result.data` field is typed based on the action's return schema.
Access it with optional chaining - it is `undefined` if the action failed:

```typescript
const result = await createAccountAction({ email })
if (result?.data?.success) {
  // success path
}
// result.serverError, result.validationErrors are the failure paths
```

---

## Running the type check

```bash
cd "C:\Projects\kairofit"
npm run typecheck
```

This runs `tsc --noEmit` respecting the full tsconfig including all strict flags.
Run it before every commit. The CI gate will fail if it does not pass.

**Common false negatives on first run:**
- `src/types/supabase.generated.ts` missing: run `npm run db:types` first
- Import path errors: check that `@/` paths resolve correctly via `paths` in tsconfig

---

## Quick reference

| Flag | What it does | Common fix |
|------|-------------|-----------|
| `noUncheckedIndexedAccess` | `arr[i]` returns `T \| undefined` | Use `?.` or `!` when certain |
| `exactOptionalPropertyTypes` | `{ prop?: T }` cannot be `{ prop: undefined }` | Use `?? null` for DB writes |
| `noUnusedLocals` | Unused `const`/`import` = error | Delete unused code |
| `noUnusedParameters` | Unused param = error | Prefix with `_` |
| excludes | `sw.ts`, `scripts/**` not checked | Expected - do not add to includes |
