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
    <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-8 lg:px-10">
        <Link href="/" className="text-lg font-semibold tracking-[0.28em] text-[#F5F5F4]">
          KAIROFIT
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => captureMarketingEvent(item.event)}
              className="text-sm text-[#A1A19E] transition-colors hover:text-[#F5F5F4]"
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#2A2A2F] text-[#F5F5F4] lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="font-mono text-xs">MENU</span>
        </button>
      </div>
      {open && (
        <div className="border-t border-[#1F1F23] bg-[#111113] px-6 py-5 lg:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  captureMarketingEvent(item.event)
                  setOpen(false)
                }}
                className="text-base text-[#F5F5F4]"
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
              className="text-base text-[#CAFF4C]"
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
