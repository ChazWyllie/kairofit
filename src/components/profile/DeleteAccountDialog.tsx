'use client'

/**
 * DeleteAccountDialog
 *
 * Requires the user to type "DELETE" to confirm, then:
 * 1. Clears IndexedDB (prevents orphaned offline data)
 * 2. Calls deleteAccountAction
 * 3. Signs out and redirects to /
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/db/supabase-browser'
import { clearAllData } from '@/lib/offline/db'
import { deleteAccountAction } from '@/actions/profile.actions'

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createBrowserClient()

  function handleOpen() {
    setOpen(true)
    setConfirmation('')
    setError(null)
  }

  function handleCancel() {
    setOpen(false)
    setConfirmation('')
    setError(null)
  }

  function handleSubmit() {
    startTransition(async () => {
      setError(null)

      // Clear offline data first - prevents orphaned IndexedDB rows after auth is gone
      await clearAllData()

      const result = await deleteAccountAction({ confirmation: confirmation as 'DELETE' })

      if (result?.serverError) {
        setError('Something went wrong. Please try again or contact support.')
        return
      }

      if (result?.data?.revoke_sessions) {
        await supabase.auth.signOut()
        router.push('/')
      }
    })
  }

  const canSubmit = confirmation === 'DELETE' && !isPending

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Delete account
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#1A1A1F] p-6 shadow-2xl">
        <h2 className="mb-2 text-lg font-semibold text-[#F5F5F4]">Delete your account</h2>
        <p className="mb-4 text-sm text-[#A1A19E]">
          This will permanently delete your account and all your data - workouts, programs,
          measurements. This cannot be undone.
        </p>
        <p className="mb-3 text-sm text-[#F5F5F4]">
          Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm.
        </p>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE"
          disabled={isPending}
          className="mb-4 w-full rounded-md border border-[#2A2A2F] bg-[#111113] px-3 py-2 text-sm text-[#F5F5F4] placeholder-[#6B6B68] focus:border-red-500 focus:outline-none disabled:opacity-50"
        />
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 rounded-md border border-[#2A2A2F] px-4 py-2 text-sm font-medium text-[#A1A19E] hover:bg-[#111113] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  )
}
