import type { ReactNode } from 'react'

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-[24px] border border-[#1F1F23] bg-[#111113] p-6">
      <div className="font-mono text-[44px] font-medium leading-none tracking-[-0.03em] text-[#CAFF4C]">
        {value}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#A1A19E]">{label}</p>
    </div>
  )
}
