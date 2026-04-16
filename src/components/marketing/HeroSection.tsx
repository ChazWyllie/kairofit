'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const els = [headlineRef.current, subRef.current, ctaRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      timers.push(
        setTimeout(
          () => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          },
          100 + i * 120
        )
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Subtle radial glow behind headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="bg-[#6366F1]/8 h-[500px] w-[700px] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#111113] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          <span className="text-xs font-medium text-[#A1A19E]">Free during beta</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="mb-6 text-5xl font-bold leading-[1.08] tracking-tight text-[#F5F5F4] sm:text-6xl lg:text-7xl"
        >
          Research-backed AI
          <br />
          <span className="text-[#6366F1]">workout programming.</span>
          <br />
          Now you know why.
        </h1>

        {/* Sub */}
        <p
          ref={subRef}
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#A1A19E] sm:text-xl"
        >
          Kiro builds your program from exercise science, not algorithms. Every set has a reason.
          Every week has a direction. You train with context, not just instructions.
        </p>

        {/* CTA row */}
        <div
          ref={ctaRef}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/onboarding"
            className="w-full rounded-xl bg-[#6366F1] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#5558E6] sm:w-auto"
          >
            Build my program - free
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-[#A1A19E] transition-colors hover:text-[#F5F5F4]"
          >
            Already have an account? Sign in
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-6 text-xs text-[#6B6B68]">5-minute quiz. No credit card. Works offline.</p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="h-5 w-5 text-[#6B6B68]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
