'use client'

/**
 * Bottom Navigation Bar
 *
 * Persistent navigation for all authenticated (app)/ routes.
 * Active tab is highlighted by matching the current pathname.
 *
 * Tab order:
 *   Home | Program | [Workout CTA] | Progress | Profile
 *
 * The centre Workout tab is an accented CTA button, not a standard tab.
 * It links to /workout/new (start an ad-hoc session) or the active program day.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Plus, TrendingUp, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/program', icon: Calendar, label: 'Program' },
  // Centre CTA is rendered separately
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/profile', icon: User, label: 'Profile' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0A0A0B]/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around px-2">
        {/* Home tab */}
        <NavTab
          href={NAV_ITEMS[0].href}
          icon={NAV_ITEMS[0].icon}
          label={NAV_ITEMS[0].label}
          active={pathname === NAV_ITEMS[0].href}
        />

        {/* Program tab */}
        <NavTab
          href={NAV_ITEMS[1].href}
          icon={NAV_ITEMS[1].icon}
          label={NAV_ITEMS[1].label}
          active={pathname.startsWith('/program')}
        />

        {/* Centre Workout CTA */}
        <Link
          href="/workout/new"
          aria-label="Start workout"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </Link>

        {/* Progress tab */}
        <NavTab
          href={NAV_ITEMS[2].href}
          icon={NAV_ITEMS[2].icon}
          label={NAV_ITEMS[2].label}
          active={pathname.startsWith('/progress')}
        />

        {/* Profile tab */}
        <NavTab
          href={NAV_ITEMS[3].href}
          icon={NAV_ITEMS[3].icon}
          label={NAV_ITEMS[3].label}
          active={pathname.startsWith('/profile')}
        />
      </div>
    </nav>
  )
}

function NavTab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-3 py-1"
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className={`h-5 w-5 transition-colors ${active ? 'text-[#6366F1]' : 'text-[#6B6B68]'}`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={`text-[10px] font-medium transition-colors ${active ? 'text-[#6366F1]' : 'text-[#6B6B68]'}`}
      >
        {label}
      </span>
    </Link>
  )
}
