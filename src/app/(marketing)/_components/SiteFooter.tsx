'use client'

import Link from 'next/link'
import { founderCredentials } from '../_content'
import { captureMarketingEvent } from './MarketingAnalytics'

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-marketing-accent bg-marketing-bg">
      <div className="mx-auto grid max-w-container-max gap-12 px-6 py-16 md:grid-cols-3 md:px-8 lg:px-10">
        <div>
          <p className="text-lg font-semibold tracking-[0.28em] text-marketing-text-primary">
            KAIROFIT
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-marketing-text-secondary">
            Fitness that adapts when life happens.
          </p>
          <p className="mt-4 text-xs text-marketing-text-muted">
            © 2026 KairoFit. All rights reserved.
          </p>
        </div>
        <div>
          <p className="font-mono text-mono-label uppercase tracking-[0.18em] text-marketing-text-muted">
            Product
          </p>
          <ul className="mt-4 space-y-3 text-sm text-marketing-text-secondary">
            <li>
              <Link
                href="/tour"
                onClick={() => captureMarketingEvent('TOUR_LINK_CLICKED')}
                className="transition-colors hover:text-marketing-text-primary"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                href="/science"
                onClick={() => captureMarketingEvent('SCIENCE_LINK_CLICKED')}
                className="transition-colors hover:text-marketing-text-primary"
              >
                Science
              </Link>
            </li>
            <li>
              <Link
                href="/tour"
                onClick={() => captureMarketingEvent('TOUR_LINK_CLICKED')}
                className="transition-colors hover:text-marketing-text-primary"
              >
                Tour
              </Link>
            </li>
            <li>
              <Link
                href="/founder"
                onClick={() => captureMarketingEvent('FOUNDER_LINK_CLICKED')}
                className="transition-colors hover:text-marketing-text-primary"
              >
                Founder
              </Link>
            </li>
            <li>
              <span className="text-marketing-text-muted">
                Free during beta. $9.99/month at launch.
              </span>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-mono-label uppercase tracking-[0.18em] text-marketing-text-muted">
            Connect
          </p>
          <ul className="mt-4 space-y-3 text-sm text-marketing-text-secondary">
            <li>
              <a
                href="https://instagram.com/chazwyllie"
                onClick={() => captureMarketingEvent('INSTAGRAM_CLICKED')}
                className="transition-colors hover:text-marketing-text-primary"
              >
                Instagram @chazwyllie
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@kairofit.com"
                className="transition-colors hover:text-marketing-text-primary"
              >
                hello@kairofit.com
              </a>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="transition-colors hover:text-marketing-text-primary"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/legal/terms"
                className="transition-colors hover:text-marketing-text-primary"
              >
                Terms
              </Link>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {founderCredentials.map((credential) => (
              <span
                key={credential}
                className="rounded-pill border border-marketing-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-marketing-text-muted"
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
