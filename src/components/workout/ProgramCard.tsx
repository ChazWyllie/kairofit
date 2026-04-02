/**
 * ProgramCard Component
 *
 * Displays program metadata: name, archetype badge, week progress, and days per week.
 * Pure display component - no data fetching.
 */

import type { Program, KairoArchetype } from '@/types'

const ARCHETYPE_DISPLAY_NAMES: Record<KairoArchetype, string> = {
  system_builder: 'System Builder',
  milestone_chaser: 'Milestone Chaser',
  explorer: 'Explorer',
  pragmatist: 'Pragmatist',
  comeback_kid: 'Comeback Kid',
  optimizer: 'Optimizer',
  challenger: 'Challenger',
  understander: 'Understander',
}

interface ProgramCardProps {
  program: Program
  archetype: KairoArchetype | null
}

export function ProgramCard({ program, archetype }: ProgramCardProps) {
  return (
    <div className="rounded-2xl border border-[#1A1A1F] bg-[#111113] p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#F5F5F4]">{program.name}</h2>
        {archetype && (
          <span className="whitespace-nowrap rounded-full bg-[#6366F1] px-3 py-1 text-sm font-medium text-white">
            {ARCHETYPE_DISPLAY_NAMES[archetype]}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[#A1A19E]">
        <span>Week {program.current_week} of {program.weeks_duration}</span>
        {program.days_per_week && <span>{program.days_per_week} days/week</span>}
      </div>
    </div>
  )
}
