/**
 * Generate Fallback Programs
 *
 * Pre-generates the fallback_programs table using the Anthropic Batch API.
 * Run once before launch. Uses Haiku via Batch API for 50% cost discount.
 *
 * The fallback_programs table is the 4th tier in the AI resilience degradation chain:
 * Sonnet -> Redis cache -> Haiku -> Supabase fallback -> static content
 *
 * Without this seeded, the Supabase fallback tier always returns nothing and
 * the static placeholder becomes the final fallback.
 *
 * Usage: npm run generate:fallbacks
 *
 * TODO: Implement full generation.
 * The stub below documents the intended structure and approach.
 * Implement after workout generation is verified working in production.
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// All combination dimensions
const GOALS = ['muscle', 'fat_loss', 'strength', 'fitness', 'recomposition'] as const
const LEVELS = [1, 2, 3, 4, 5] as const
const DAYS = [2, 3, 4, 5, 6] as const
const EQUIPMENT_TYPES = ['full_gym', 'dumbbells_only', 'home', 'bodyweight'] as const

// 5 x 5 x 5 x 4 = 500 combinations
function generateAllCombinations() {
  const combos = []
  for (const goal of GOALS) {
    for (const level of LEVELS) {
      for (const days of DAYS) {
        for (const equipment of EQUIPMENT_TYPES) {
          combos.push({ goal, level, days, equipment })
        }
      }
    }
  }
  return combos
}

async function main() {
  const combinations = generateAllCombinations()
  console.log(`Generating ${combinations.length} fallback programs via Batch API...`)
  console.log('Using claude-haiku with 50% Batch API discount...')

  // TODO: Implement batch creation
  // const batch = await client.messages.batches.create({
  //   requests: combinations.map((combo, i) => ({
  //     custom_id: `fallback-${i}-${combo.goal}-${combo.level}-${combo.days}-${combo.equipment}`,
  //     params: {
  //       model: 'claude-haiku-4-5-20251001',
  //       max_tokens: 3000,
  //       tools: [PROGRAM_TOOL],
  //       tool_choice: { type: 'tool', name: 'create_workout_program' },
  //       messages: [{ role: 'user', content: buildFallbackPrompt(combo) }],
  //     }
  //   }))
  // })
  //
  // Poll until complete, validate each with validateWorkoutProgram(),
  // then INSERT to fallback_programs via Supabase service role client.

  console.log('TODO: Implement batch generation. See skills/ai-resilience/SKILL.md.')
  process.exit(0)
}

main().catch(console.error)
