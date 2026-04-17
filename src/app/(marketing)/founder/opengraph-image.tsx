import { createMarketingOgImage } from '../_components/MarketingOgImage'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Founder',
    title: 'Built by someone who lived the problem.',
    subtitle: 'Why Chaz Wyllie built KairoFit around consistency, feedback loops, and real weeks.',
  })
}
