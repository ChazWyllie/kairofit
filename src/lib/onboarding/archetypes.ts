/**
 * KairoFit Archetype System
 *
 * All archetype logic lives HERE, in src/lib/onboarding/archetypes.ts.
 * FLOW.md, CLAUDE.md, and kiro-voice.ts all reference this location.
 * kiro-voice.ts imports from here - do not duplicate archetype logic there.
 *
 * Implements all 8 archetypes defined in FLOW.md:
 * System Builder, Milestone Chaser, Explorer, Pragmatist,
 * Comeback Kid, Optimizer, Challenger, Understander
 *
 * No em dashes in this file or in any archetype content strings.
 */

import type { KairoArchetype, ArchetypeDefinition } from '@/types'

// ============================================================
// ARCHETYPE ASSIGNMENT
// ============================================================

/**
 * Assigns a psychographic archetype from 4 Likert scores (1-5 each).
 *
 * The 4 onboarding statements:
 * 1. "Seeing my progress metrics each week keeps me motivated."
 * 2. "I love when my workouts challenge me more each session."
 * 3. "I prefer structure - knowing exactly what to do each day."
 * 4. "Understanding why an exercise is in my program motivates me."
 *
 * Uses a scoring approach rather than ordered if-chains to avoid
 * order-dependence bugs with high-scoring users who match multiple profiles.
 * Each archetype gets a score based on how well the answers match its profile.
 * The highest-scoring archetype wins.
 */
export function assignArchetype(
  scores: [number, number, number, number]
): KairoArchetype {
  const [progress, challenge, structure, understanding] = scores

  // Comeback Kid check first - overrides all others if the user shows low engagement
  // These users need confidence-building, not optimization
  if (challenge <= 2 && progress <= 2) return 'comeback_kid'

  // Score each archetype profile
  const archetypeScores: Record<KairoArchetype, number> = {
    // System Builder: high structure AND high understanding
    system_builder: structure + understanding - Math.abs(structure - understanding),

    // Milestone Chaser: high progress, moderate-high challenge
    milestone_chaser: progress * 1.5 + challenge * 0.5,

    // Explorer: high challenge, low structure
    explorer: challenge * 1.5 + (5 - structure) * 0.5,

    // Pragmatist: low understanding preference, moderate overall
    pragmatist: (5 - understanding) * 1.5 + (5 - structure) * 0.5,

    // Comeback Kid: already handled above
    comeback_kid: (challenge <= 2 && progress <= 2) ? 100 : 0,

    // Optimizer: high challenge + high structure + moderate understanding
    optimizer: challenge * 1.2 + structure * 0.8 + understanding * 0.5,

    // Challenger: very high challenge, progress less important than pushing limits
    challenger: challenge * 2 + (5 - structure) * 0.3,

    // Understander: very high understanding, wants to know the science
    understander: understanding * 2 + structure * 0.3,
  }

  // Find the highest-scoring archetype
  let best: KairoArchetype = 'milestone_chaser'
  let bestScore = 0

  for (const [archetype, score] of Object.entries(archetypeScores)) {
    if (score > bestScore) {
      bestScore = score
      best = archetype as KairoArchetype
    }
  }

  return best
}

// ============================================================
// ARCHETYPE DEFINITIONS (all 8)
// ============================================================

