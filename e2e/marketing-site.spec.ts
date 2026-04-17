import { test, expect } from '@playwright/test'

test('homepage renders flagship marketing content', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /Fitness that adapts when life happens\./i })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Science/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Join the waitlist/i }).first()).toBeVisible()
})
