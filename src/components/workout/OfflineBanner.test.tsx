/**
 * Tests for OfflineBanner component
 *
 * TDD: written BEFORE the implementation exists.
 * OfflineBanner listens to 'online'/'offline' window events and
 * shows a banner when the network is unavailable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { OfflineBanner } from '@/components/workout/OfflineBanner'

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore navigator.onLine to true after each test
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  it('should not render anything when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { container } = render(<OfflineBanner />)
    // No visible content when online
    expect(container.firstChild).toBeNull()
  })

  it('should render a banner when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    render(<OfflineBanner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should display offline message when network is unavailable', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    render(<OfflineBanner />)
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })

  it('should show banner when offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    render(<OfflineBanner />)

    // Initially online - no banner
    expect(screen.queryByRole('status')).toBeNull()

    // Fire offline event
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should hide banner when online event fires after being offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    render(<OfflineBanner />)

    // Initially offline - banner visible
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Fire online event
    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(screen.queryByRole('status')).toBeNull()
  })

  it('should clean up event listeners on unmount', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<OfflineBanner />)

    const addedListeners = addSpy.mock.calls.map((c) => c[0])
    expect(addedListeners).toContain('online')
    expect(addedListeners).toContain('offline')

    unmount()

    const removedListeners = removeSpy.mock.calls.map((c) => c[0])
    expect(removedListeners).toContain('online')
    expect(removedListeners).toContain('offline')
  })
})
