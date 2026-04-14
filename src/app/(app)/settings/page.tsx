import type { Metadata } from 'next'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'

export const metadata: Metadata = {
  title: 'Settings - KairoFit',
}

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold text-[#F5F5F4]">Settings</h1>

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
