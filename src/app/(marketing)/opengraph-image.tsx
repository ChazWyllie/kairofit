import { createMarketingOgImage } from './_components/MarketingOgImage'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: 'Closed beta',
    title: 'The AI workout app that adapts to your real life.',
    subtitle: 'Research-backed coaching for busy weeks, low sleep, travel, and recovery.',
  })
}
