/**
 * Marketing Component Tests
 *
 * Verifies that landing page sections render without error,
 * export the correct component types, and contain expected copy.
 * LandingNav and HeroSection are Client Components with hooks -
 * tested for export shape only (calling hooks outside React throws).
 *
 * next/link is mocked because it contains circular module references
 * that break JSON.stringify-based prop inspection.
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'

// Mock next/link with a plain <a> element.
// - render() needs a real React element (not a plain object)
// - JSON.stringify tests need a serializable structure (React.createElement satisfies both)
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => React.createElement('a', { href, className }, children),
}))
import { ScienceHookSection } from '../ScienceHookSection'
import { HowItWorksSection } from '../HowItWorksSection'
import { ArchetypeSection } from '../ArchetypeSection'
import { FeaturesGrid } from '../FeaturesGrid'
import { LandingCTA } from '../LandingCTA'
import { LandingNav } from '../LandingNav'
import { HeroSection } from '../HeroSection'

// --- LandingNav integration -------------------------------------------------

describe('LandingNav', () => {
  it('renders the KairoFit wordmark', () => {
    const { getByText } = render(<LandingNav />)
    expect(getByText('KairoFit')).toBeInTheDocument()
  })

  it('starts with transparent background (not scrolled)', () => {
    const { container } = render(<LandingNav />)
    const header = container.querySelector('header')
    expect(header?.className).not.toContain('bg-[#0A0A0B]/95')
  })

  it('applies scrolled styles after window scroll past 16px', async () => {
    const { container } = render(<LandingNav />)
    const header = container.querySelector('header')

    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 20, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(header?.className).toContain('bg-[#0A0A0B]/95')
  })

  it('contains Sign in and Get started links', () => {
    const { getByText } = render(<LandingNav />)
    expect(getByText('Sign in')).toBeInTheDocument()
    expect(getByText('Get started')).toBeInTheDocument()
  })
})

// --- Export shape -----------------------------------------------------------

describe('marketing component exports', () => {
  it('exports LandingNav as a function', () => {
    expect(typeof LandingNav).toBe('function')
  })

  it('exports HeroSection as a function', () => {
    expect(typeof HeroSection).toBe('function')
  })

  it('exports ScienceHookSection as a function', () => {
    expect(typeof ScienceHookSection).toBe('function')
  })

  it('exports HowItWorksSection as a function', () => {
    expect(typeof HowItWorksSection).toBe('function')
  })

  it('exports FeaturesGrid as a function', () => {
    expect(typeof FeaturesGrid).toBe('function')
  })

  it('exports LandingCTA as a function', () => {
    expect(typeof LandingCTA).toBe('function')
  })

  it('exports ArchetypeSection as a function', () => {
    expect(typeof ArchetypeSection).toBe('function')
  })
})

// --- Server Component renders ------------------------------------------------
// ScienceHookSection, HowItWorksSection, FeaturesGrid, LandingCTA are Server
// Components with no hooks - safe to call directly.

describe('ScienceHookSection', () => {
  it('renders without throwing', () => {
    expect(() => ScienceHookSection()).not.toThrow()
  })

  it('returns a React element', () => {
    const el = ScienceHookSection()
    expect(el).toBeDefined()
    expect(el).not.toBeNull()
  })

  it('contains all three science layer descriptions', () => {
    // Inspect props tree for key strings
    const el = ScienceHookSection() as React.ReactElement
    const json = JSON.stringify(el)
    expect(json).toContain('Layer 1')
    expect(json).toContain('Layer 2')
    expect(json).toContain('Layer 3')
  })

  it('contains the section headline', () => {
    const json = JSON.stringify(ScienceHookSection())
    expect(json).toContain('Know why every rep')
  })

  it('contains no em dashes', () => {
    const json = JSON.stringify(ScienceHookSection())
    expect(json).not.toContain('\u2014') // em dash character
    expect(json).not.toContain('--') // double-dash variant
  })
})

describe('HowItWorksSection', () => {
  it('renders without throwing', () => {
    expect(() => HowItWorksSection()).not.toThrow()
  })

  it('returns a React element', () => {
    const el = HowItWorksSection()
    expect(el).toBeDefined()
  })

  it('contains all three step numbers', () => {
    const json = JSON.stringify(HowItWorksSection())
    expect(json).toContain('01')
    expect(json).toContain('02')
    expect(json).toContain('03')
  })

  it('contains the quiz step', () => {
    const json = JSON.stringify(HowItWorksSection())
    expect(json).toContain('5-minute intake quiz')
  })

  it('references Kiro, not Claude, for program analysis', () => {
    const json = JSON.stringify(HowItWorksSection())
    expect(json).toContain('Kiro analyzes your intake')
    expect(json).not.toContain('Claude analyzes')
  })

  it('mentions injury and sleep data collection', () => {
    const json = JSON.stringify(HowItWorksSection())
    expect(json).toContain('injury')
    expect(json).toContain('sleep')
  })

  it('contains no em dashes', () => {
    const json = JSON.stringify(HowItWorksSection())
    expect(json).not.toContain('\u2014')
  })
})

describe('FeaturesGrid', () => {
  it('renders without throwing', () => {
    expect(() => FeaturesGrid()).not.toThrow()
  })

  it('returns a React element', () => {
    expect(FeaturesGrid()).toBeDefined()
  })

  it('contains all six feature titles', () => {
    const json = JSON.stringify(FeaturesGrid())
    expect(json).toContain('AI Coach Kiro')
    expect(json).toContain('Recovery heatmap')
    expect(json).toContain('Offline-first')
    expect(json).toContain('Progressive overload')
    expect(json).toContain('Adaptive volume')
    expect(json).toContain('Injury-aware programming')
  })

  it('does not contain Science citations tile', () => {
    const json = JSON.stringify(FeaturesGrid())
    expect(json).not.toContain('Science citations')
  })

  it('contains no em dashes', () => {
    const json = JSON.stringify(FeaturesGrid())
    expect(json).not.toContain('\u2014')
  })
})

describe('ArchetypeSection', () => {
  it('renders without throwing', () => {
    expect(() => ArchetypeSection()).not.toThrow()
  })

  it('contains all eight archetype names', () => {
    const json = JSON.stringify(ArchetypeSection())
    expect(json).toContain('The System Builder')
    expect(json).toContain('The Milestone Chaser')
    expect(json).toContain('The Explorer')
    expect(json).toContain('The Pragmatist')
    expect(json).toContain('The Comeback Kid')
    expect(json).toContain('The Optimizer')
    expect(json).toContain('The Challenger')
    expect(json).toContain('The Understander')
  })

  it('contains the section headline', () => {
    const json = JSON.stringify(ArchetypeSection())
    expect(json).toContain('Your archetype, your program')
  })

  it('contains no em dashes', () => {
    const json = JSON.stringify(ArchetypeSection())
    expect(json).not.toContain('\u2014')
  })
})

describe('LandingCTA', () => {
  it('renders without throwing', () => {
    expect(() => LandingCTA()).not.toThrow()
  })

  it('returns a React element', () => {
    expect(LandingCTA()).toBeDefined()
  })

  it('CTA link routes to /onboarding', () => {
    const json = JSON.stringify(LandingCTA())
    expect(json).toContain('/onboarding')
  })

  it('sign-in link routes to /auth/login', () => {
    const json = JSON.stringify(LandingCTA())
    expect(json).toContain('/auth/login')
  })

  it('contains no em dashes', () => {
    const json = JSON.stringify(LandingCTA())
    expect(json).not.toContain('\u2014')
  })

  it('mentions free and no credit card', () => {
    const json = JSON.stringify(LandingCTA())
    expect(json).toContain('free')
    expect(json).toContain('credit card')
  })
})
