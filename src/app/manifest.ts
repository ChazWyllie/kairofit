// src/app/manifest.ts
// Next.js 15 App Router manifest file
// Generates /manifest.webmanifest for PWA installation

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KairoFit',
    short_name: 'KairoFit',
    description: 'Research-backed AI workout programming. Now you know why.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0B',
    theme_color: '#6366F1',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    // Deep links for common user actions
    shortcuts: [
      {
        name: 'Start Workout',
        url: '/workout/start',
        description: "Begin today's workout session",
      },
      {
        name: 'My Program',
        url: '/program',
        description: 'View your current training program',
      },
    ],
    categories: ['fitness', 'health', 'sports'],
  }
}
