/**
 * StreakMilestone Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakMilestone } from '../StreakMilestone'

describe('StreakMilestone', () => {
  it('renders the streak count', () => {
    render(<StreakMilestone streak={5} isMilestone={false} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('displays "day" for streak of 1', () => {
    render(<StreakMilestone streak={1} isMilestone={false} />)
    expect(screen.getByText('day')).toBeInTheDocument()
  })

  it('displays "days" for streak > 1', () => {
    render(<StreakMilestone streak={5} isMilestone={false} />)
    expect(screen.getByText('days')).toBeInTheDocument()
  })

  it('renders milestone message when isMilestone is true and streak is 7', () => {
    render(<StreakMilestone streak={7} isMilestone={true} />)
    expect(screen.getByText('One week of consistency!')).toBeInTheDocument()
  })

  it('renders milestone message for 30-day milestone', () => {
    render(<StreakMilestone streak={30} isMilestone={true} />)
    expect(screen.getByText('A full month of training!')).toBeInTheDocument()
  })

  it('does not render milestone message when isMilestone is false', () => {
    render(<StreakMilestone streak={7} isMilestone={false} />)
    expect(screen.queryByText('One week of consistency!')).not.toBeInTheDocument()
  })

  it('renders for non-milestone streaks without error', () => {
    render(<StreakMilestone streak={10} isMilestone={false} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
