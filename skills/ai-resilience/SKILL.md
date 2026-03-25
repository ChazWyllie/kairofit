---
name: ai-resilience
description: >
  Circuit breaker, model routing, Batch API, and graceful degradation for all KairoFit
  AI endpoints. Use this skill BEFORE building any Server Action or Route Handler that
  calls the Claude API. Without this pattern, every AI endpoint fails visibly when the
  Claude API is unavailable - including the highest-stakes screen in the product (screen 22,
  the live program preview). Triggers when: implementing generateProgramAction,
  generateDebriefAction, adjustProgramAction, any other Anthropic SDK call, or when
  adding new AI features to the codebase.
---

# AI Resilience Patterns

Every AI endpoint in KairoFit must implement resilience.
The Claude API will be unavailable occasionally. Screen 22 (live program preview) is the
highest-stakes first impression in the product. An unhandled error there loses the user.

---

## Model Routing Decision Tree

| Task | Model | Reason |
|---|---|---|
| Workout program generation | claude-sonnet-4-20250514 | Needs reasoning + structured output quality |
| Post-workout debrief | claude-sonnet-4-20250514 | Personalized coaching, nuanced |
| Program adjustment | claude-sonnet-4-20250514 | Complex reasoning about changes |
| Intake interview (multi-turn) | claude-sonnet-4-20250514 | Conversational intelligence |
| Safety classification | claude-haiku-4-5-20251001 | Fast, cheap, sufficient for classification |
| Exercise substitution | claude-haiku-4-5-20251001 | Simple mapping task |
| LLM-as-judge quality check | claude-haiku-4-5-20251001 | Evaluation, not generation |
| Batch pre-computation | claude-haiku-4-5-20251001 | Cost - 50% Batch API discount + cheaper model |

Cost difference: Sonnet is 3.75x more expensive than Haiku per token.
Always use Haiku for classification, evaluation, and simple tasks.

---

## The Degradation Hierarchy

For program generation (the most critical path), degrade in this exact sequence:

```
1. Full AI generation (Sonnet + Structured Outputs)
   ↓ if fails or circuit open
2. Cached similar response from Redis (match by goal + experience_level + days_per_week)
   ↓ if no cache hit
3. Simplified generation with Haiku (lower quality but faster/cheaper)
   ↓ if Haiku also unavailable
4. Pre-computed fallback program from Supabase (seeded, validated programs)
   ↓ if database unavailable (catastrophic failure)
5. Static content with "AI temporarily unavailable - your program will generate when service resumes"
```

For debrief generation (lower stakes):
```
1. Sonnet streaming generation
   ↓ if fails
2. Static debrief template: "Your session is logged. AI analysis will be available shortly."
```

---

## Circuit Breaker Implementation

```typescript
// src/lib/ai/circuit-breaker.ts

type CircuitState = 'closed' | 'open' | 'half-open'

class AICircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private lastFailureTime = 0
  private readonly threshold = 5        // failures before opening
  private readonly timeout = 5 * 60 * 1000  // 5 minutes before retry

  canRequest(): boolean {
    if (this.state === 'closed') return true

    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
        return true
      }
      return false
    }

    // half-open: allow one request through
    return true
  }

  recordSuccess(): void {
    this.state = 'closed'
    this.failures = 0
  }

  recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }

  isOpen(): boolean {
    return this.state === 'open'
  }
}

// Module-level singleton - persists across requests in the same process
export const programGenerationBreaker = new AICircuitBreaker()
export const debriefBreaker = new AICircuitBreaker()
```

---

## Pre-Computed Fallback Programs

The schema needs a fallback_programs table. Each row is a validated, pre-generated program
covering a specific combination of: goal + experience_level + days_per_week + equipment_type.

Seed these programs so they exist before launch:

```sql
-- supabase/seed/fallback-programs.sql
-- Equipment type buckets:
-- 'full_gym': barbells + cables + machines
-- 'dumbbells_only': dumbbells + bench
-- 'home': resistance bands + bodyweight
-- 'bodyweight': no equipment

CREATE TABLE public.fallback_programs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal text NOT NULL,
  experience_level int NOT NULL,
  days_per_week int NOT NULL,
  equipment_type text NOT NULL,
  program_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- No RLS on fallback_programs - read by all, written by service role only
ALTER TABLE public.fallback_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fallback_programs_read" ON public.fallback_programs
  FOR SELECT USING (auth.role() = 'authenticated');
```

Generate the seed data offline (using the Batch API for cost efficiency) and check it into:
supabase/seed/fallback-programs.sql

Minimum coverage (goal x level x days x equipment = 5 x 5 x 4 x 4 = 400 combinations):
Use Haiku via the Batch API to generate all 400 at 50% discount.
Validate each with validateWorkoutProgram() before seeding.

---

## Structured Outputs (use this instead of JSON prompting)

