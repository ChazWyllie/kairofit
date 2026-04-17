import { createMarketingOgImage } from '../_components/MarketingOgImage'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Science',
    title: 'Programming decisions, not programming guesses.',
    subtitle: 'The citations, methodology, and reasoning behind KairoFit.',
  })
}
