'use client'

/**
 * RestTimer
 *
 * Overlay countdown timer displayed during rest periods between sets.
 * Reads from the workout store, ticks every second via useEffect interval,
 * and triggers haptic feedback when complete (handled in the store).
 *
 * Visible only when rest_timer.is_running is true.
 */

import { useEffect } from 'react'
import { useWorkoutStore } from '@/stores/workout.store'

// Exported for unit testing
export function formatRestTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface RestTimerProps {
  className?: string
}

export function RestTimer({ className }: RestTimerProps) {
  const { rest_timer, tickRestTimer, stopRestTimer } = useWorkoutStore((s) => ({
    rest_timer: s.rest_timer,
    tickRestTimer: s.tickRestTimer,
    stopRestTimer: s.stopRestTimer,
  }))

  useEffect(() => {
    if (!rest_timer.is_running) return

    const interval = setInterval(tickRestTimer, 1000)
    return () => clearInterval(interval)
  }, [rest_timer.is_running, tickRestTimer])

  if (!rest_timer.is_running) return null

  const pct = rest_timer.total_seconds > 0
    ? (rest_timer.seconds_remaining / rest_timer.total_seconds) * 100
    : 0

  const containerClass = `fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${className || ''}`

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#1A1A1F] p-8 text-center shadow-2xl">
        {rest_timer.exercise_name && (
          <p className="text-sm text-[#A1A19E]">Rest - {rest_timer.exercise_name}</p>
        )}

        <p className="font-mono text-6xl font-bold text-[#F5F5F4]">
          {formatRestTime(rest_timer.seconds_remaining)}
        </p>

        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-[#6B6B68]">
          <div
            className="h-full rounded-full bg-[#6366F1] transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>

        <button
          onClick={stopRestTimer}
          className="mt-2 text-sm text-[#A1A19E] underline underline-offset-2 hover:text-[#F5F5F4]"
        >
          Skip rest
        </button>
      </div>
    </div>
  )
}
