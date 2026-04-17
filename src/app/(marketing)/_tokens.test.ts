import { describe, it, expect } from 'vitest'
import tailwindConfig from '../../../tailwind.config'
import { marketingTokens } from './_tokens'

/**
 * Drift guard: the TypeScript marketingTokens export (consumed by MarketingOgImage
 * and any runtime code that needs raw hex/rgba values) must match the Tailwind
 * theme.extend.colors.marketing.* values exactly. Both sources exist because
 * Tailwind cannot import TS objects, and MarketingOgImage cannot use Tailwind
 * classes. If they diverge, the rendered UI and the OG image (or any direct
 * style={{ color: marketingTokens.x }}) will drift visually. This test fails
 * fast when that happens.
 */

const camelToKebab = (key: string): string => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)

describe('marketing token drift guard', () => {
  const tailwindMarketing = (tailwindConfig.theme?.extend?.colors as Record<string, unknown>)
    ?.marketing as Record<string, string> | undefined

  it('has marketing colors configured in tailwind.config', () => {
    expect(tailwindMarketing).toBeDefined()
  })

  it('matches every marketingTokens entry against tailwind config', () => {
    if (!tailwindMarketing) throw new Error('tailwindMarketing missing')

    for (const [tsKey, tsValue] of Object.entries(marketingTokens)) {
      const tailwindKey = camelToKebab(tsKey)
      expect(
        tailwindMarketing[tailwindKey],
        `tailwind.config.colors.marketing.${tailwindKey}`
      ).toBe(tsValue)
    }
  })

  it('does not define extra tailwind marketing colors beyond marketingTokens', () => {
    if (!tailwindMarketing) throw new Error('tailwindMarketing missing')

    const tsKeys = new Set(Object.keys(marketingTokens).map(camelToKebab))
    const tailwindKeys = Object.keys(tailwindMarketing)
    for (const key of tailwindKeys) {
      expect(tsKeys.has(key), `tailwind has extra marketing.${key} not in marketingTokens`).toBe(
        true
      )
    }
  })
})
