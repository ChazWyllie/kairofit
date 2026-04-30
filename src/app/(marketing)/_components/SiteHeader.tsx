'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from './Button'
import { captureMarketingEvent } from './MarketingAnalytics'

const navItems = [
  { href: '/science', label: 'Science', event: 'SCIENCE_LINK_CLICKED' },
  { href: '/tour', label: 'Tour', event: 'TOUR_LINK_CLICKED' },
  { href: '/founder', label: 'Founder', event: 'FOUNDER_LINK_CLICKED' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-marketing-border bg-marketing-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-6 py-4 md:px-8 lg:px-10">
        <Link
          href="/"
          className="rounded-sm text-lg font-semibold tracking-[0.28em] text-marketing-text-primary outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg"
        >
          KAIROFIT
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => captureMarketingEvent(item.event)}
              className="rounded-sm text-sm text-marketing-text-secondary outline-none transition-colors hover:text-marketing-text-primary focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button asChild>
            <Link href="/#waitlist" onClick={() => captureMarketingEvent('WAITLIST_CTA_CLICKED')}>
              Join the waitlist
            </Link>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-marketing-border-strong text-marketing-text-primary outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="font-mono text-xs">MENU</span>
        </button>
      </div>
      {open && (
        <div className="border-t border-marketing-border bg-marketing-bg-elevated px-6 py-5 lg:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  captureMarketingEvent(item.event)
                  setOpen(false)
                }}
                className="rounded-sm text-base text-marketing-text-primary outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#waitlist"
              onClick={() => {
                captureMarketingEvent('WAITLIST_CTA_CLICKED')
                setOpen(false)
              }}
              className="rounded-sm text-base text-marketing-accent outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-bg"
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
