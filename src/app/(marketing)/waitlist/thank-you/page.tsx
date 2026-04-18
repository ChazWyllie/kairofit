import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '../../_components/Button'

export const metadata: Metadata = {
  title: 'Thank you',
  description: 'You are on the KairoFit waitlist.',
  openGraph: { images: [{ url: '/waitlist/thank-you/opengraph-image' }] },
}

const webPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'KairoFit waitlist confirmation',
}

export default function WaitlistThankYouPage() {
  return (
    <main className="bg-marketing-bg text-marketing-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
      />
      <section className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col justify-center px-6 py-24 text-center md:px-8">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#CAFF4C14] shadow-[0_0_60px_rgba(202,255,76,0.12)]" />
        <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.18em] text-marketing-accent">
          You are in
        </p>
        <h1 className="mt-4 text-[48px] font-semibold leading-[1.02] tracking-[-0.04em] text-marketing-text-primary">
          You are on the waitlist.
        </h1>
        <p className="mt-6 text-lg leading-8 text-marketing-text-secondary">
          We are onboarding closed beta users in small waves. We will email you when a slot opens.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild>
            <a href="https://instagram.com/chazwyllie">Follow @chazwyllie</a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
