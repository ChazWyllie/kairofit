/**
 * Landing Page
 *
 * Public marketing entry point - accessible without authentication.
 * Middleware allows '/' as a public route; authenticated users are redirected
 * to /dashboard by the auth route check, not by this page.
 *
 * Structure:
 *   LandingNav    - sticky header with sign in + get started
 *   HeroSection   - full-viewport headline + primary CTA
 *   ScienceHook   - 3-layer science transparency explainer
 *   HowItWorks    - 3-step flow from quiz to first rep
 *   FeaturesGrid  - 6 feature tiles
 *   LandingCTA    - bottom conversion section
 */

import type { Metadata } from 'next'
import { LandingNav } from '@/components/marketing/LandingNav'
import { HeroSection } from '@/components/marketing/HeroSection'
import { ScienceHookSection } from '@/components/marketing/ScienceHookSection'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export const metadata: Metadata = {
  title: 'KairoFit - Research-backed AI workout programming',
  description:
    'Kiro builds your program from exercise science, not algorithms. Every set has a reason. Every week has a direction. Free during beta.',
}

export default function LandingPage() {
  return (
    <div className="bg-[#0A0A0B]">
      <LandingNav />
      <main>
        <HeroSection />
        <ScienceHookSection />
        <HowItWorksSection />
        <FeaturesGrid />
        <LandingCTA />
      </main>
      <footer className="border-t border-white/5 px-4 py-8 text-center sm:px-6">
        <p className="text-xs text-[#6B6B68]">
          &copy; {new Date().getFullYear()} KairoFit. Research-backed AI workout programming.
        </p>
      </footer>
    </div>
  )
}
