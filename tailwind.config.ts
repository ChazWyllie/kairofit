import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        marketing: {
          bg: '#0A0A0B',
          'bg-deep': '#050506',
          'bg-tint': '#0D0D10',
          'bg-layer': '#0F1012',
          'bg-elevated': '#111113',
          'bg-subtle': '#17171A',
          surface: '#121316',
          'surface-raised': '#141518',
          border: '#1F1F23',
          'border-strong': '#2A2A2F',
          'text-primary': '#F5F5F4',
          'text-secondary': '#A1A19E',
          'text-muted': '#6B6B68',
          'text-faint': '#2F3035',
          accent: '#CAFF4C',
          'accent-muted': 'rgba(202, 255, 76, 0.15)',
          'accent-tint': 'rgba(202, 255, 76, 0.08)',
          'accent-outline': 'rgba(202, 255, 76, 0.2)',
          'accent-on': '#0A0A0B',
          success: '#10B981',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '600' }],
        'display-xl-mobile': [
          '52px',
          { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '600' },
        ],
        'display-lg': ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg-mobile': [
          '44px',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        'display-md': ['40px', { lineHeight: '1.10', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md-mobile': [
          '32px',
          { lineHeight: '1.10', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'heading-xl': [
          '48px',
          { lineHeight: '1.02', letterSpacing: '-0.04em', fontWeight: '600' },
        ],
        'heading-lg': [
          '36px',
          { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        'heading-md': [
          '32px',
          { lineHeight: '1.10', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        heading: ['24px', { lineHeight: '1.30', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.50', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.60', fontWeight: '400' }],
        small: ['14px', { lineHeight: '1.50', fontWeight: '400' }],
        'mono-stat': ['48px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
        'mono-label-md': ['13px', { lineHeight: '1.40', fontWeight: '500' }],
        'mono-label': ['12px', { lineHeight: '1.40', letterSpacing: '0.08em', fontWeight: '500' }],
        'mono-label-xs': ['11px', { lineHeight: '1.40', fontWeight: '500' }],
      },
      spacing: {
        'section-y-desktop': '160px',
        'section-y-mobile': '96px',
        'container-max': '1280px',
        'grid-gutter': '32px',
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        pill: '9999px',
      },
      boxShadow: {
        'accent-glow-sm': '0 0 24px rgba(202, 255, 76, 0.15)',
        'accent-glow': '0 0 44px rgba(202, 255, 76, 0.25)',
        surface: '0 24px 80px -48px rgba(0, 0, 0, 0.9)',
      },
    },
  },
  plugins: [],
}

export default config
