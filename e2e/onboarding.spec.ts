/**
 * E2E: Onboarding Flow
 *
 * Tests the public-facing onboarding quiz that runs before authentication.
 * No credentials required - these screens are accessible to all users.
 *
 * Covers:
 * - Entry point redirect from /onboarding to /onboarding/goal
 * - Goal selection auto-advances to next screen
 * - Progress indicator updates
 * - Back navigation works
 * - Experience level selection advances flow
 * - 404 for unknown onboarding routes
 */

import { test, expect } from '@playwright/test'

test.describe('Onboarding entry', () => {
  test('redirects /onboarding to /onboarding/goal', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/onboarding\/goal/)
  })

  test('goal page renders question and options', async ({ page }) => {
    await page.goto('/onboarding/goal')
    await expect(page.getByText('What brings you to KairoFit?')).toBeVisible()
    await expect(page.getByText('Build muscle')).toBeVisible()
    await expect(page.getByText('Lose fat')).toBeVisible()
    await expect(page.getByText('Build strength')).toBeVisible()
  })

  test('selecting a goal auto-advances to experience screen', async ({ page }) => {
    await page.goto('/onboarding/goal')
    await page.getByText('Build muscle').click()
    await expect(page).toHaveURL(/\/onboarding\/experience/)
  })

  test('experience page renders options and back button', async ({ page }) => {
    await page.goto('/onboarding/experience')
    await expect(page.getByText('How would you describe your training experience?')).toBeVisible()
    await expect(page.getByText('Just starting out')).toBeVisible()
    await expect(page.getByText('Advanced')).toBeVisible()
    // Back button should exist
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible()
  })

  test('back button on experience page returns to goal', async ({ page }) => {
    await page.goto('/onboarding/experience')
    await page.getByRole('button', { name: /back/i }).click()
    await expect(page).toHaveURL(/\/onboarding\/goal/)
  })

  test('selecting experience level advances to demographics', async ({ page }) => {
    await page.goto('/onboarding/experience')
    await page.getByText('Intermediate').click()
    await expect(page).toHaveURL(/\/onboarding\/demographics/)
  })

  test('progress indicator shows correct step numbers', async ({ page }) => {
    await page.goto('/onboarding/goal')
    // Step 1 of 22 - should show some progress indication
    await expect(page.getByText(/1/)).toBeVisible()

    await page.goto('/onboarding/experience')
    // Step 2 - progress should increment
    await expect(page.getByText(/2/)).toBeVisible()
  })
})

test.describe('Onboarding public access', () => {
  test('onboarding screens are accessible without authentication', async ({ page }) => {
    // These should load without redirecting to /login
    await page.goto('/onboarding/goal')
    await expect(page).toHaveURL(/\/onboarding\/goal/)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('unknown onboarding route returns 404', async ({ page }) => {
    const response = await page.goto('/onboarding/nonexistent-screen-abc')
    // Next.js not-found returns 404
    expect(response?.status()).toBe(404)
  })
})
