'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getPendingSetsCount } from '@/lib/offline/db'

export function SyncStatusDot() {
  const count = useLiveQuery(() => getPendingSetsCount())

  if (!count) return null

  return (
    <div
      role="status"
      aria-label={`${count} sets pending sync`}
      className="flex items-center gap-1.5 text-xs text-[#A1A19E]"
    >
      <span className="h-2 w-2 rounded-full bg-[#F97316]" aria-hidden="true" />
      {count}
    </div>
  )
}
