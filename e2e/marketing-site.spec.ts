import { test, expect } from '@playwright/test'

const ROUTES = [
  { path: '/', heading: /Fitness that adapts/i },
  { path: '/science', heading: /Methodology that stays visible/i },
  { path: '/founder', heading: /Why KairoFit exists/i },
  { path: '/tour', heading: /This is what a week with KairoFit/i },
  { path: '/waitlist/thank-you', heading: /You are on the waitlist/i },
  { path: '/legal/privacy', heading: /Privacy policy/i },
  { path: '/legal/terms', heading: /Terms of use/i },
] as const

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const

// ---------------------------------------------------------------------------
// Route loading
// ---------------------------------------------------------------------------

test.describe('route loading', () => {
  for (const { path, heading } of ROUTES) {
    test(`${path} renders primary heading`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    })
  }
})

// ---------------------------------------------------------------------------
// Responsive layout — no horizontal overflow at any breakpoint
// ---------------------------------------------------------------------------

test.describe('responsive — no horizontal overflow', () => {
  for (const vp of VIEWPORTS) {
    for (const { path } of ROUTES) {
      test(`${path} at ${vp.width}px`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto(path)
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
      })
    }
  }
})

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

test.describe('keyboard navigation', () => {
  test('skip-to-content link is first Tab target on homepage', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toContainText(/skip/i)
  })

  test('desktop nav Science link is keyboard reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const scienceLink = page.getByRole('link', { name: 'Science' })
    await scienceLink.focus()
    await expect(scienceLink).toBeFocused()
  })

  test('mobile menu button is keyboard reachable and opens nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const menuButton = page.getByRole('button', { name: /toggle navigation/i })
    await menuButton.focus()
    await expect(menuButton).toBeFocused()
    await menuButton.press('Enter')
    await expect(page.getByRole('link', { name: 'Science' }).first()).toBeVisible()
  })

  test('waitlist email input and submit button are keyboard reachable', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('#waitlist-email')
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
    await page.keyboard.press('Tab')
    const submitButton = page.getByRole('button', { name: /Join the waitlist/i }).first()
    await expect(submitButton).toBeFocused()
  })

  test('science page TOC links are keyboard reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/science')
    const firstTocLink = page.locator('aside nav a').first()
    await firstTocLink.focus()
    await expect(firstTocLink).toBeFocused()
  })
})

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------

test.describe('reduced motion', () => {
  test('marquee animation is disabled', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/')
    const marqueeInner = page
      .locator('.overflow-hidden')
      .filter({ has: page.locator('[style*="animation"]') })
      .first()
    const style = await marqueeInner
      .locator('> div')
      .evaluate((el) => (el as HTMLElement).style.animation)
    expect(style).toBe('none')
    await context.close()
  })

  test('homepage loads without JS errors under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
    await context.close()
  })
})

// ---------------------------------------------------------------------------
// Waitlist form
// ---------------------------------------------------------------------------

test.describe('waitlist form', () => {
  test('invalid email format is caught by browser validation', async ({ page }) => {
    await page.goto('/')
    await page.locator('#waitlist-email').fill('not-an-email')
    await page
      .getByRole('button', { name: /Join the waitlist/i })
      .first()
      .click()
    const isInvalid = await page
      .locator('#waitlist-email')
      .evaluate((el) => !(el as HTMLInputElement).validity.valid)
    expect(isInvalid).toBe(true)
    await expect(page).toHaveURL('/')
  })

  test('empty submission is blocked by required constraint', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('button', { name: /Join the waitlist/i })
      .first()
      .click()
    const isInvalid = await page
      .locator('#waitlist-email')
      .evaluate((el) => !(el as HTMLInputElement).validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('valid submission redirects to thank-you page', async ({ page }) => {
    const testEmail = process.env.TEST_WAITLIST_EMAIL
    if (!testEmail) {
      test.skip()
    }
    await page.goto('/')
    await page.locator('#waitlist-email').fill(testEmail!)
    await page
      .getByRole('button', { name: /Join the waitlist/i })
      .first()
      .click()
    await expect(page).toHaveURL('/waitlist/thank-you', { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /You are on the waitlist/i })).toBeVisible()
  })
})
