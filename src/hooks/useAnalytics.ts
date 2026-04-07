'use client'

import { usePostHog } from 'posthog-js/react'
import { EVENTS } from '@/lib/utils/event-names'

export function useAnalytics() {
  const posthog = usePostHog()

  function track(event: keyof typeof EVENTS, properties?: Record<string, unknown>) {
    posthog?.capture(EVENTS[event], properties)
  }

  return { track }
}
