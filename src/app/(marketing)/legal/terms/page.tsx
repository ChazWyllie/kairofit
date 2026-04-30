import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for the KairoFit marketing site and closed beta waitlist.',
  openGraph: { images: [{ url: '/legal/terms/opengraph-image' }] },
}

const webPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'KairoFit terms of use',
}

export default function TermsPage() {
  return (
    <main className="bg-marketing-bg text-marketing-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
      />
      <section className="mx-auto max-w-[720px] px-6 py-24 md:px-8 lg:py-32">
        <h1 className="text-heading-xl text-marketing-text-primary">Terms of use</h1>
        <div className="mt-8 space-y-8 text-base leading-8 text-marketing-text-secondary">
          <p>
            KairoFit is a closed beta fitness product. The marketing site and waitlist are offered
            for informational purposes and beta access coordination only. Submitting your email does
            not guarantee admission into the beta.
          </p>
          <p>
            KairoFit provides fitness coaching and general nutrition guidance. It is not medical
            advice, diagnosis, or treatment. If you have a medical condition or active injury,
            consult a licensed professional before beginning a training program.
          </p>
          <p>
            You may not misuse the site, interfere with access, or submit false information through
            the waitlist form. We may remove or ignore entries that appear automated, malicious, or
            duplicative.
          </p>
          <p>
            These terms may change as the product moves from closed beta toward public launch.
            Continued use of the site after updates constitutes acceptance of the revised terms.
          </p>
        </div>
      </section>
    </main>
  )
}
