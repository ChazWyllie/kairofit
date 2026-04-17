'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

type MarketingAnalyticsProps = {
  event: string
}

export function MarketingAnalytics({ event }: MarketingAnalyticsProps) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    posthog.capture(event)
  }, [event])

  return null
}

export function captureMarketingEvent(event: string, properties?: Record<string, string>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.capture(event, properties)
}
