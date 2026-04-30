import type { ReactNode } from 'react'
import { AccentText } from './AccentText'
import { Eyebrow } from './Eyebrow'

type SectionHeaderProps = {
  eyebrow: string
  headline: ReactNode
  sub: string
  className?: string
}

export function SectionHeader({ eyebrow, headline, sub, className = '' }: SectionHeaderProps) {
  return (
    <div className={className}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 max-w-4xl text-display-md text-marketing-text-primary sm:text-display-lg">
        {headline}
      </h2>
      <p className="mt-5 max-w-2xl text-body-lg text-marketing-text-secondary">{sub}</p>
    </div>
  )
}

export { AccentText }
