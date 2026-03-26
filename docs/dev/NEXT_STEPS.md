# KairoFit - Next Steps

## What was just built (onboarding screens 10-23)

All 23 onboarding quiz screens are complete. TypeScript passes with 0 errors.

Screens built:

- Step 10: `body-composition` - height + weight + optional body fat (dual_field)
- Step 11: `why-now` - 6 motivation options (single_select auto_advance)
- Steps 12-15: `psych-1` through `psych-4` - 5-point Likert scale (single_select auto_advance)
- Step 16: `archetype-reveal` - computes archetype from psych scores, shows card (continue_only)
- Step 17: `email-gate` - email input, disabled until valid format (text_input)
- Step 18: `equipment` - 9 equipment options, requires 1+ selection (multi_select)
- Step 19: `split-preference` - 4 training split options (single_select auto_advance)
- Step 20: `workout-time` - 5 time preferences with descriptions (single_select auto_advance)
- Step 21: `other-training` - 7 options with 'none' mutual exclusion (multi_select)
- Step 22: `sleep` - 4 sleep range options (single_select auto_advance)
- Step 23: `program-building` - loading stub with 5s auth_ready check

The email-gate (step 17) and program-building (step 23) have TODOs waiting for server actions.

---

## What to build next: Auth + Onboarding-to-DB Flow

The goal is a working end-to-end path:
**quiz complete -> create account -> AI generates program -> dashboard**

### Problem: Zustand store is in-memory

When a user clicks a magic link email, the browser reloads and wipes the Zustand store.
Fix: add `persist` middleware to `src/stores/onboarding.store.ts`.

```typescript
// src/stores/onboarding.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware' // add this

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    // wrap with persist
    (set) => ({ ...initialState, ...actions }),
    { name: 'kairofit-onboarding' } // localStorage key
  )
)
```

### Files to create

#### 1. `src/app/auth/callback/route.ts` - Auth callback route

Handles the magic link redirect after email verification:

```typescript
import { createServerClient } from '@/lib/db/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding/program-building'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
```

#### 2. `src/actions/onboarding.actions.ts` - Three server actions

Uses `next-safe-action` v7 (same pattern as `src/actions/workout.actions.ts`).

**`createAccountAction`** - sends OTP magic link:

- Input: `{ email: string }` validated with `onboardingEmailSchema` (already in schemas.ts)
- Rate limit with `RATE_LIMIT_KEYS.AUTH`
- `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: origin + '/auth/callback' } })`
- Return `{ success: true }`
- DB trigger `handle_new_user()` auto-creates blank profiles row on first sign-in

**`saveOnboardingProfileAction`** - saves all phase 1-5 data to profiles table:

- Input: full onboarding state fields (goal, experience_level, archetype, equipment, injuries, etc.)
- Requires auth - `supabase.auth.getUser()`
- `UPDATE profiles SET ... WHERE id = user.id`
- Set `onboarding_completed_at = NOW()`

**`generateProgramAction`** - runs AI generation and saves program:

- No input (reads profile from DB)
- Requires auth
- Rate limit with `RATE_LIMIT_KEYS.AI_GENERATE`
- Call `generateProgram(profile)` from `src/lib/ai/workout-generator.ts` (already complete)
- Insert generated program into `programs`, `program_days`, `program_exercises` tables
- Return `{ programId: string }`

#### 3. `src/lib/db/queries/profiles.ts` - Profile queries

```typescript
export async function getProfileForGeneration(userId: string): Promise<UserProfile>
```

Loads full profile for the AI generator. Select specific columns - never `select('*')`.

Also extend `src/lib/db/queries/programs.ts` with `saveProgramToDb(userId, program)`.

### Files to modify

#### `src/app/onboarding/email-gate/page.tsx`

Wire `createAccountAction` into the submit handler:

```typescript
import { createAccountAction } from '@/actions/onboarding.actions'
import { useTransition } from 'react'

const [isPending, startTransition] = useTransition()

function handleSubmit() {
  setEmail(localEmail)
  setAuthReady(false)
  startTransition(async () => {
    const result = await createAccountAction({ email: localEmail })
    if (result?.data?.success) {
      setAuthReady(true)
    }
    nextStep()
    router.push('/onboarding/equipment')
  })
}
```

Disable the button while `isPending`.

#### `src/app/onboarding/program-building/page.tsx`

Replace the stub setTimeout with real action calls:

```typescript
useEffect(() => {
  if (phase !== 'generating') return

  async function run() {
    await saveOnboardingProfileAction({ goal, experience_level, archetype, ... })
    const result = await generateProgramAction()
    if (result?.data?.programId) {
      router.push('/dashboard')
    }
  }
  run()
}, [phase])
```

#### `src/app/(app)/dashboard/page.tsx` - create minimal dashboard

- Server component
- `const program = await getActiveProgram(userId)` (already implemented)
- Show program name + day list
- If no program yet: spinner + "Program is being generated..."

#### `src/app/(auth)/login/page.tsx` - wire OTP form

Replace stub with working magic link form:

- Email input
- Submit calls `createAccountAction({ email })`
- Show "Check your email" confirmation state

---

## How to run on Mac

```bash
# Clone and install
git clone <repo-url>
cd kairofit
npm install

# Set up environment
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
# Also needed: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

# Set up Supabase
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push        # apply schema + triggers
npm run db:types       # generate TypeScript types  <- REQUIRED before dev
npm run db:seed        # seed exercise library

# Run
npm run dev            # localhost:3000
```

**Important**: `npm run db:types` MUST run after `db:push`. Skipping it causes a TypeScript
missing-module error that looks like a setup failure but isn't.

---

## Key files reference

| File                                         | Status                   | Purpose                                          |
| -------------------------------------------- | ------------------------ | ------------------------------------------------ |
| `src/lib/ai/workout-generator.ts`            | Complete                 | AI program generation with full resilience chain |
| `src/lib/ai/workout-validator.ts`            | Complete                 | Post-generation constraint enforcement           |
| `src/lib/utils/progressive-overload.ts`      | Complete                 | Deterministic overload calculations              |
| `src/lib/db/supabase.ts`                     | Complete                 | Browser + server Supabase clients                |
| `src/middleware.ts`                          | Complete                 | Auth route protection                            |
| `src/stores/onboarding.store.ts`             | Complete (needs persist) | All onboarding quiz state                        |
| `src/actions/workout.actions.ts`             | Complete                 | Log set, start/complete sessions                 |
| `src/actions/onboarding.actions.ts`          | TODO                     | Create account, save profile, generate program   |
| `src/app/onboarding/`                        | Complete                 | All 23 screens                                   |
| `src/app/(app)/dashboard/`                   | TODO                     | Home screen after login                          |
| `supabase/migrations/001_initial_schema.sql` | Complete                 | Full DB schema + RLS + triggers                  |
