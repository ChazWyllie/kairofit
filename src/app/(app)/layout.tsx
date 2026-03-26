/**
 * Authenticated App Shell Layout
 *
 * Applied to all routes under (app)/ group.
 * Provides: bottom navigation, top header, consistent padding.
 *
 * The (auth)/ group routes bypass this layout (no nav shown).
 *
 * TODO: Implement full bottom nav with:
 * - Home/Dashboard icon
 * - Program icon
 * - Workout (CTA, center, accented)
 * - Progress icon
 * - Profile icon
 */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* TODO: Top header with streak counter and profile avatar */}
      <main className="pb-20">{children}</main>
      {/* TODO: Bottom navigation */}
    </div>
  )
}
