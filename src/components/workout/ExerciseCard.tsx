'use client'

/**
 * ExerciseCard
 *
 * Displays one exercise in the active workout logger.
 * Shows: name, target sets/reps/rest, science rationale (Layer 1),
 * injury warning if flagged, and the SetLogger for logging sets.
 */

import { SetLogger } from './SetLogger'
import type { ProgramExercise } from '@/types'
import type { ProgressionResult } from '@/lib/utils/progressive-overload'

interface ExerciseCardProps {
  programExercise: ProgramExercise
  sessionId: string
  isActive: boolean
  progression?: ProgressionResult | undefined
}

export function ExerciseCard({
  programExercise,
  sessionId,
  isActive,
  progression,
}: ExerciseCardProps) {
  const { exercise } = programExercise

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        isActive ? 'border-[#6366F1]/40 bg-[#111113]' : 'border-[#1A1A1F] bg-[#0A0A0B]'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[#F5F5F4]">{exercise.name}</h3>
            <p className="mt-0.5 text-xs text-[#6B6B68]">
              {programExercise.sets} sets - {programExercise.reps_min}-{programExercise.reps_max}{' '}
              reps - {programExercise.rest_seconds}s rest
            </p>
          </div>

          {exercise.is_compound && (
            <span className="shrink-0 rounded bg-[#1A1A1F] px-1.5 py-0.5 text-xs text-[#A1A19E]">
              compound
            </span>
          )}
        </div>

        {/* Injury flag */}
        {programExercise.is_flagged_for_injury && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#EF4444]/10 px-3 py-1.5 text-xs text-[#EF4444]">
            <span>Modified for your injury history</span>
            {programExercise.modification_note && (
              <span className="text-[#EF4444]/70"> - {programExercise.modification_note}</span>
            )}
          </div>
        )}

        {/* Science rationale (Layer 1 - always visible) */}
        {programExercise.rationale && (
          <p className="mt-2 text-xs text-[#6B6B68]">{programExercise.rationale}</p>
        )}

        {/* Progressive overload hint */}
        {progression && <ProgressionHint progression={progression} />}
      </div>

      {/* Set logger - only shown when active */}
      {isActive && (
        <div className="border-t border-[#1A1A1F] p-4">
          <SetLogger programExercise={programExercise} sessionId={sessionId} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sub-component
// ============================================================

const ACTION_LABEL: Record<ProgressionResult['action'], string> = {
  increase_weight: 'Increase weight',
  increase_reps: 'Add reps',
  decrease_weight: 'Reduce weight',
  maintain: 'Maintain',
}

const ACTION_COLOR: Record<ProgressionResult['action'], string> = {
  increase_weight: 'text-[#10B981]',
  increase_reps: 'text-[#6366F1]',
  decrease_weight: 'text-[#F97316]',
  maintain: 'text-[#A1A19E]',
}

function ProgressionHint({ progression }: { progression: ProgressionResult }) {
  const label = ACTION_LABEL[progression.action]
  const color = ACTION_COLOR[progression.action]

  const unitLabel = progression.units === 'metric' ? 'kg' : 'lbs'
  const weightHint =
    progression.suggested_weight !== null ? `${progression.suggested_weight} ${unitLabel}` : null

  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#1A1A1F] px-3 py-2">
      <span className={`text-xs font-medium ${color}`}>{label}</span>
      {weightHint && (
        <>
          <span className="text-xs text-[#6B6B68]">-</span>
          <span className="text-xs text-[#F5F5F4]">{weightHint}</span>
        </>
      )}
      <span className="text-xs text-[#6B6B68]">x {progression.suggested_reps} reps</span>
    </div>
  )
}
