/**
 * Landing Page
 *
 * Public marketing entry point - accessible without authentication.
 * Middleware allows '/' as a public route; authenticated users are redirected
 * to /dashboard by the auth route check, not by this page.
 *
 * Structure:
 *   LandingNav       - sticky header with sign in + get started
 *   HeroSection      - full-viewport headline + primary CTA
 *   ScienceHook      - 3-layer science transparency explainer
 *   HowItWorks       - 3-step flow from quiz to first rep
 *   ArchetypeSection - 8 training archetypes teaser
 *   FeaturesGrid     - 6 feature tiles
 *   LandingCTA       - bottom conversion section
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav } from '@/components/marketing/LandingNav'
import { HeroSection } from '@/components/marketing/HeroSection'
import { ScienceHookSection } from '@/components/marketing/ScienceHookSection'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { ArchetypeSection } from '@/components/marketing/ArchetypeSection'
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export const metadata: Metadata = {
  title: 'KairoFit - Research-backed AI workout programming',
  description:
    'Kiro identifies your training archetype and builds your program from exercise science. Personality-matched training. Every set has a reason. Free during beta.',
}

export default function LandingPage() {
  return (
    <div className="bg-[#0A0A0B]">
      <LandingNav />
      <main>
        <HeroSection />
        <ScienceHookSection />
        <HowItWorksSection />
        <ArchetypeSection />
        <FeaturesGrid />
        <LandingCTA />
      </main>
      <footer className="border-t border-white/5 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div>
              <p className="mb-2 font-semibold text-[#F5F5F4]">KairoFit</p>
              <p className="text-xs text-[#A1A19E]">Research-backed AI workout programming.</p>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6366F1]">
                Product
              </p>
              <ul className="space-y-2 text-xs text-[#A1A19E]">
                <li>
                  <Link href="/onboarding" className="transition-colors hover:text-[#F5F5F4]">
                    Get started
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="transition-colors hover:text-[#F5F5F4]">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6366F1]">
                Company
              </p>
              <ul className="space-y-2 text-xs text-[#A1A19E]">
                <li>
                  <span className="text-[#6B6B68]">About</span>
                </li>
                <li>
                  <span className="text-[#6B6B68]">Blog</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6366F1]">
                Legal
              </p>
              <ul className="space-y-2 text-xs text-[#A1A19E]">
                <li>
                  <span className="text-[#6B6B68]">Privacy</span>
                </li>
                <li>
                  <span className="text-[#6B6B68]">Terms</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6">
            <p className="text-xs text-[#6B6B68]">
              &copy; {new Date().getFullYear()} KairoFit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
