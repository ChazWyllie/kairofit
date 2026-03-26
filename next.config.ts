/**
 * Next.js Configuration
 *
 * Serwist PWA plugin is required for the service worker to work.
 * Without withSerwist(), sw.ts cannot access self.__SW_MANIFEST and throws.
 * Offline workout logging (a core differentiator) is entirely non-functional
 * without this file.
 *
 * Why Serwist instead of next-pwa:
 * next-pwa conflicts with Turbopack (the default in Next.js 15).
 * Only @serwist/next is Turbopack-compatible.
 */

import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ExerciseDB GIFs - the exercise library foundation
      { protocol: 'https', hostname: 'v2.exercisedb.io' },
      { protocol: 'https', hostname: 'exercisedb.io' },
      // Supabase storage - user avatars and progress photos
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Security headers (see docs/security/SECURITY.md for full rationale)
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'

    // unsafe-eval is required by Next.js hot reload in development.
    // In production it is excluded - shipping unsafe-eval defeats XSS protection.
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline'"

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      [
        "connect-src 'self'",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://api.anthropic.com",
        "https://app.posthog.com",
        "https://eu.posthog.com",
        "https://js.stripe.com",
        "https://api.stripe.com",
      ].join(' '),
      "frame-src 'self' https://js.stripe.com",
      "frame-ancestors 'none'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default withSerwist({
  swSrc: 'src/app/sw.ts',         // Service worker source
  swDest: 'public/sw.js',         // Output location Serwist expects
  disable: process.env.NODE_ENV === 'development',  // Disable in dev for faster HMR
})(nextConfig)
