/**
 * Kiro Safety Filter
 *
 * Every user input that goes to Claude passes through this module first.
 * This is a hard architectural rule - see CLAUDE.md.
 *
 * Three layers:
 * 1. Fast pattern matching (no API cost, runs first)
 * 2. Domain boundary enforcement (keeps Kiro in fitness territory)
 * 3. Haiku classification for borderline cases (minimal cost)
 *
 * Returns a SafetyResult. If safe=false, the caller MUST NOT send to Claude.
 * The reason string is for logging only - never show it to the user.
 * Show a generic "I can only help with training questions" message instead.
 */

import Anthropic from '@anthropic-ai/sdk'

export interface SafetyResult {
  safe: boolean
  reason: string | null
  category: SafetyCategory | null
}

export type SafetyCategory =
  | 'medical_diagnosis'      // "Do I have X condition?"
  | 'extreme_restriction'    // Dangerous calorie deficits or starvation protocols
  | 'eating_disorder'        // Content that could enable disordered eating
  | 'injury_override'        // "Ignore my shoulder injury and give me overhead press anyway"
  | 'ped_request'            // Steroid cycles, PED protocols
  | 'out_of_scope'           // Completely unrelated to fitness/health
  | 'safe'

// ============================================================
// BLOCKED PATTERNS (fast, no API cost)
// ============================================================

// Each entry: [pattern, category, reason]
const BLOCKED_PATTERNS: Array<[RegExp, SafetyCategory, string]> = [
  // Medical diagnosis attempts
  [/do i have (diabetes|cancer|injury|torn|herniated|arthritis)/i, 'medical_diagnosis', 'Medical diagnosis request'],
  [/am i (diabetic|injured|sick|ill)/i, 'medical_diagnosis', 'Medical self-diagnosis'],
  [/diagnose/i, 'medical_diagnosis', 'Diagnosis request'],

  // Extreme restriction
  [/\b([0-9]{1,3})\s*calories\s*(per day|daily|a day)/i, 'extreme_restriction', 'Potential extreme calorie restriction'],
  [/starvation|crash diet|500 calorie/i, 'extreme_restriction', 'Extreme restriction keyword'],

  // Eating disorder signals
  [/how to (purge|make myself sick|vomit after)/i, 'eating_disorder', 'Purging behavior'],
  [/thinspo|fitspo.*starvation|pro.?ana/i, 'eating_disorder', 'Eating disorder community reference'],

  // Injury override attempts
  [/ignore (my|the) (injury|pain|shoulder|knee|back)/i, 'injury_override', 'Injury override attempt'],
  [/i don.t care about (my|the) (injury|pain)/i, 'injury_override', 'Injury disregard'],

  // PED requests
  [/steroid (cycle|protocol|dose)/i, 'ped_request', 'Steroid protocol request'],
  [/\b(trenbolone|testosterone|sarms|winstrol|anavar)\s+(cycle|dose|protocol)/i, 'ped_request', 'PED protocol request'],
  [/how (to|do i) use (steroids|sarms|peds)/i, 'ped_request', 'PED usage request'],
]

// ============================================================
// EXTREME RESTRICTION CHECK
// ============================================================

function detectExtremeRestriction(input: string): boolean {
  // Only flag explicit daily total language to avoid blocking legitimate nutrition discussion.
  // "My lunch was 500 calories" is fine. "I want to eat 500 calories a day" is dangerous.
  // The original broad pattern blocked normal fitness conversations about meal calories,
  // workout burn estimates, and food tracking.
  const dailyTotalMatch = input.match(
    /\b(\d{3,4})\s*(?:cal(?:ories?)?|kcal)\s*(?:per day|a day|daily|total)/i
  )
  if (dailyTotalMatch) {
    const calories = parseInt(dailyTotalMatch[1], 10)
    if (calories < 800) return true
  }
  return false
}

// ============================================================
// MAIN SAFETY CHECK
// ============================================================

/**
 * Check user input for safety before sending to Claude.
 *
 * Usage:
 * ```typescript
 * const safety = await checkInputSafety(userMessage)
 * if (!safety.safe) {
 *   return 'I can only help with fitness and training questions.'
 * }
 * // safe to send to Claude
 * ```
 */
export async function checkInputSafety(input: string): Promise<SafetyResult> {
  const trimmed = input.trim()

  // Empty input is safe (let Claude handle gracefully)
  if (!trimmed) {
    return { safe: true, reason: null, category: 'safe' }
  }

  // Layer 1: Fast pattern matching
  for (const [pattern, category, reason] of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { safe: false, reason, category }
    }
  }

  // Additional extreme restriction check
  if (detectExtremeRestriction(trimmed)) {
    return {
      safe: false,
      reason: 'Detected extremely low calorie target',
      category: 'extreme_restriction',
    }
  }

  // Layer 2: Domain boundary check (fast heuristic - no API needed)
  // If the input is very long and has no fitness-related terms, flag for review
  const fitnessTerms = /\b(workout|exercise|training|gym|muscle|strength|cardio|sets|reps|lift|squat|deadlift|bench|program|split|recovery|protein|nutrition|weight|body|fitness|run|swim|cycle)\b/i
  const isVeryLong = trimmed.length > 500
  const hasFitnessContext = fitnessTerms.test(trimmed)

  if (isVeryLong && !hasFitnessContext) {
    // Long input with no fitness context - likely out of scope
    // Use a fast Haiku check instead of blocking outright
    return await classifyWithHaiku(trimmed)
  }

  return { safe: true, reason: null, category: 'safe' }
}

// ============================================================
// HAIKU CLASSIFICATION (borderline cases only)
// ============================================================

const client = new Anthropic()

async function classifyWithHaiku(input: string): Promise<SafetyResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Is this message related to fitness, exercise, nutrition, or training? Answer only YES or NO.\n\nMessage: "${input.slice(0, 200)}"`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : 'YES'
    const isFitnessRelated = text.toUpperCase().startsWith('YES')

    if (!isFitnessRelated) {
      return {
        safe: false,
        reason: 'Message classified as out of scope by safety filter',
        category: 'out_of_scope',
      }
    }

    return { safe: true, reason: null, category: 'safe' }
  } catch {
    // If classification fails, default to safe (do not block users due to infrastructure issues)
    console.error('Safety filter Haiku classification failed - defaulting to safe')
    return { safe: true, reason: null, category: 'safe' }
  }
}

// ============================================================
// USER-FACING MESSAGES (never expose the reason, use these)
// ============================================================

export const SAFETY_MESSAGES: Record<Exclude<SafetyCategory, 'safe'>, string> = {
  medical_diagnosis: 'I can help with training and programming, but medical questions need a qualified healthcare provider.',
  extreme_restriction: 'That level of restriction is outside what I can safely recommend. For guidance on nutrition targets, I can suggest evidence-based approaches for your goal.',
  eating_disorder: 'I am not able to help with that. If you are struggling with your relationship with food, please reach out to a healthcare provider or call the NEDA Helpline.',
  injury_override: 'Your injury flags are there to protect you. I cannot recommend exercises that contradict your injury profile - but I can help find effective alternatives that work around it.',
  ped_request: 'I only cover evidence-based natural training. Performance-enhancing drug protocols are outside my scope.',
  out_of_scope: 'I can only help with fitness, training, and nutrition questions. What would you like to work on today?',
}
