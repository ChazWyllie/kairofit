'use client'

import Link from 'next/link'
import { founderCredentials } from '../_content'
import { captureMarketingEvent } from './MarketingAnalytics'

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-[#CAFF4C] bg-[#0A0A0B]">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-16 md:grid-cols-3 md:px-8 lg:px-10">
        <div>
          <p className="text-lg font-semibold tracking-[0.28em] text-[#F5F5F4]">KAIROFIT</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#A1A19E]">
            Fitness that adapts when life happens.
          </p>
          <p className="mt-4 text-xs text-[#6B6B68]">© 2026 KairoFit. All rights reserved.</p>
        </div>
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6B68]">
            Product
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#A1A19E]">
            <li>
              <Link
                href="/tour"
                onClick={() => captureMarketingEvent('TOUR_LINK_CLICKED')}
                className="transition-colors hover:text-[#F5F5F4]"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                href="/science"
                onClick={() => captureMarketingEvent('SCIENCE_LINK_CLICKED')}
                className="transition-colors hover:text-[#F5F5F4]"
              >
                Science
              </Link>
            </li>
            <li>
              <Link
                href="/tour"
                onClick={() => captureMarketingEvent('TOUR_LINK_CLICKED')}
                className="transition-colors hover:text-[#F5F5F4]"
              >
                Tour
              </Link>
            </li>
            <li>
              <Link
                href="/founder"
                onClick={() => captureMarketingEvent('FOUNDER_LINK_CLICKED')}
                className="transition-colors hover:text-[#F5F5F4]"
              >
                Founder
              </Link>
            </li>
            <li>
              <span className="text-[#6B6B68]">Free during beta. $9.99/month at launch.</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6B68]">
            Connect
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#A1A19E]">
            <li>
              <a
                href="https://instagram.com/chazwyllie"
                onClick={() => captureMarketingEvent('INSTAGRAM_CLICKED')}
                className="transition-colors hover:text-[#F5F5F4]"
              >
                Instagram @chazwyllie
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@kairofit.com"
                className="transition-colors hover:text-[#F5F5F4]"
              >
                hello@kairofit.com
              </a>
            </li>
            <li>
              <Link href="/legal/privacy" className="transition-colors hover:text-[#F5F5F4]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="transition-colors hover:text-[#F5F5F4]">
                Terms
              </Link>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {founderCredentials.map((credential) => (
              <span
                key={credential}
                className="rounded-full border border-[#1F1F23] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6B68]"
              >
                {credential}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
