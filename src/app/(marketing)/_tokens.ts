export const marketingTokens = {
  bg: '#0A0A0B',
  bgElevated: '#111113',
  bgSubtle: '#17171A',
  border: '#1F1F23',
  borderStrong: '#2A2A2F',
  textPrimary: '#F5F5F4',
  textSecondary: '#A1A19E',
  textMuted: '#6B6B68',
  accent: '#CAFF4C',
  accentMuted: 'rgba(202, 255, 76, 0.15)',
  accentOn: '#0A0A0B',
  success: '#10B981',
  danger: '#EF4444',
} as const

export type MarketingTokenKey = keyof typeof marketingTokens
