import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { SkipToContent } from './SkipToContent'

interface MarketingShellProps {
  children: ReactNode
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  )
}
