'use client'

/**
 * OfflineBanner
 *
 * Fixed top banner shown when the user loses network connectivity.
 * Listens to the window 'online' and 'offline' events and toggles
 * based on navigator.onLine at mount time.
 *
 * Returns null when online so it adds no DOM overhead during normal use.
 */

import { useState, useEffect } from 'react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() =>
    // Initialise from the current network state at mount time
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-[#1A1A1F] px-4 py-2 text-sm text-[#A1A19E]"
    >
      <span className="h-2 w-2 rounded-full bg-[#F97316]" aria-hidden="true" />
      Offline - sets are saved and will sync when you reconnect
    </div>
  )
}
