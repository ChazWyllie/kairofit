import type { Metadata } from 'next'
import { MarketingShell } from './_components/MarketingShell'

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
  return <MarketingShell>{children}</MarketingShell>
}
