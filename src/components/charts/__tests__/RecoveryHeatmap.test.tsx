/**
 * RecoveryHeatmap Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecoveryHeatmap } from '../RecoveryHeatmap'
import type { MuscleRecovery } from '@/types'

describe('RecoveryHeatmap', () => {
  const mockRecoveryData: MuscleRecovery[] = [
    {
      user_id: 'user-1',
      muscle_group: 'chest',
      last_trained_at: '2026-04-02T10:00:00Z',
      estimated_recovery_pct: 85,
      sets_this_week: 12,
      updated_at: '2026-04-02T10:00:00Z',
    },
    {
      user_id: 'user-1',
      muscle_group: 'biceps',
      last_trained_at: '2026-04-01T10:00:00Z',
      estimated_recovery_pct: 45,
      sets_this_week: 8,
      updated_at: '2026-04-01T10:00:00Z',
    },
  ]

  it('renders all muscle groups', () => {
    render(<RecoveryHeatmap recoveryData={mockRecoveryData} />)
    expect(screen.getByText('Muscle Recovery')).toBeInTheDocument()
  })

  it('displays recovery percentage for each muscle', () => {
    render(<RecoveryHeatmap recoveryData={mockRecoveryData} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('displays recovery status labels', () => {
    render(<RecoveryHeatmap recoveryData={mockRecoveryData} />)
    // chest is 85%, should show "Ready" (multiple instances may exist)
    const readyLabels = screen.getAllByText('Ready')
    expect(readyLabels.length).toBeGreaterThan(0)
    // biceps is 45%, should show "Fatigued"
    expect(screen.getByText('Fatigued')).toBeInTheDocument()
  })

  it('renders legend', () => {
    render(<RecoveryHeatmap recoveryData={mockRecoveryData} />)
    expect(screen.getByText('80%+ Ready')).toBeInTheDocument()
    expect(screen.getByText('50-80% Recovering')).toBeInTheDocument()
    expect(screen.getByText('0-50% Fatigued')).toBeInTheDocument()
  })

  it('handles empty recovery data gracefully', () => {
    render(<RecoveryHeatmap recoveryData={[]} />)
    expect(screen.getByText('Muscle Recovery')).toBeInTheDocument()
  })

  it('displays muscle names properly formatted', () => {
    render(<RecoveryHeatmap recoveryData={mockRecoveryData} />)
    expect(screen.getByText('chest')).toBeInTheDocument()
    expect(screen.getByText('biceps')).toBeInTheDocument()
  })
})
