import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '../_components/Button'
import { ProductScreen } from '../_components/ProductScreens'
import { SectionHeader, AccentText } from '../_components/SectionHeader'
import { tourSteps } from '../_content'

export const metadata: Metadata = {
  title: 'Tour',
  description: 'A week with KairoFit, told as a scrollytelling product tour.',
  openGraph: { images: [{ url: '/tour/opengraph-image' }] },
}

const webPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'KairoFit product tour',
}

export default function TourPage() {
  return (
    <main className="bg-marketing-bg text-marketing-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
      />
      <section className="mx-auto max-w-[1280px] px-6 py-24 md:px-8 lg:px-10 lg:py-32">
        <SectionHeader
          eyebrow="THE TOUR"
          headline={
            <>
              This is what a week with KairoFit <AccentText>actually looks like.</AccentText>
            </>
          }
          sub="A daily narrative of check-ins, shortened sessions, travel mode, substitutions, and debriefs."
        />
        <div className="mt-16 space-y-20 lg:space-y-28">
          {tourSteps.map((step, index) => (
            <section
              key={step.eyebrow}
              className="grid gap-12 rounded-[36px] border border-marketing-border bg-marketing-bg-elevated p-6 md:p-8 lg:grid-cols-[minmax(0,0.8fr)_340px] lg:items-center"
            >
              <div>
                <p className="font-mono text-mono-label uppercase tracking-[0.18em] text-marketing-accent">
                  {index + 1}. {step.eyebrow}
                </p>
                <h2 className="mt-4 text-heading-lg text-marketing-text-primary">{step.title}</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-marketing-text-secondary">
                  {step.body}
                </p>
              </div>
              <ProductScreen screen={step.screen} />
            </section>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Button asChild>
            <Link href="/#waitlist">Join the waitlist</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
