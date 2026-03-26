---
name: server-action-builder
description: >
  Canonical patterns for building Server Actions in KairoFit using next-safe-action v7.
  Use this skill EVERY TIME you create a new Server Action. This is the highest-risk
  implementation area in the codebase - inconsistent patterns across actions have caused
  unprotected AI endpoints, missing auth checks, and skipped rate limits in other projects.
  Triggers when: creating any file in src/actions/, writing any 'use server' function,
  implementing any form submission, creating any mutation that touches Supabase or the
  Claude API. Read this before writing a single line of any Server Action.
---

# Server Action Builder

Every mutation in KairoFit goes through a Server Action.
Every Server Action follows this exact pattern. No exceptions.

## The Canonical Pattern (next-safe-action v7)

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

// Initialize safe action client with middleware chain
// This client is shared across all actions in the file
const action = createSafeActionClient().use(async ({ next }) => {
  // Middleware 1: Auth check
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }
  // Pass user to action context
  return next({ ctx: { user, supabase } })
})

// Example action using the authenticated client
export const exampleAction = action
  .schema(
    z.object({
      field: z.string().min(1).max(100),
    })
  )
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    // Rate limiting (for expensive operations)
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.GENERAL)

    // Your logic here
    const { data, error } = await supabase
      .from('some_table')
      .insert({ user_id: user.id, ...parsedInput })
      .select('id, field')
      .single()

    if (error) throw new Error(`Operation failed: ${error.message}`)
    return data
  })
```

## AI Actions (additional safety layer)

For any action that calls the Claude API:

```typescript
import { checkInputSafety } from '@/lib/ai/safety-filter'
import { RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

const aiAction = createSafeActionClient().use(async ({ next }) => {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Authentication required')
  return next({ ctx: { user, supabase } })
})

export const generateProgramAction = aiAction
  .schema(z.object({ confirm_generation: z.literal(true) }))
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    // AI endpoints get stricter rate limiting
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_GENERATE)

    // Load profile (needed to generate - not passed from client)
    const { data: profile } = await supabase
      .from('profiles')
      .select('goal, experience_level, days_per_week, equipment, injuries, ...')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error('Profile not found')

    // Generate via Kiro
    const program = await generateProgram(profile)

    // ALWAYS validate before saving
    const validation = validateWorkoutProgram(
      program,
      profile.experience_level,
      profile.injuries,
      profile.equipment
    )
    if (!validation.valid) {
      throw new Error(`Generated program failed validation: ${validation.errors[0].message}`)
    }

    // Save to DB
    const { data, error } = await supabase
      .from('programs')
      .insert({ user_id: user.id, ...program })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to save program: ${error.message}`)
    return data
  })
```

## Calling Actions from Client Components

```typescript
'use client'
import { useAction } from 'next-safe-action/hooks'
import { logSetAction } from '@/actions/workout.actions'

function SetLogger() {
  const { execute, status, result } = useAction(logSetAction)

  function handleLog() {
    execute({
      session_id: 'uuid...',
      exercise_id: 'uuid...',
      reps_completed: 8,
      weight_kg: 60,
    })
  }

  if (status === 'executing') return <div>Saving...</div>
  if (result.serverError) return <div>Failed: {result.serverError}</div>

  return <button onClick={handleLog}>Log Set</button>
}
```

## Rate Limit Keys (use the right key for each action)

```typescript
import { RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

// AI generation: 3 per 5 minutes
await checkRateLimit(userId, RATE_LIMIT_KEYS.AI_GENERATE)

// AI debrief: 5 per minute
await checkRateLimit(userId, RATE_LIMIT_KEYS.AI_DEBRIEF)

// General mutations: 30 per minute
await checkRateLimit(userId, RATE_LIMIT_KEYS.GENERAL)
```

## Rules

1. Every action must have a Zod schema - no schema means no validation
2. Every action must check auth - even if RLS handles it, fail fast in the action
3. AI actions must check rate limits with AI-specific keys
4. AI actions must pass output through validateWorkoutProgram before saving
5. Never pass user_id from the client - always use auth.getUser() server-side
6. Use ctx to pass supabase client between middleware and action - do not create a new client in the action body
7. Throw meaningful errors - the client shows server errors to users
8. Use next-safe-action v7 API - not v6. The client and middleware API changed significantly.

## File Organization

```
src/actions/
  workout.actions.ts    # logSetAction, startSessionAction, completeSessionAction
  program.actions.ts    # generateProgramAction, adjustProgramAction, swapExerciseAction
  profile.actions.ts    # updateProfileAction, logMeasurementAction
  onboarding.actions.ts # saveOnboardingStepAction, completeOnboardingAction
  social.actions.ts     # followUserAction, unfollowUserAction
```
