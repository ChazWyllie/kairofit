import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy for the KairoFit marketing site and closed beta waitlist.',
  openGraph: { images: [{ url: '/legal/privacy/opengraph-image' }] },
}

const webPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'KairoFit privacy policy',
}

export default function PrivacyPage() {
  return (
    <main className="bg-[#0A0A0B] text-[#F5F5F4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
      />
      <section className="mx-auto max-w-[720px] px-6 py-24 md:px-8 lg:py-32">
        <h1 className="text-[48px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#F5F5F4]">
          Privacy policy
        </h1>
        <div className="mt-8 space-y-8 text-base leading-8 text-[#A1A19E]">
          <p>
            KairoFit collects the information you submit through the waitlist form, including your
            email address and optional attribution fields such as referrer and campaign tags. We use
            this information only to manage beta access and communicate product updates related to
            the waitlist.
          </p>
          <p>
            If you become a product user, account and training data are governed by the in-app
            privacy terms. Health data inside the product is encrypted at the column level per the
            project security rules. The marketing site itself is limited to waitlist and analytics
            data.
          </p>
          <p>
            We use PostHog for product and marketing analytics to understand page views, waitlist
            conversion, and interest in the science, founder, and tour pages. We do not sell your
            data.
          </p>
          <p>
            If you want your waitlist record deleted, email hello@kairofit.com from the address you
            used to sign up and we will remove it.
          </p>
        </div>
      </section>
    </main>
  )
}
