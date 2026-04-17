import type { Metadata } from 'next'
import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairofitdev.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'KairoFit - The AI workout app that adapts to your real life',
    template: '%s - KairoFit',
  },
  description:
    'Research-backed AI fitness coaching that adapts to your schedule, stress, and equipment. Join the closed beta waitlist.',
  openGraph: {
    siteName: 'KairoFit',
    type: 'website',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#CAFF4C] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0A0A0B]"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="main-content">{children}</div>
      <SiteFooter />
    </>
  )
}
