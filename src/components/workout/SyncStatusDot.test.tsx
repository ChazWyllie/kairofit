/**
 * Tests for SyncStatusDot component
 *
 * TDD: written BEFORE the implementation exists.
 * SyncStatusDot shows a visual indicator for offline sync state:
 * - No dot: all sets synced (count = 0)
 * - Orange dot + count: sets pending sync
 * - Red dot: sets in failed state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncStatusDot } from '@/components/workout/SyncStatusDot'

// Mock Dexie's useLiveQuery - it's a React hook that subscribes to IndexedDB changes.
// In tests we just control the returned value directly.
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}))

// Also mock the db module so Dexie doesn't try to open IndexedDB in jsdom
vi.mock('@/lib/offline/db', () => ({
  getPendingSetsCount: vi.fn(),
  default: {},
}))

import { useLiveQuery } from 'dexie-react-hooks'

describe('SyncStatusDot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nothing when pending count is 0', () => {
    vi.mocked(useLiveQuery).mockReturnValue(0)
    const { container } = render(<SyncStatusDot />)
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when pending count is undefined (loading)', () => {
    vi.mocked(useLiveQuery).mockReturnValue(undefined)
    const { container } = render(<SyncStatusDot />)
    expect(container.firstChild).toBeNull()
  })

  it('should show orange indicator and count when sets are pending', () => {
    vi.mocked(useLiveQuery).mockReturnValue(3)
    render(<SyncStatusDot />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should show count of 1 for a single pending set', () => {
    vi.mocked(useLiveQuery).mockReturnValue(1)
    render(<SyncStatusDot />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should have accessible label describing sync state', () => {
    vi.mocked(useLiveQuery).mockReturnValue(2)
    render(<SyncStatusDot />)
    const statusEl = screen.getByRole('status')
    expect(statusEl).toHaveAttribute('aria-label', expect.stringMatching(/sync/i))
  })
})
