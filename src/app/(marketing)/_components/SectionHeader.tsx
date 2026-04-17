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
      <h2 className="mt-4 max-w-4xl text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#F5F5F4] sm:text-[56px]">
        {headline}
      </h2>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#A1A19E]">{sub}</p>
    </div>
  )
}

export { AccentText }
