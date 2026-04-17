import { createMarketingOgImage } from '../../_components/MarketingOgImage'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Waitlist',
    title: 'You are on the KairoFit waitlist.',
    subtitle: 'Closed beta access opens in small waves. We will email you when a slot opens.',
  })
}
