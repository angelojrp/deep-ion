import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@test/helpers/render'
import { BusinessQuality } from './BusinessQuality'
import type { BusinessQuality as BusinessQualityType } from '@domain/models/po-dashboard'

const mockQuality: BusinessQualityType = {
  briefGatePassRate: 0.78,
  avgConfidenceScore: 0.72,
  gherkinCompleteness: 0.85,
  openQuestionsCount: 7,
  traceabilityCoverage: 0.68,
  reworkRate: 0.15,
}

describe('BusinessQuality', () => {
  it('renders the quality title', () => {
    renderWithProviders(<BusinessQuality data={mockQuality} />)
    expect(screen.getByText(/Qualidade Negocial|Business Quality/)).toBeInTheDocument()
  })

  it('renders all quality metrics', () => {
    renderWithProviders(<BusinessQuality data={mockQuality} />)
    // Check values are rendered
    expect(screen.getByText('78%')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('68%')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('shows open questions alert', () => {
    renderWithProviders(<BusinessQuality data={mockQuality} />)
    expect(screen.getByText(/7 questões abertas|7 open questions/)).toBeInTheDocument()
  })

  it('hides alert when no open questions', () => {
    const noQuestions = { ...mockQuality, openQuestionsCount: 0 }
    renderWithProviders(<BusinessQuality data={noQuestions} />)
    expect(screen.queryByText(/questões abertas|open questions/)).not.toBeInTheDocument()
  })

  it('has accessible region label', () => {
    renderWithProviders(<BusinessQuality data={mockQuality} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
