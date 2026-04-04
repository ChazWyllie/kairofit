'use client'

/**
 * ShareCard
 *
 * Shareable workout card component.
 * On-demand sharing: shows a "Share" button, renders card details on click.
 *
 * Fires PostHog event: SHARE_CARD_GENERATED when user clicks share.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePostHog } from 'posthog-js/react'

interface ShareCardProps {
  sessionId: string
  durationMinutes: number | null
  totalSets: number
  totalVolumeKg: number
  musclesWorked: string[]
  streakDays: number
}

export function ShareCard({
  sessionId,
  durationMinutes,
  totalSets,
  totalVolumeKg,
  musclesWorked,
  streakDays,
}: ShareCardProps) {
  const [showCard, setShowCard] = useState(false)
  const posthog = usePostHog()

  const handleShare = async () => {
    // Fire analytics event
    posthog?.capture('SHARE_CARD_GENERATED', {
      session_id: sessionId,
      duration_minutes: durationMinutes,
      total_sets: totalSets,
      total_volume_kg: totalVolumeKg,
      streak_days: streakDays,
    })

    // If native share is available, use it
    if (navigator.share) {
      try {
        const text = buildShareText()
        await navigator.share({
          title: 'My KairoFit Workout',
          text,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    }

    setShowCard(!showCard)
  }

  const buildShareText = () => {
    return `Just completed a workout on KairoFit:
- Duration: ${durationMinutes ? `${durationMinutes}m` : '?'}
- Volume: ${Math.round(totalVolumeKg)}kg
- Sets: ${totalSets}
- Muscles: ${musclesWorked.join(', ')}
- Streak: ${streakDays} days`
  }

  return (
    <div className="rounded-xl border border-[#1A1A1F] bg-[#111113] p-6">
      <button
        onClick={handleShare}
        className="w-full rounded-lg bg-[#6366F1] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        {showCard ? 'Close' : 'Share Workout'}
      </button>

      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-lg border border-[#1A1A1F] bg-[#0A0A0B] p-4"
          >
            {/* Card header */}
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B68]">
                Workout Summary
              </p>
              <p className="mt-2 font-mono text-xs text-[#A1A19E]">
                Session {sessionId.slice(0, 8)}
              </p>
            </div>

            {/* Card stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded bg-[#111113] p-3 text-center">
                <p className="text-xs font-medium text-[#6B6B68]">Duration</p>
                <p className="mt-1 text-lg font-bold text-[#F5F5F4]">
                  {durationMinutes ? `${durationMinutes}m` : '-'}
                </p>
              </div>

              <div className="rounded bg-[#111113] p-3 text-center">
                <p className="text-xs font-medium text-[#6B6B68]">Volume</p>
                <p className="mt-1 text-lg font-bold text-[#F97316]">
                  {Math.round(totalVolumeKg)}kg
                </p>
              </div>

              <div className="rounded bg-[#111113] p-3 text-center">
                <p className="text-xs font-medium text-[#6B6B68]">Sets</p>
                <p className="mt-1 text-lg font-bold text-[#F5F5F4]">{totalSets}</p>
              </div>

              <div className="rounded bg-[#111113] p-3 text-center">
                <p className="text-xs font-medium text-[#6B6B68]">Streak</p>
                <p className="mt-1 text-lg font-bold text-[#F97316]">{streakDays}d</p>
              </div>
            </div>

            {/* Muscles */}
            <div className="mt-3">
              <p className="text-xs font-medium text-[#6B6B68]">Muscles</p>
              <p className="mt-1 flex flex-wrap gap-1">
                {musclesWorked.map((muscle) => (
                  <span
                    key={muscle}
                    className="rounded bg-[#1A1A1F] px-2 py-1 text-xs text-[#A1A19E]"
                  >
                    {muscle.replace('_', ' ')}
                  </span>
                ))}
              </p>
            </div>

            {/* Copy share text */}
            <div className="mt-4 rounded bg-[#1A1A1F] p-3">
              <p className="text-xs text-[#A1A19E]">{buildShareText()}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(buildShareText())
                }}
                className="mt-2 w-full rounded bg-[#111113] px-3 py-2 text-xs font-medium text-[#6366F1] transition-opacity hover:opacity-80"
              >
                Copy Text
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
