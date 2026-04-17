import { createMarketingOgImage } from '../../_components/MarketingOgImage'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Privacy',
    title: 'KairoFit privacy policy.',
    subtitle: 'How waitlist data and analytics are handled during the closed beta phase.',
  })
}
