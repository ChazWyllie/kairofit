/**
 * E2E Placeholder
 *
 * Real E2E tests go here as features are built.
 * This file exists so playwright.config.ts testDir has something to find
 * and npm run test:e2e does not fail with "no test files found".
 *
 * Recommended first tests to implement:
 * 1. Onboarding flow completes end-to-end (screens 1-22)
 * 2. User can start, log sets, and complete a workout session
 * 3. Offline set logging syncs correctly on reconnect
 * 4. Program generation produces a valid program
 */

import { test, expect } from '@playwright/test'

test('app loads and shows onboarding entry point', async ({ page }) => {
  await page.goto('/')
  // Should redirect to onboarding for unauthenticated users
  // or dashboard for authenticated users
  await expect(page).toHaveURL(/\/(onboarding|dashboard)/)
})
