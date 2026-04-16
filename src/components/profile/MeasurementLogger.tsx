'use client'

/**
 * MeasurementLogger
 *
 * Inline form for logging a body measurement entry.
 * Calls logMeasurementAction which encrypts values via Vault before inserting.
 * All fields are optional - user logs what they have.
 * revalidatePath('/settings') on the action refreshes MeasurementHistory automatically.
 */

import { useState, useTransition } from 'react'
import { logMeasurementAction } from '@/actions/profile.actions'

interface Field {
  key: 'weight_kg' | 'body_fat_pct' | 'chest_cm' | 'waist_cm' | 'hips_cm'
  label: string
  unit: string
  min: number
  max: number
  step: number
}

const FIELDS: Field[] = [
  { key: 'weight_kg', label: 'Weight', unit: 'kg', min: 20, max: 400, step: 0.1 },
  { key: 'body_fat_pct', label: 'Body fat', unit: '%', min: 3, max: 70, step: 0.1 },
  { key: 'chest_cm', label: 'Chest', unit: 'cm', min: 50, max: 200, step: 0.5 },
  { key: 'waist_cm', label: 'Waist', unit: 'cm', min: 40, max: 200, step: 0.5 },
  { key: 'hips_cm', label: 'Hips', unit: 'cm', min: 50, max: 200, step: 0.5 },
]

export function MeasurementLogger() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
    setError(null)
  }

  function handleSubmit() {
    setError(null)
    setSuccess(false)

    const parsed: Record<string, number | string | undefined> = {}
    for (const field of FIELDS) {
      const raw = values[field.key]
      if (raw !== undefined && raw !== '') {
        const num = parseFloat(raw)
        if (!isNaN(num)) parsed[field.key] = num
      }
    }
    if (notes.trim()) parsed.notes = notes.trim()

    const hasAtLeastOneValue = FIELDS.some((f) => parsed[f.key] !== undefined)
    if (!hasAtLeastOneValue) {
      setError('Enter at least one measurement to log.')
      return
    }

    startTransition(async () => {
      const result = await logMeasurementAction(
        parsed as Parameters<typeof logMeasurementAction>[0]
      )

      if (result?.serverError || result?.validationErrors) {
        setError('Something went wrong. Please check your values and try again.')
        return
      }

      setValues({})
      setNotes('')
      setSuccess(true)
    })
  }

  return (
    <div className="rounded-xl border border-[#2A2A2F] bg-[#111113] p-6">
      <h2 className="mb-1 text-base font-semibold text-[#F5F5F4]">Log measurement</h2>
      <p className="mb-5 text-sm text-[#A1A19E]">
        All fields are optional - log what you have. Values are encrypted before storage.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium text-[#A1A19E]">
              {field.label} <span className="text-[#6B6B68]">({field.unit})</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step={field.step}
              value={values[field.key] ?? ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              disabled={isPending}
              placeholder="-"
              className="w-full rounded-md border border-[#2A2A2F] bg-[#1A1A1F] px-3 py-2 text-sm text-[#F5F5F4] placeholder-[#6B6B68] focus:border-[#6366F1] focus:outline-none disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-[#A1A19E]">Notes (optional)</label>
        <input
          type="text"
          maxLength={500}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setSuccess(false)
          }}
          disabled={isPending}
          placeholder="e.g. morning, fasted"
          className="w-full rounded-md border border-[#2A2A2F] bg-[#1A1A1F] px-3 py-2 text-sm text-[#F5F5F4] placeholder-[#6B6B68] focus:border-[#6366F1] focus:outline-none disabled:opacity-50"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-400">Measurement logged.</p>}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-4 rounded-md bg-[#6366F1] px-5 py-2 text-sm font-medium text-white hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save measurement'}
      </button>
    </div>
  )
}
