/**
 * KiroDebrief
 *
 * Post-workout AI debrief component. Streams Kiro's analysis inline
 * (not in a modal or popup - it appears in the post-workout screen).
 *
 * Fires after: streak animation + recovery heatmap update.
 * Uses Vercel AI SDK useChat for streaming.
 *
 * TODO: Implement full streaming with useChat hook.
 * The Server Action (generateDebriefAction) must be in workout.actions.ts.
 */

'use client'

// TODO: Import useChat from 'ai/react' once implemented
// import { useChat } from 'ai/react'

interface KiroDebriefProps {
  sessionId: string
  onComplete?: () => void
}

export function KiroDebrief({ sessionId, onComplete: _onComplete }: KiroDebriefProps) {
  // TODO: Implement with useChat or useCompletion from Vercel AI SDK
  // The debrief streams inline - exercise cards, next-session targets,
  // and Kiro's coaching notes appear token by token.
  //
  // Key behaviors:
  // - Shows a typing indicator while generating
  // - Streams the text progressively (no waiting for full response)
  // - After debrief completes, shows "Share this workout" CTA
  // - Kiro's voice: no em dashes, specific numbers, second person

  return (
    <div className="rounded-xl border border-[#1A1A1F] bg-[#111113] p-6">
      <div className="mb-4 flex items-center gap-3">
        {/* TODO: Kiro avatar or icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]">
          <span className="text-xs font-medium text-white">K</span>
        </div>
        <span className="text-sm font-medium text-[#F5F5F4]">Kiro&apos;s analysis</span>
      </div>

      {/* TODO: Replace with streaming text component */}
      <div className="text-sm text-[#A1A19E]">
        <p>Analyzing your session...</p>
        <p className="mt-2 text-xs text-[#6B6B68]">Session ID: {sessionId}</p>
      </div>
    </div>
  )
}
