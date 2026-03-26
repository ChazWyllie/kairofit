/**
 * Contraindications Map
 *
 * Maps injury zones to exercises that must be excluded or modified.
 * Used by workout-validator.ts and workout-generator.ts.
 *
 * This file is the single source of truth for injury-exercise relationships.
 * Full documentation: docs/science/CONTRAINDICATIONS.md
 *
 * EXCLUDE: never assign these to a user with this injury flag
 * CAUTION: assign with a mandatory modification_note
 * RECOMMEND: prioritize these as safer alternatives
 */

import type { InjuryZone } from '@/types'

export interface InjuryContraindications {
  exclude: string[]
  caution: Array<{ exercise: string; note: string }>
  recommend: string[]
}

export const CONTRAINDICATIONS: Record<InjuryZone, InjuryContraindications> = {
  lower_back: {
    exclude: [
      'good morning',
      'barbell good morning',
      'hyperextension',
      'back extension',
      'jefferson curl',
      'stiff-leg deadlift',
      'loaded spinal flexion',
    ],
    caution: [
      {
        exercise: 'conventional deadlift',
        note: 'Keep weight moderate, brace core throughout. Stop if you feel lower back strain - not just fatigue.',
      },
      {
        exercise: 'romanian deadlift',
        note: 'Monitor lower back fatigue. Do not push through pain. Use a weight where form stays perfect.',
      },
      {
        exercise: 'barbell squat',
        note: 'Reduce depth to just above parallel if needed. Ensure upright torso throughout.',
      },
      {
        exercise: 'barbell row',
        note: 'Keep back flat throughout the movement. Do not round at any point. Use a supported variation if pain occurs.',
      },
      {
        exercise: 'leg press',
        note: 'Do not go below 90 degrees. Keep lower back pressed against the pad at all times.',
      },
    ],
    recommend: [
      'hip thrust',
      'glute bridge',
      'goblet squat',
      'single-leg exercises',
      'cable pull-through',
      'lat pulldown',
      'seated cable row',
      'dumbbell romanian deadlift',
    ],
  },

  knees: {
    exclude: [
      'leg extension', // extreme patellar stress at lockout
      'deep squat with load', // excessive compressive force
    ],
    caution: [
      {
        exercise: 'barbell squat',
        note: 'Limit depth to 90 degrees initially. Ensure knees track over toes throughout. Use moderate weight only.',
      },
      {
        exercise: 'walking lunge',
        note: 'Keep front shin vertical. Do not let knee cave inward. Reduce stride length if pain occurs.',
      },
      {
        exercise: 'bulgarian split squat',
        note: 'Start with bodyweight only. Monitor knee discomfort closely. Stop if sharp pain occurs.',
      },
      {
        exercise: 'leg press',
        note: 'Use moderate depth only (90 degrees maximum). Do not lock out completely.',
      },
      {
        exercise: 'step-up',
        note: 'Use a conservative box height. Drive through the heel - not the toe. Control the descent.',
      },
    ],
    recommend: [
      'hip thrust',
      'glute bridge',
      'lying leg curl',
      'seated leg curl',
      'calf raises',
      'single-leg deadlift',
      'leg press (moderate depth)',
    ],
  },

  shoulders: {
    exclude: [
      'upright row', // extreme internal rotation at impingement angle
      'behind-neck press',
      'behind-neck lat pulldown',
      'dip', // extreme shoulder extension angle
    ],
    caution: [
      {
        exercise: 'overhead press',
        note: 'Use neutral grip dumbbells if possible. Stop if pain occurs at the top of range.',
      },
      {
        exercise: 'barbell overhead press',
        note: 'Use dumbbells or landmine press as alternatives. If barbell, use slightly wider grip.',
      },
      {
        exercise: 'lateral raise',
        note: 'Use light weight. Do not raise above shoulder height. Use cable version for more control.',
      },
      {
        exercise: 'incline dumbbell press',
        note: 'Use moderate incline (30-45 degrees). Do not flare elbows excessively.',
      },
      {
        exercise: 'pull-up',
        note: 'Avoid if overhead reach causes pain. Lat pulldown is the safer alternative with identical muscle stimulus.',
      },
      {
        exercise: 'front raise',
        note: 'Keep weight very light. Do not raise above shoulder height.',
      },
    ],
    recommend: [
      'landmine press', // natural shoulder path, neutral grip
      'cable flye',
      'lat pulldown',
      'face pull', // excellent for rotator cuff health
      'band pull-apart',
      'dumbbell row',
      'rear delt flye',
      'cable lateral raise',
    ],
  },

  wrists: {
    exclude: ['wrist curl', 'behind-the-back barbell wrist curl', 'reverse wrist curl (heavy)'],
    caution: [
      {
        exercise: 'barbell bench press',
        note: 'Use wrist wraps if needed. Keep wrists neutral and stacked - not extended backward.',
      },
      {
        exercise: 'barbell curl',
        note: 'Keep wrists neutral. Do not hyperextend at the top. Consider EZ bar or dumbbells.',
      },
      {
        exercise: 'skull crusher',
        note: 'Use EZ bar or neutral grip dumbbells to reduce wrist stress. Avoid straight barbell.',
      },
      {
        exercise: 'push-up',
        note: 'Elevate on fists or use push-up handles to keep wrists neutral.',
      },
    ],
    recommend: [
      'dumbbell exercises (allow wrist rotation)',
      'cable exercises (smooth resistance curve)',
      'neutral grip pressing',
      'machine pressing exercises',
    ],
  },

  hips: {
    exclude: ['deep squat below parallel (FAI)', 'plyometric hip-dominant landing'],
    caution: [
      {
        exercise: 'barbell squat',
        note: 'Stay above parallel. Monitor for pinching sensation at the hip crease. Stop if you feel it.',
      },
      {
        exercise: 'hip thrust',
        note: 'Use full range only if pain-free. Partial range is acceptable and still effective.',
      },
      {
        exercise: 'leg press',
        note: 'Do not bring knees too close to chest. Keep at or above 90 degrees.',
      },
      {
        exercise: 'bulgarian split squat',
        note: 'Monitor hip flexor stretch. Do not overextend the rear leg.',
      },
    ],
    recommend: [
      'step-up',
      'dumbbell deadlift',
      'lying leg curl',
      'calf raise',
      'upper body dominant programming with reduced lower body intensity',
    ],
  },

  neck: {
    exclude: ['behind-neck press', 'behind-neck lat pulldown', 'heavy neck isolation'],
    caution: [
      {
        exercise: 'barbell squat',
        note: 'Use a low bar position or switch to safety bar squat or goblet squat to reduce cervical loading.',
      },
      {
        exercise: 'barbell overhead press',
        note: 'Ensure neck stays in neutral position throughout. Do not crane forward or backward.',
      },
      {
        exercise: 'conventional deadlift',
        note: 'Maintain neutral cervical spine throughout. Do not look up aggressively at lockout.',
      },
    ],
    recommend: [
      'dumbbell overhead press',
      'machine overhead press',
      'trap bar deadlift',
      'all seated machine exercises',
      'goblet squat',
    ],
  },

  other: {
    // Generic - no specific exclusions for unspecified injuries
    // The AI will prompt the user to specify which area
    exclude: [],
    caution: [],
    recommend: [],
  },
}

/**
 * Returns the set of exercises to exclude for a given set of injury flags.
 * Used by workout-generator.ts to pre-filter the exercise list before generation.
 */
export function getExcludedExercises(injuries: InjuryZone[]): Set<string> {
  const excluded = new Set<string>()
  for (const injury of injuries) {
    const contra = CONTRAINDICATIONS[injury]
    if (contra) {
      contra.exclude.forEach((ex) => excluded.add(ex.toLowerCase()))
    }
  }
  return excluded
}

/**
 * Returns modification notes for exercises that need caution.
 * Used by workout-validator.ts to add notes to flagged exercises.
 */
export function getModificationNote(exerciseName: string, injuries: InjuryZone[]): string | null {
  const name = exerciseName.toLowerCase()

  for (const injury of injuries) {
    const contra = CONTRAINDICATIONS[injury]
    if (!contra) continue

    for (const { exercise, note } of contra.caution) {
      if (name.includes(exercise.toLowerCase())) {
        return note
      }
    }
  }

  return null
}