export const ARCHETYPES: Record<KairoArchetype, ArchetypeDefinition> = {
  system_builder: {
    id: 'system_builder',
    name: 'The System Builder',
    emoji: '🏗️',
    headline: 'You thrive with structure. Knowing the why is what makes the difference.',
    description:
      "You want a complete system, not just a workout. You track numbers, read the rationale, and follow the plan precisely. That is exactly why you will see results - consistency compounds.",
    program_emphasis:
      'Full periodization with detailed progress tracking. Science explanations visible by default. Progressive overload tracked meticulously week over week.',
    default_science_depth: 'expanded',
  },

  milestone_chaser: {
    id: 'milestone_chaser',
    name: 'The Milestone Chaser',
    emoji: '🎯',
    headline: 'Progress stacking up each week is your fuel.',
    description:
      'Each small win drives the next one. You respond to numbers, streaks, and visible progress markers. We will make sure you always know exactly how far you have come.',
    program_emphasis:
      'Clear volume targets and weekly PR opportunities. Deload weeks communicated as recovery wins, not setbacks. Streak tracking front and center.',
    default_science_depth: 'collapsed',
  },

  explorer: {
    id: 'explorer',
    name: 'The Explorer',
    emoji: '🧭',
    headline: 'You need variety to stay engaged - and the science supports that.',
    description:
      'The same exercises every week kills your drive. You do better with variation built into the plan. We use daily undulating periodization - different rep ranges across the week - to keep sessions fresh while still driving adaptation.',
    program_emphasis:
      'DUP programming with intentional variation. Exercise rotation built in. Frequent novel stimulus while maintaining progressive overload.',
    default_science_depth: 'collapsed',
  },

  pragmatist: {
    id: 'pragmatist',
    name: 'The Pragmatist',
    emoji: '⚡',
    headline: 'You want results. You want efficiency. No overhead.',
    description:
      'You care about what works, not the theory behind it. Your program is clean, focused, and effective - with just enough rationale to confirm you are on the right track and no more.',
    program_emphasis:
      'Efficient supersets where appropriate. Time-optimized sessions. Science notes collapsed by default. Direct feedback on what to improve.',
    default_science_depth: 'collapsed',
  },

  comeback_kid: {
    id: 'comeback_kid',
    name: 'The Comeback Kid',
    emoji: '🔄',
    headline: 'Getting back is harder than starting. We will make it easier.',
    description:
      'Whether it has been months or years, returning to training after a gap is its own challenge. Your program starts conservative - not because you are weak, but because that is the science-backed approach to rebuilding without injury.',
    program_emphasis:
      'Conservative initial volume with rapid but safe progression. Focus on movement quality and rebuilding confidence. Injury prevention as the top priority.',
    default_science_depth: 'collapsed',
  },

  optimizer: {
    id: 'optimizer',
    name: 'The Optimizer',
    emoji: '📊',
    headline: 'You have been at this long enough to know that details matter.',
    description:
      'You are not just training - you are managing a system. You understand periodization, you track your numbers, and you want the algorithm to be as sophisticated as your knowledge. We can work with that.',
    program_emphasis:
      'RPE-based autoregulation with DUP across the week. Full mesocycle planning with explicit deload protocols. Performance tracking at the set level.',
    default_science_depth: 'expanded',
  },

  challenger: {
    id: 'challenger',
    name: 'The Challenger',
    emoji: '🔥',
    headline: 'You train to see what you are capable of.',
    description:
      'Limits exist to be tested. You do your best work when the bar keeps moving and sessions demand something from you. Your program is built around progressive challenges with the recovery structure to sustain them.',
    program_emphasis:
      'Aggressive progressive overload with clear PR targets each session. Higher intensity emphasis. Recovery built in as the foundation that enables the challenge.',
    default_science_depth: 'collapsed',
  },

  understander: {
    id: 'understander',
    name: 'The Understander',
    emoji: '📖',
    headline: 'You want to know why, and that makes you train better.',
    description:
      'When you understand why an exercise is in your program, you do it with more intent. That intent translates to better results. Your program comes with full explanations - you will never wonder why you are doing something.',
    program_emphasis:
      'Full science rationale on every exercise. Research notes visible by default. Kiro explains the mechanism behind every programming decision, not just the outcome.',
    default_science_depth: 'expanded',
  },
}

// ============================================================
// HELPER: loading screen facts by archetype
// ============================================================

/**
 * Returns a personalized research fact for the loading screen.
 * Tailored to goal and experience level.
 */
export function getLoadingFact(goal: string, experienceLevel: number): string {
  const facts: Record<string, string[]> = {
    muscle: [
      'Training each muscle group 2x/week with 10-16 weekly sets produces optimal hypertrophy for intermediate lifters - that is exactly what your program does.',
      'Rest periods of 2-3 minutes between compound sets produce significantly more strength and muscle gain than 1-minute rest. Your program accounts for this.',
      'Progressive overload is the primary driver of muscle growth. Your program automates it based on your logged performance.',
    ],
    strength: [
      'Compound movements trained in the 3-6 rep range at 80-90% of your max produce the greatest strength gains. Your program prioritizes this.',
      'Strength gains require 72-96 hours of recovery for the largest muscle groups. Your split is designed to maximize quality per session.',
    ],
    fat_loss: [
      'Resistance training during a fat loss phase preserves muscle mass - studies show significantly more lean mass retained compared to cardio alone.',
      'Maintaining strength levels during a cut is the best proxy for keeping muscle. Your program tracks this automatically.',
    ],
    fitness: [
      'Full-body training 3x/week produces the most comprehensive fitness improvements for general health goals.',
      'Consistency over 8 weeks produces more benefit than intensity over 2. Your program is designed for sustainable progression.',
    ],
  }

  const goalFacts = facts[goal] ?? facts.fitness
  return goalFacts[experienceLevel % goalFacts.length] ?? goalFacts[0]
}

/**
 * Returns a projected transformation description for the loading screen.
 */
export function getProjectionText(
  goal: string,
  daysPerWeek: number,
  experienceLevel: number
): string {
  const weeksEstimate = experienceLevel <= 2 ? '6-8' : experienceLevel <= 3 ? '8-10' : '10-14'

  const projections: Record<string, string> = {
    muscle: `At ${daysPerWeek} days/week with consistent progressive overload, intermediate lifters see 10-15% strength increases in ${weeksEstimate} weeks.`,
    strength: `Training ${daysPerWeek} days/week, expect to add meaningful weight to your main lifts within ${weeksEstimate} weeks of consistent training.`,
    fat_loss: `Strength training ${daysPerWeek}x/week preserves muscle during a deficit. Most users see visible body composition changes in ${weeksEstimate} weeks.`,
    fitness: `At ${daysPerWeek} days/week, you will notice meaningful improvements - more energy, better endurance, increased strength - within ${weeksEstimate} weeks.`,
  }

  return projections[goal] ?? projections.fitness
}
