/**
 * E2E: Auth Guards and Login/Signup Pages
 *
 * Tests middleware-enforced authentication boundaries and
 * the auth page UI. No real credentials needed - tests redirect
 * behavior and page structure only.
 *
 * Covers:
 * - Protected routes redirect unauthenticated users to /login
 * - Login page renders correctly
 * - Signup page renders correctly
 * - Health check endpoint responds
 * - 404 page renders for unknown routes
 */

import { test, expect } from '@playwright/test'

test.describe('Auth redirects', () => {
  test('unauthenticated /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated /workout/* redirects to /login', async ({ page }) => {
    await page.goto('/workout/some-session-id')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirect preserves destination in redirectTo param', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/redirectTo=%2Fdashboard/)
  })
})

test.describe('Login page', () => {
  test('renders KairoFit wordmark', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'KairoFit' })).toBeVisible()
  })

  test('renders email input field', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('renders send magic link button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /magic link|send|sign in/i })).toBeVisible()
  })

  test('shows link to signup', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /sign up|create account/i })).toBeVisible()
  })
})

test.describe('Signup page', () => {
  test('renders email input field', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('shows link back to login', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('link', { name: /sign in|log in/i })).toBeVisible()
  })
})

test.describe('Health check', () => {
  test('GET /api/health returns 200 or 503 with JSON body', async ({ request }) => {
    const response = await request.get('/api/health')
    // 200 if services up, 503 if degraded - both are valid structured responses
    expect([200, 503]).toContain(response.status())

    const body = await response.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('services')
    expect(['ok', 'degraded']).toContain(body.status)
  })
})

test.describe('404 page', () => {
  test('unknown route shows 404 page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-xyz')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText(/page not found/i)).toBeVisible()
  })

  test('404 page has link back to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz')
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible()
  })
})
