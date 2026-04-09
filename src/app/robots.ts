/**
 * robots.txt
 *
 * Allows all crawlers to index all public pages.
 * Points to the sitemap for discovery.
 *
 * Uses NEXT_PUBLIC_APP_URL so the sitemap URL resolves
 * to the correct domain in both dev and production.
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/workout/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
