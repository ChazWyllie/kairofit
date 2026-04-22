import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../_components/Button'
import { SectionHeader, AccentText } from '../_components/SectionHeader'
import { founderCredentials } from '../_content'

export const metadata: Metadata = {
  title: 'Founder',
  description: 'Why Chaz Wyllie built KairoFit and what he believes about adaptive programming.',
  openGraph: { images: [{ url: '/founder/opengraph-image' }] },
}

const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Chaz Wyllie',
  affiliation: 'Arizona State University',
  jobTitle: 'Founder, KairoFit',
  url: 'https://chazwyllie.com',
}

export default function FounderPage() {
  return (
    <main className="bg-marketing-bg text-marketing-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />
      <section className="mx-auto max-w-[980px] px-6 py-24 md:px-8 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-xl border border-marketing-border-strong bg-marketing-bg-elevated">
            <Image
              src="https://chazwyllie.com/assets/images/profile-photo.jpg"
              alt="Founder portrait of Chaz Wyllie"
              width={720}
              height={920}
              className="h-full w-full object-cover grayscale"
            />
          </div>
          <div>
            <SectionHeader
              eyebrow="FOUNDER"
              headline={
                <>
                  Why KairoFit exists: <AccentText>a better way to stay consistent.</AccentText>
                </>
              }
              sub="Balancing engineering work, school, lifting, and life made one thing obvious: the plans that survive are the ones that adapt."
            />
            <div className="mt-8 space-y-6 text-lg leading-8 text-marketing-text-secondary">
              <p>
                I am Chaz Wyllie. I built KairoFit because I never found a fitness system that
                treated a real week like the default case. Most products are built for the imaginary
                version of you with perfect recovery, perfect compliance, and no friction.
              </p>
              <p>
                Training while pursuing computer science at ASU forced me to care about systems, not
                slogans. If a program breaks the moment you miss Tuesday, the issue is not your
                discipline. The issue is the design of the program.
              </p>
              <p>
                Powerhouse Fitness made that even clearer. People did not fall off because they were
                lazy. They fell off because their plan had no tolerance for travel, stress, low
                sleep, or pain. KairoFit is what happens when you design around those realities
                first.
              </p>
              <p>
                I built KairoFit as an AI-first product because the problem is dynamic. The right
                workout depends on your current schedule, recovery state, equipment access, and
                injury status. Static templates cannot handle that. A responsive system can.
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
              <Button asChild>
                <Link href="/#waitlist">Join the waitlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
