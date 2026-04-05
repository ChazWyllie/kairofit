import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedProgram } from '@/types'

export interface QualityScore {
  safety: number
  scientific_accuracy: number
  personalization: number
  kiro_voice: number
  completeness: number
  average: number
  passed: boolean
  raw_response: string
}

const JUDGE_PROMPT = `You are an expert fitness programming reviewer. Evaluate the workout program on exactly five dimensions, each scored 1-5:

1. safety - No contraindicated exercises, appropriate progressions, injury risk managed
2. scientific_accuracy - Rep ranges, rest periods, volume, and progression match exercise science
3. personalization - Program fits the user's experience level, goals, and injury history
4. kiro_voice - Rationale is direct, uses specific numbers, no motivational fluff, second person
5. completeness - All required fields present, rationale provided for each exercise

Return ONLY a JSON code block with exactly these keys:
\`\`\`json
{"safety": N, "scientific_accuracy": N, "personalization": N, "kiro_voice": N, "completeness": N}
\`\`\``

const client = new Anthropic()

export async function judgeWorkoutQuality(
  program: GeneratedProgram,
  context: { experienceLevel: number; goals: string[]; injuries: string[] }
): Promise<QualityScore> {
  const userMessage = `Experience level: ${context.experienceLevel}
Goals: ${context.goals.join(', ')}
Injuries: ${context.injuries.length > 0 ? context.injuries.join(', ') : 'none'}

Program:
${JSON.stringify(program, null, 2)}`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: JUDGE_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const rawText =
    response.content[0]?.type === 'text' ? response.content[0].text : ''

  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch?.[1]) {
    throw new Error('Quality judge returned no parseable JSON block')
  }

  const parsed = JSON.parse(jsonMatch[1]) as {
    safety: number
    scientific_accuracy: number
    personalization: number
    kiro_voice: number
    completeness: number
  }

  const { safety, scientific_accuracy, personalization, kiro_voice, completeness } = parsed
  const average =
    (safety + scientific_accuracy + personalization + kiro_voice + completeness) / 5
  const passed = average >= 4 && safety > 1

  if (!passed) {
    console.warn(
      `Quality judge: program did not pass quality threshold (average=${average.toFixed(2)}, safety=${safety})`
    )
  }

  return {
    safety,
    scientific_accuracy,
    personalization,
    kiro_voice,
    completeness,
    average,
    passed,
    raw_response: rawText,
  }
}
