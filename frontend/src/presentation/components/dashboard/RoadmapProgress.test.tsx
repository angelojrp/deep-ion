import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@test/helpers/render'
import { RoadmapProgress } from './RoadmapProgress'
import type { RoadmapStatus } from '@domain/models/po-dashboard'

const mockRoadmap: RoadmapStatus = {
  milestones: [
    {
      id: 'M1',
      name: 'Marco 1 - MVP Pipeline',
      targetDate: '2026-05-15',
      mustTotal: 18,
      mustCompleted: 11,
      overallProgress: 0.61,
    },
    {
      id: 'M2',
      name: 'Marco 2 - Multi-tenant',
      targetDate: '2026-09-30',
      mustTotal: 24,
      mustCompleted: 7,
      overallProgress: 0.29,
    },
  ],
  remainingCapacityWeeks: 14,
  weeklyThroughputAvg: 10.8,
  businessDebtCount: 4,
}

describe('RoadmapProgress', () => {
  it('renders roadmap title', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    expect(screen.getByText(/Progresso do Roadmap|Roadmap Progress/)).toBeInTheDocument()
  })

  it('renders milestone names', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    expect(screen.getByText('Marco 1 - MVP Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Marco 2 - Multi-tenant')).toBeInTheDocument()
  })

  it('renders milestone percentages', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    expect(screen.getByText('61%')).toBeInTheDocument()
    expect(screen.getByText('29%')).toBeInTheDocument()
  })

  it('renders progress bars with correct aria attributes', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(2)
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '61')
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '29')
  })

  it('shows must-have progress counts', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    expect(screen.getByText(/11\/18/)).toBeInTheDocument()
    expect(screen.getByText(/7\/24/)).toBeInTheDocument()
  })

  it('renders capacity metrics', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('10.8')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('has accessible region label', () => {
    renderWithProviders(<RoadmapProgress data={mockRoadmap} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
