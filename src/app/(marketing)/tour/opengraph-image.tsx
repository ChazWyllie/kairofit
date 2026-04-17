import { createMarketingOgImage } from '../_components/MarketingOgImage'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Tour',
    title: 'This is what a week with KairoFit actually looks like.',
    subtitle: 'A scrollytelling walkthrough of adaptive fitness coaching in practice.',
  })
}
