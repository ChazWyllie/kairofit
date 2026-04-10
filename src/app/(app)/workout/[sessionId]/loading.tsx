/**
 * Workout Session Loading Skeleton
 *
 * Shown while the workout page Server Component loads session data
 * and progression suggestions.
 */

export default function WorkoutLoading() {
  return (
    <div className="space-y-4 px-4 py-6">
      {/* Session header skeleton */}
      <div className="animate-pulse">
        <div className="h-6 w-48 rounded bg-[#1A1A1F]" />
        <div className="mt-2 h-4 w-32 rounded bg-[#1A1A1F]" />
      </div>

      {/* Exercise cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-xl bg-[#111113] p-5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 rounded bg-[#1A1A1F]" />
            <div className="h-4 w-20 rounded bg-[#1A1A1F]" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-10 rounded-lg bg-[#1A1A1F]" />
            <div className="h-10 rounded-lg bg-[#1A1A1F]" />
            <div className="h-10 rounded-lg bg-[#1A1A1F]" />
          </div>
        </div>
      ))}
    </div>
  )
}
