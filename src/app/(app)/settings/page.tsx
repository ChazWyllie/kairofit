import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'
import { MeasurementLogger } from '@/components/profile/MeasurementLogger'
import { MeasurementHistory } from '@/components/profile/MeasurementHistory'

export const metadata: Metadata = {
  title: 'Settings - KairoFit',
}

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#F5F5F4]">Settings</h1>

      <MeasurementLogger />

      <Suspense
        fallback={
          <div className="h-32 animate-pulse rounded-xl border border-[#2A2A2F] bg-[#111113]" />
        }
      >
        <MeasurementHistory />
      </Suspense>

      <section className="rounded-xl border border-[#2A2A2F] bg-[#111113] p-6">
        <h2 className="mb-1 text-base font-semibold text-[#F5F5F4]">Danger zone</h2>
        <p className="mb-4 text-sm text-[#A1A19E]">
          Permanently delete your account and all associated data.
        </p>
        <DeleteAccountDialog />
      </section>
    </main>
  )
}