The current workout-generator.ts instructs Claude to "Output ONLY valid JSON" in text.
This fails occasionally. Use Anthropic's Structured Outputs API instead.

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'

// Define the schema with Zod first
const GeneratedExerciseSchema = z.object({
  exercise_name: z.string(),
  sets: z.number().int(),
  reps_min: z.number().int(),
  reps_max: z.number().int(),
  rest_seconds: z.number().int(),
  rpe_target: z.number().int().nullable(),
  rationale: z.string(),
  progression_scheme: z.enum(['linear', 'double_progression', 'rpe_based', 'maintain']),
  modification_note: z.string().nullable(),
})

// Convert to JSON Schema for Anthropic
const jsonSchema = zodToJsonSchema(GeneratedProgramSchema)

// Use output_config in the API call
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  system: getKiroSystemPrompt('generation'),
  messages: [{ role: 'user', content: prompt }],
  output_config: {
    format: {
      type: 'json_schema',
      json_schema: {
        name: 'workout_program',
        schema: jsonSchema,
        strict: true,
      }
    }
  }
})

// STILL validate post-response - Structured Outputs does not enforce numerical constraints
// Sets ≤ 10, reps ≤ 50, rest ≥ 30 must still be checked by workout-validator.ts
const program = JSON.parse(response.content[0].text) as GeneratedProgram
const validation = validateWorkoutProgram(program, experienceLevel, injuries, equipment)
if (!validation.valid) { /* handle */ }
```

Key nuance: `strict: true` enforces schema shape but NOT numerical ranges.
The validator is still required. Structured Outputs and the validator are complementary.

---

## Full Generation Function with Resilience

```typescript
export async function generateProgramWithResilience(
  profile: UserProfile,
  redis: Redis
): Promise<{ program: GeneratedProgram; source: 'ai' | 'cache' | 'haiku' | 'fallback' | 'static' }> {
  // Check circuit breaker
  if (!programGenerationBreaker.canRequest()) {
    return fallbackToPrecomputed(profile)
  }

  // Try Redis cache first (same goal + level + days = high chance of a hit)
  const cacheKey = `program:${profile.goal}:${profile.experience_level}:${profile.days_per_week}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return { program: JSON.parse(cached as string), source: 'cache' }
  }

  try {
    // Attempt full Sonnet generation
    const program = await generateWithSonnet(profile)
    programGenerationBreaker.recordSuccess()

    // Cache for 1 hour (same profile often regenerates during dev)
    await redis.set(cacheKey, JSON.stringify(program), { ex: 3600 })

    return { program, source: 'ai' }

  } catch (error) {
    programGenerationBreaker.recordFailure()
    console.error('Sonnet generation failed:', error)

    // Try Haiku fallback
    try {
      const program = await generateWithHaiku(profile)
      return { program, source: 'haiku' }
    } catch {
      return fallbackToPrecomputed(profile)
    }
  }
}

async function fallbackToPrecomputed(
  profile: UserProfile
): Promise<{ program: GeneratedProgram; source: 'fallback' | 'static' }> {
  const supabase = createServiceRoleClient()
  const equipmentType = classifyEquipment(profile.equipment)

  const { data } = await supabase
    .from('fallback_programs')
    .select('program_json')
    .eq('goal', profile.goal)
    .eq('experience_level', profile.experience_level)
    .eq('days_per_week', profile.days_per_week)
    .eq('equipment_type', equipmentType)
    .single()

  if (data) {
    return { program: data.program_json as GeneratedProgram, source: 'fallback' }
  }

  // Last resort: static content
  return {
    program: getStaticFallbackProgram(profile),
    source: 'static',
  }
}
```

---

## Batch API for Pre-Computing Fallback Library

The Anthropic Batch API provides a 50% price discount for non-real-time generation.
Use it to pre-generate the 400 fallback programs offline.

```typescript
// scripts/generate-fallback-programs.ts (run once, offline)
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const combinations = generateAllCombinations() // 400 goal x level x days x equipment

const batch = await client.messages.batches.create({
  requests: combinations.map((combo, i) => ({
    custom_id: `fallback-${i}`,
    params: {
      model: 'claude-haiku-4-5-20251001',  // Haiku for cost - 50% Batch discount on top
      max_tokens: 4096,
      system: getKiroSystemPrompt('generation'),
      messages: [{ role: 'user', content: buildFallbackPrompt(combo) }],
    }
  }))
})

// Poll for completion, validate each, write to seed file
```

---

## UI Handling for Degraded States

Screen 22 must communicate degraded states gracefully:

- `source: 'ai'`: normal experience, live preview streams in real time
- `source: 'haiku'`: show normally - users cannot tell the difference in quality
- `source: 'fallback'`: show "We used a pre-built program for your profile. You can regenerate anytime."
- `source: 'static'`: show "AI service is temporarily busy. Your program will be ready in a few minutes." with a retry button that polls every 30 seconds

Never show a raw error message to a user on screen 22.
