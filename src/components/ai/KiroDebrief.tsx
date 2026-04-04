/**
 * KiroDebrief
 *
 * Post-workout AI debrief component. Streams Kiro's analysis inline.
 * Uses Vercel AI SDK useCompletion for streaming response.
 *
 * Key behaviors:
 * - Shows a typing indicator while generating
 * - Streams the text progressively (no waiting for full response)
 * - After debrief completes, calls onComplete callback
 * - Kiro's voice: no em dashes, specific numbers, second person
 */

'use client'

import { useEffect, useRef } from 'react'
import { useCompletion } from 'ai/react'

interface KiroDebriefProps {
  sessionId: string
  onComplete?: () => void
}

export function KiroDebrief({ sessionId, onComplete }: KiroDebriefProps) {
  const { completion, isLoading, complete } = useCompletion({
    api: `/api/debrief/${sessionId}`,
  })

  // Store latest complete in a ref so the effect dep array stays stable
  const completeRef = useRef(complete)
  completeRef.current = complete

  // Trigger debrief whenever sessionId changes (once per session view)
  useEffect(() => {
    completeRef.current('')
  }, [sessionId])

  // Call onComplete when debrief finishes streaming
  useEffect(() => {
    if (!isLoading && completion && completion.length > 0) {
      onComplete?.()
    }
  }, [isLoading, completion, onComplete])

  return (
    <div className="rounded-xl border border-[#1A1A1F] bg-[#111113] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]">
          <span className="text-xs font-medium text-white">K</span>
        </div>
        <span className="text-sm font-medium text-[#F5F5F4]">Kiro&apos;s analysis</span>
      </div>

      <div className="text-sm text-[#A1A19E]">
        {isLoading && !completion ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#6366F1]" />
            <p>Analyzing your session...</p>
          </div>
        ) : completion ? (
          <div className="whitespace-pre-wrap leading-relaxed">{completion}</div>
        ) : (
          <p>Failed to load debrief. Please try again.</p>
        )}
      </div>
    </div>
  )
}
