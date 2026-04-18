import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { Button } from './_components/Button'
import { Card } from './_components/Card'
import { ComparisonTable } from './_components/ComparisonTable'
import { HeroProductComposition } from './_components/HeroProductComposition'
import { MarketingAnalytics } from './_components/MarketingAnalytics'
import { Marquee } from './_components/Marquee'
import { ProblemChart } from './_components/ProblemChart'
import { SectionHeader, AccentText } from './_components/SectionHeader'
import { Stat } from './_components/Stat'
import { TrackedLink } from './_components/TrackedLink'
import { WaitlistForm } from './_components/WaitlistForm'
import { AdaptationPillars } from './_components/AdaptationPillars'
import { founderCredentials, kiroExamples, marqueeItems, scienceCards } from './_content'

export const metadata: Metadata = {
  title: 'KairoFit - The AI workout app that adapts to your real life',
  description:
    'Research-backed AI fitness coaching that adapts to your schedule, stress, and equipment so consistency stays possible.',
  openGraph: {
    title: 'KairoFit - The AI workout app that adapts to your real life',
    description:
      'Tell Kairo your constraints. Get a plan that fits today, not the perfect version of your week that never shows up.',
    images: [{ url: '/opengraph-image' }],
  },
}

const softwareApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KairoFit',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  description: 'AI fitness coaching that adapts to your real life.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free during beta',
  },
}

