import { createMarketingOgImage } from '../../_components/MarketingOgImage'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Terms',
    title: 'KairoFit terms of use.',
    subtitle: 'Closed beta terms for the marketing site, waitlist, and future product access.',
  })
}
