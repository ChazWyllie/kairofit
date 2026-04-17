'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { captureMarketingEvent } from './MarketingAnalytics'

type TrackedLinkProps = {
  href: string
  event: string
  className?: string
  children: ReactNode
}

export function TrackedLink({ href, event, className, children }: TrackedLinkProps) {
  const isAnchor = href.startsWith('#')

  if (isAnchor) {
    return (
      <a href={href} onClick={() => captureMarketingEvent(event)} className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} onClick={() => captureMarketingEvent(event)} className={className}>
      {children}
    </Link>
  )
}