export default function MarketingHomePage() {
  return (
    <main className="bg-marketing-bg text-marketing-text-primary">
      <MarketingAnalytics event="WAITLIST_PAGE_VIEWED" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationStructuredData) }}
      />

      <section className="relative overflow-hidden border-b border-marketing-border">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:92px_92px] opacity-35" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(202,255,76,0.12),transparent_72%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] items-center gap-14 px-6 py-20 md:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.8fr)] lg:px-10 lg:py-24">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-marketing-accent">
              KAIROFIT // CLOSED BETA
            </p>
            <h1 className="mt-6 max-w-4xl text-[52px] font-semibold leading-[0.98] tracking-[-0.05em] text-marketing-text-primary sm:text-[72px]">
              Fitness that adapts <AccentText>when life happens.</AccentText>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-9 text-marketing-text-secondary">
              Tell Kairo your constraints. Get a plan that fits today, not the perfect version of
              your week that never shows up.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild>
                <TrackedLink href="#waitlist" event="WAITLIST_CTA_CLICKED">
                  Join the waitlist
                </TrackedLink>
              </Button>
              <Button asChild variant="secondary">
                <a href="#how-it-adapts">See how it works</a>
              </Button>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <Stat value="30s" label="Daily logging stays short enough to keep doing." />
              <Stat value="50+" label="Peer-reviewed studies shape the programming rules." />
              <Stat value="4" label="Common failure modes rigid apps do not handle well." />
            </div>
          </div>
          <HeroProductComposition />
        </div>
      </section>

      <section className="border-b border-marketing-border">
        <Marquee items={marqueeItems} />
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-14 px-6 py-24 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,0.85fr)] lg:px-10 lg:py-40">
        <div>
          <SectionHeader
            eyebrow="THE PROBLEM"
            headline={
              <>
                You already know what to do.{' '}
                <AccentText>You cannot stay consistent doing it.</AccentText>
              </>
            }
            sub="Most fitness apps assume an idealized week that never happens. They hand you a rigid 12-week program, then treat missed days like a personal failure instead of a design failure."
          />
          <div className="mt-8 max-w-2xl space-y-6 text-lg leading-8 text-marketing-text-secondary">
            <p>
              Real weeks have travel. Bad sleep. Work deadlines. Old injuries flaring up. Gyms
              closed for a holiday. A plan that cannot handle any of this was never actually a plan.
              It was a wishlist.
            </p>
            <p>
              The problem is not motivation. It is architecture. KairoFit is built around the week
              you are actually having.
            </p>
          </div>
        </div>
        <ProblemChart />
      </section>

      <section id="how-it-adapts" className="border-y border-marketing-border bg-[#0D0D10]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-8 lg:px-10 lg:py-40">
          <SectionHeader
            eyebrow="THE PRODUCT"
            headline={
              <>
                Four ways your plan adapts <AccentText>to reality.</AccentText>
              </>
            }
            sub="Rigid plans fail at the exact moments real life gets messy. These are the specific failure modes KairoFit is built to absorb."
          />
          <div className="mt-16">
            <AdaptationPillars />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-6 py-24 text-center md:px-8 lg:px-10 lg:py-40">
        <SectionHeader
          eyebrow="YOUR AI COACH"
          headline={
            <>
              This is Kiro. <AccentText>Kiro knows why.</AccentText>
            </>
          }
          sub="Kiro is direct, specific, and science-literate. No hype. No canned encouragement. Just programming decisions that hold up to scrutiny."
          className="mx-auto text-center"
        />
        <Card className="mt-14 p-6 text-left md:p-8">
          <div className="space-y-6">
            {kiroExamples.map((example) => (
              <div key={example.user} className="space-y-3">
                <div className="ml-auto max-w-[88%] rounded-[24px] bg-marketing-accent px-5 py-4 text-base leading-7 text-marketing-accent-on">
                  {example.user}
                </div>
                <div className="max-w-[92%] rounded-[28px] border border-marketing-border bg-marketing-bg-subtle px-5 py-4 text-base leading-7 text-marketing-text-primary">
                  {example.kiro}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-marketing-text-secondary">
          Every answer is backed by peer-reviewed research. Every swap has a reason. Every number on
          your screen came from somewhere.
        </p>
        <div className="mt-10">
          <Button asChild variant="secondary">
            <TrackedLink href="/science" event="SCIENCE_LINK_CLICKED">
              Read Kiro&apos;s full methodology
            </TrackedLink>
          </Button>
        </div>
      </section>

      <section className="border-y border-marketing-border bg-[#0D0D10]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-8 lg:px-10 lg:py-40">
          <SectionHeader
            eyebrow="THE FOUNDATION"
            headline={
              <>
                Programming decisions, <AccentText>not programming guesses.</AccentText>
              </>
            }
            sub="The methodology is visible because credibility is part of the product. These are the principles shaping the app."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {scienceCards.map((card) => (
              <Card key={card.id} className="flex h-full flex-col p-6">
                <div className="h-10 w-10 rounded-full bg-[#CAFF4C14]" />
                <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.16em] text-marketing-text-muted">
                  {card.citation}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-marketing-text-primary">
                  {card.title}
                </h3>
                <p className="mt-4 flex-1 text-base leading-8 text-marketing-text-secondary">
                  {card.body}
                </p>
                <p className="mt-6 border-t border-marketing-border pt-4 text-sm leading-7 text-marketing-text-primary">
                  {card.footer}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-12">
            <Button asChild variant="secondary">
              <TrackedLink href="/science" event="SCIENCE_LINK_CLICKED">
                See the full methodology
              </TrackedLink>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-24 md:px-8 lg:px-10 lg:py-40">
        <SectionHeader
          eyebrow="HOW WE'RE DIFFERENT"
          headline={
            <>
              Why we built this instead of <AccentText>using what already existed.</AccentText>
            </>
          }
          sub="FitBod is the clearest reference point because it gets the convenience story right and the programming story wrong."
        />
        <div className="mt-14">
          <ComparisonTable />
        </div>
      </section>

      <section className="border-y border-marketing-border bg-[#0D0D10]">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-6 py-24 md:px-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:px-10 lg:py-40">
          <div className="relative overflow-hidden rounded-xl border border-marketing-border-strong bg-marketing-bg-elevated">
            <Image
              src="https://chazwyllie.com/assets/images/profile-photo.jpg"
              alt="Chaz Wyllie, founder of KairoFit"
              width={800}
              height={960}
              className="h-full w-full object-cover grayscale"
            />
            <div className="absolute inset-0 border-2 border-marketing-accent/30" />
          </div>
          <div>
            <SectionHeader
              eyebrow="BEHIND THE APP"
              headline={
                <>
                  Built by someone who <AccentText>lived the problem.</AccentText>
                </>
              }
              sub="Balancing a CS degree at ASU with consistent training made one thing obvious: the plans that survive are the ones that bend without breaking."
            />
            <div className="mt-8 space-y-6 text-lg leading-8 text-marketing-text-secondary">
              <p>
                I am Chaz. I built KairoFit because I watched too many people start strong, then
                fall off for reasons that had nothing to do with effort. Their plan could not
                survive a normal week.
              </p>
              <p>
                Time at Powerhouse Fitness made that pattern impossible to ignore. People did not
                need more hype. They needed a system that could handle stress, travel, bad sleep,
                and old injuries without pretending they were edge cases.
              </p>
              <p>
                KairoFit is the system I wanted to use myself: daily adaptation, 30-second logging,
                and a coach that treats consistency as the real target.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {founderCredentials.map((credential) => (
                <span
                  key={credential}
                  className="rounded-full border border-marketing-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-marketing-text-muted"
                >
                  {credential}
                </span>
              ))}
            </div>
            <div className="mt-10">
              <Button asChild variant="secondary">
                <TrackedLink href="/founder" event="FOUNDER_LINK_CLICKED">
                  Read the full story
                </TrackedLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="waitlist"
        className="mx-auto max-w-[960px] px-6 py-24 text-center md:px-8 lg:px-10 lg:py-40"
      >
        <SectionHeader
          eyebrow="EARLY ACCESS"
          headline={
            <>
              Be first when we open <AccentText>the next wave of beta.</AccentText>
            </>
          }
          sub="KairoFit is in closed beta. We are onboarding users in small waves to keep programming quality high. Join the waitlist and we will reach out when a slot opens."
          className="mx-auto text-center"
        />
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-marketing-text-secondary">
          No spam. No drip funnel. One email when you are in.
        </p>
        <div className="mt-12 rounded-[36px] border border-marketing-border bg-marketing-bg-elevated p-6 md:p-8">
          <Suspense fallback={<div className="min-h-[116px]" />}>
            <WaitlistForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
