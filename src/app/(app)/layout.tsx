/**
 * Authenticated App Shell Layout
 *
 * Applied to all routes under (app)/ group.
 * Provides: bottom navigation, top header, consistent padding.
 *
 * The (auth)/ group routes bypass this layout (no nav shown).
 * The onboarding/ routes bypass this layout (standalone flow).
 */

import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Top header - wordmark only for now; streak counter added in Phase 6 */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A0B]/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-lg font-semibold tracking-tight text-[#F5F5F4]">KairoFit</span>
          {/* Streak counter placeholder - populated in Phase 6 */}
          <div className="h-8 w-16 rounded-full bg-[#111113]" />
        </div>
      </header>

      {/* Main content area - pb-20 reserves space for the bottom nav */}
      <main className="pb-20">{children}</main>

      <BottomNav />
    </div>
  )
}
