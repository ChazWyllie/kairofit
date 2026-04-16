'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled ? 'border-b border-white/5 bg-[#0A0A0B]/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="text-lg font-bold tracking-tight text-[#F5F5F4]">KairoFit</span>

        <nav className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-[#A1A19E] transition-colors hover:text-[#F5F5F4]"
          >
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5558E6]"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  )
}
