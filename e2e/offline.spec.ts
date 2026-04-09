/**
 * E2E: Offline Behaviour
 *
 * Tests the offline-first PWA functionality accessible without authentication:
 * - OfflineBanner appears when the browser goes offline
 * - OfflineBanner disappears when connectivity is restored
 * - Service worker is registered
 * - PWA manifest is served
 *
 * Workout set logging offline tests require authentication - those
 * are integration-tested in unit tests (src/lib/offline/sync.test.ts).
 */

import { test, expect } from '@playwright/test'

test.describe('PWA assets', () => {
  test('web manifest is served with correct content-type', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/manifest+json')
  })

  test('manifest contains required PWA fields', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    const manifest = await response.json()
    expect(manifest).toHaveProperty('name')
    expect(manifest).toHaveProperty('short_name')
    expect(manifest).toHaveProperty('start_url')
    expect(manifest).toHaveProperty('display')
    expect(manifest).toHaveProperty('icons')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('service worker is registered on onboarding page', async ({ page }) => {
    await page.goto('/onboarding/goal')

    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      const registrations = await navigator.serviceWorker.getRegistrations()
      return registrations.length > 0
    })

    expect(swRegistered).toBe(true)
  })
})

test.describe('Offline banner', () => {
  test('offline banner does not appear when online', async ({ page }) => {
    await page.goto('/onboarding/goal')
    // Confirm we are online
    const isOnline = await page.evaluate(() => navigator.onLine)
    expect(isOnline).toBe(true)

    // Banner should not be present
    const banner = page.getByRole('status')
    await expect(banner).not.toBeVisible()
  })

  test('offline banner appears when browser goes offline', async ({ page, context }) => {
    await page.goto('/onboarding/goal')

    // Simulate going offline
    await context.setOffline(true)

    // Trigger the offline event so React state updates
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))

    await expect(page.getByRole('status')).toBeVisible()
    await expect(page.getByText(/offline/i)).toBeVisible()

    // Restore
    await context.setOffline(false)
  })

  test('offline banner disappears when connectivity is restored', async ({ page, context }) => {
    await page.goto('/onboarding/goal')

    // Go offline then online
    await context.setOffline(true)
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))
    await expect(page.getByRole('status')).toBeVisible()

    await context.setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await expect(page.getByRole('status')).not.toBeVisible()
  })
})

test.describe('SEO and crawlability', () => {
  test('robots.txt allows public paths', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('User-agent')
    expect(text).toContain('Sitemap')
    // Protected routes are disallowed
    expect(text).toContain('/dashboard/')
    expect(text).toContain('/workout/')
  })

  test('sitemap.xml is served', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('<urlset')
    expect(text).toContain('/onboarding')
  })
})
