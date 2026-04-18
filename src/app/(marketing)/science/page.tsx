import type { Metadata } from 'next'
import Link from 'next/link'
import { sciencePageSections } from '../_content'
import { SectionHeader, AccentText } from '../_components/SectionHeader'

export const metadata: Metadata = {
  title: 'Science',
  description: 'The methodology, citations, and programming rules behind KairoFit.',
  openGraph: { images: [{ url: '/science/opengraph-image' }] },
}

const articleStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The methodology behind KairoFit',
  author: { '@type': 'Person', name: 'Chaz Wyllie' },
  publisher: { '@type': 'Organization', name: 'KairoFit' },
}

export default function SciencePage() {
  return (
    <main className="bg-marketing-bg text-marketing-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <section className="mx-auto max-w-[1280px] px-6 py-24 md:px-8 lg:px-10 lg:py-32">
        <SectionHeader
          eyebrow="THE SCIENCE"
          headline={
            <>
              Methodology that stays visible <AccentText>under scrutiny.</AccentText>
            </>
          }
          sub="KairoFit surfaces the reasoning behind volume, rep ranges, rest periods, adaptations, contraindications, and deload timing so you can inspect the logic instead of trusting a black box."
        />
        <div className="mt-16 grid gap-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden self-start lg:block">
            <div className="sticky top-28 rounded-[28px] border border-marketing-border bg-marketing-bg-elevated p-5">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-marketing-text-muted">
                Contents
              </p>
              <nav className="mt-5 space-y-3 text-sm text-marketing-text-secondary">
                {sciencePageSections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="block transition-colors hover:text-marketing-text-primary"
                  >
                    {section.title}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <div className="space-y-16">
            {sciencePageSections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-28">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-marketing-accent">
                  {section.citation}
                </p>
                <h2 className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-marketing-text-primary">
                  {section.title}
                </h2>
                <div className="mt-6 space-y-6 text-lg leading-8 text-marketing-text-secondary">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
