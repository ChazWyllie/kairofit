/**
 * StatsStrip Component
 *
 * Displays streak count and weekly volume in a two-column layout.
 * Pure display component - no data fetching.
 */

interface StatsStripProps {
  streak: number
  weeklyVolumeKg: number
}

export function StatsStrip({ streak, weeklyVolumeKg }: StatsStripProps) {
  const streakColor = streak > 0 ? 'text-[#F97316]' : 'text-[#6B6B68]'

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg border border-[#1A1A1F] bg-[#111113] p-4">
        <p className={`text-2xl font-semibold ${streakColor}`}>{streak}</p>
        <p className="mt-1 text-sm text-[#6B6B68]">day streak</p>
      </div>

      <div className="rounded-lg border border-[#1A1A1F] bg-[#111113] p-4">
        <p className="text-2xl font-semibold text-[#F5F5F4]">{weeklyVolumeKg.toLocaleString()}</p>
        <p className="mt-1 text-sm text-[#6B6B68]">kg this week</p>
      </div>
    </div>
  )
}
