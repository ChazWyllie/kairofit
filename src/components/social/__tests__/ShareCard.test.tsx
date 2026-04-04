/**
 * ShareCard Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareCard } from '../ShareCard'

// Mock usePostHog
vi.mock('posthog-js/react', () => ({
  usePostHog: vi.fn(() => ({
    capture: vi.fn(),
  })),
}))

// Mock navigator.share
Object.assign(navigator, {
  share: vi.fn().mockResolvedValue(undefined),
})

describe('ShareCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the share button', () => {
    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest', 'triceps']}
        streakDays={5}
      />
    )
    expect(screen.getByText('Share Workout')).toBeInTheDocument()
  })

  it('toggles card visibility when share button is clicked', async () => {
    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest', 'triceps']}
        streakDays={5}
      />
    )

    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Workout Summary')).toBeInTheDocument()
    })
  })

  it('displays session stats in the card', async () => {
    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest', 'triceps']}
        streakDays={5}
      />
    )

    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('45m')).toBeInTheDocument()
      expect(screen.getByText('1500kg')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('5d')).toBeInTheDocument()
    })
  })

  it('displays muscle groups in the card', async () => {
    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest', 'triceps']}
        streakDays={5}
      />
    )

    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('chest')).toBeInTheDocument()
      expect(screen.getByText('triceps')).toBeInTheDocument()
    })
  })

  it('fires SHARE_CARD_GENERATED event when shared', async () => {
    const { usePostHog } = await import('posthog-js/react')
    const mockCapture = vi.fn()
    vi.mocked(usePostHog).mockReturnValue({
      capture: mockCapture,
    } as any)

    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest', 'triceps']}
        streakDays={5}
      />
    )

    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCapture).toHaveBeenCalledWith(
        'SHARE_CARD_GENERATED',
        expect.objectContaining({
          session_id: 'test-123',
          duration_minutes: 45,
          total_sets: 10,
          total_volume_kg: 1500,
          streak_days: 5,
        })
      )
    })
  })

  it('handles null duration gracefully', async () => {
    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={null}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest']}
        streakDays={5}
      />
    )

    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  it('provides copy to clipboard functionality', async () => {
    const mockClipboard = {
      writeText: vi.fn(),
    }
    Object.assign(navigator, { clipboard: mockClipboard })

    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest']}
        streakDays={5}
      />
    )

    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      const copyButton = screen.getByText('Copy Text')
      fireEvent.click(copyButton)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })
  })

  it('closes card when close button is clicked', async () => {
    render(
      <ShareCard
        sessionId="test-123"
        durationMinutes={45}
        totalSets={10}
        totalVolumeKg={1500}
        musclesWorked={['chest']}
        streakDays={5}
      />
    )

    // Open card
    const button = screen.getByText('Share Workout')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Workout Summary')).toBeInTheDocument()
    })

    // Close card
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Workout Summary')).not.toBeInTheDocument()
    })
  })
})
