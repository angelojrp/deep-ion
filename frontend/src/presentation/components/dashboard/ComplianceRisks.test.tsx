import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@test/helpers/render'
import { ComplianceRisks } from './ComplianceRisks'
import type { ComplianceRisks as ComplianceRisksType } from '@domain/models/po-dashboard'

const mockCompliance: ComplianceRisksType = {
  activeLgpdFlags: 3,
  auditedDecisionRecordsPercent: 0.91,
  undetectedRnViolations: 0,
  t3PendingGateOver48h: 1,
  archConformanceViolationsPercent: 0.03,
  businessRisks: [
    { id: 'RNE-01', name: 'Provider LLM unico', severity: 'high', status: 'monitoring', probability: 0.35, description: 'Risco' },
    { id: 'RNE-03', name: 'Latencia Keycloak', severity: 'medium', status: 'active', probability: 0.20, description: 'SSO' },
  ],
  externalDependencies: [
    { name: 'GitHub API', status: 'healthy', lastCheckedAt: '2026-03-03T08:30:00Z' },
    { name: 'Keycloak SSO', status: 'degraded', lastCheckedAt: '2026-03-03T08:25:00Z' },
  ],
}

describe('ComplianceRisks', () => {
  it('renders compliance title', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByText(/Conformidade e Riscos|Compliance/)).toBeInTheDocument()
  })

  it('renders LGPD flags count', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders audited records percentage', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByText('91%')).toBeInTheDocument()
  })

  it('renders zero violations with success indicator', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders business risk IDs', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByText('RNE-01')).toBeInTheDocument()
    expect(screen.getByText('RNE-03')).toBeInTheDocument()
  })

  it('renders external dependencies', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByText('GitHub API')).toBeInTheDocument()
    expect(screen.getByText('Keycloak SSO')).toBeInTheDocument()
  })

  it('has accessible region label', () => {
    renderWithProviders(<ComplianceRisks data={mockCompliance} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
