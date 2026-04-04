/**
 * KiroDebrief Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KiroDebrief } from '../KiroDebrief'

// Mock the useCompletion hook
vi.mock('ai/react', () => ({
  useCompletion: vi.fn(() => ({
    completion: 'Test debrief text',
    isLoading: false,
    complete: vi.fn(),
  })),
}))

describe('KiroDebrief', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Kiro header', () => {
    render(<KiroDebrief sessionId="test-session-123" />)
    expect(screen.getByText("Kiro's analysis")).toBeInTheDocument()
  })

  it('displays Kiro avatar icon', () => {
    render(<KiroDebrief sessionId="test-session-123" />)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders loading state initially', async () => {
    const { useCompletion } = await import('ai/react')
    vi.mocked(useCompletion).mockReturnValueOnce({
      completion: '',
      isLoading: true,
      complete: vi.fn(),
    } as unknown as ReturnType<typeof useCompletion>)

    render(<KiroDebrief sessionId="test-session-123" />)
    expect(screen.getByText('Analyzing your session...')).toBeInTheDocument()
  })

  it('renders completed debrief text', async () => {
    render(<KiroDebrief sessionId="test-session-123" />)
    await waitFor(() => {
      expect(screen.getByText('Test debrief text')).toBeInTheDocument()
    })
  })

  it('calls onComplete callback when debrief finishes', async () => {
    const { useCompletion } = await import('ai/react')
    const mockOnComplete = vi.fn()

    vi.mocked(useCompletion).mockReturnValueOnce({
      completion: 'Test debrief',
      isLoading: false,
      complete: vi.fn(),
    } as unknown as ReturnType<typeof useCompletion>)

    render(<KiroDebrief sessionId="test-session-123" onComplete={mockOnComplete} />)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('uses correct API endpoint for streaming', async () => {
    const { useCompletion } = await import('ai/react')
    const mockComplete = vi.fn()

    vi.mocked(useCompletion).mockReturnValueOnce({
      completion: '',
      isLoading: false,
      complete: mockComplete,
    } as unknown as ReturnType<typeof useCompletion>)

    render(<KiroDebrief sessionId="abc-123" />)

    // Check that useCompletion was called with the correct API path
    expect(useCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        api: '/api/debrief/abc-123',
      })
    )
  })

  it('shows error message when debrief fails to load', async () => {
    const { useCompletion } = await import('ai/react')

    vi.mocked(useCompletion).mockReturnValueOnce({
      completion: '',
      isLoading: false,
      complete: vi.fn(),
    } as unknown as ReturnType<typeof useCompletion>)

    render(<KiroDebrief sessionId="test-session-123" />)

    // When completion is empty and not loading, should show error
    await waitFor(() => {
      expect(screen.getByText('Failed to load debrief. Please try again.')).toBeInTheDocument()
    })
  })
})
