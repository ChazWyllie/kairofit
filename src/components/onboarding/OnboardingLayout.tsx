/**
 * OnboardingLayout
 *
 * Shared layout for all 22 onboarding screens.
 * Provides: progress bar, back button, step counter, consistent padding.
 *
 * TODO: Implement full visual design per CLAUDE.md visual identity:
 * - Dark background (#0A0A0B)
 * - Progress bar in indigo (#6366F1)
 * - Step counter: "Step X of 22"
 * - Back arrow top-left
 */

'use client'

interface OnboardingLayoutProps {
  step: number
  totalSteps: number
  question?: string
  context?: string
  children: React.ReactNode
  onBack?: () => void
  showBack?: boolean
}

export function OnboardingLayout({
  step,
  totalSteps,
  question,
  context,
  children,
  onBack,
  showBack = true,
}: OnboardingLayoutProps) {
  const progressPct = (step / totalSteps) * 100

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      {/* Progress bar */}
      <div className="h-1 w-full bg-[#1A1A1F]">
        <div
          className="h-full bg-[#6366F1] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="text-[#A1A19E] transition-colors hover:text-[#F5F5F4]"
            aria-label="Go back"
          >
            {/* TODO: Replace with proper back arrow icon */}
            Back
          </button>
        ) : (
          <div />
        )}
        <span className="text-sm text-[#6B6B68]">
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-8">
        {question && <h1 className="mb-2 text-2xl font-medium text-[#F5F5F4]">{question}</h1>}
        {context && <p className="mb-8 text-sm text-[#A1A19E]">{context}</p>}
        {children}
      </div>
    </div>
  )
}
