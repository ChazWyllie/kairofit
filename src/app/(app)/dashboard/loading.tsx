/**
 * Dashboard Loading Skeleton
 *
 * Shown by Next.js while the dashboard Server Component awaits data.
 * Mirrors the layout of ProgramCard + StatsStrip + TodayWorkout.
 */

export default function DashboardLoading() {
  return (
    <div className="space-y-6 px-4 py-6">
      {/* ProgramCard skeleton */}
      <div className="animate-pulse rounded-xl bg-[#111113] p-5">
        <div className="h-5 w-40 rounded bg-[#1A1A1F]" />
        <div className="mt-3 h-4 w-24 rounded bg-[#1A1A1F]" />
        <div className="mt-4 h-2 w-full rounded-full bg-[#1A1A1F]" />
      </div>

      {/* StatsStrip skeleton */}
      <div className="flex gap-4">
        <div className="h-16 flex-1 animate-pulse rounded-xl bg-[#111113]" />
        <div className="h-16 flex-1 animate-pulse rounded-xl bg-[#111113]" />
      </div>

      {/* TodayWorkout skeleton */}
      <div className="animate-pulse rounded-xl bg-[#111113] p-5">
        <div className="h-5 w-32 rounded bg-[#1A1A1F]" />
        <div className="mt-4 space-y-3">
          <div className="h-12 rounded-lg bg-[#1A1A1F]" />
          <div className="h-12 rounded-lg bg-[#1A1A1F]" />
          <div className="h-12 rounded-lg bg-[#1A1A1F]" />
        </div>
        <div className="mt-5 h-12 rounded-lg bg-[#6366F1]/20" />
      </div>
    </div>
  )
}
