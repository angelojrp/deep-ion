import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@test/helpers/render'
import { PipelineKanban } from './PipelineKanban'
import type { PipelineStageCount, PipelineDemand } from '@domain/models/po-dashboard'

const mockStageCounts: PipelineStageCount[] = [
  { stage: 'discovery', count: 1, blockedCount: 0 },
  { stage: 'analysis', count: 2, blockedCount: 1 },
  { stage: 'gate-1', count: 0, blockedCount: 0 },
  { stage: 'gate-2', count: 0, blockedCount: 0 },
  { stage: 'development', count: 1, blockedCount: 0 },
  { stage: 'gate-3', count: 0, blockedCount: 0 },
  { stage: 'gate-4', count: 0, blockedCount: 0 },
  { stage: 'done', count: 1, blockedCount: 0 },
]

const mockDemands: PipelineDemand[] = [
  {
    id: 'DEM-001',
    title: 'Cadastro de tenants',
    tier: 'T1',
    stage: 'discovery',
    status: 'active',
    ageDays: 2,
    reworkCount: 0,
    moscowPriority: 'must',
    lgpdFlag: false,
    createdAt: '2026-03-01T10:00:00Z',
    assignee: 'CAL-Agent',
  },
  {
    id: 'DEM-002',
    title: 'Validação LGPD',
    tier: 'T3',
    stage: 'analysis',
    status: 'blocked',
    ageDays: 5,
    reworkCount: 2,
    moscowPriority: 'must',
    lgpdFlag: true,
    createdAt: '2026-02-25T14:00:00Z',
    assignee: 'Maria Santos',
  },
  {
    id: 'DEM-003',
    title: 'Dashboard métricas',
    tier: 'T2',
    stage: 'development',
    status: 'active',
    ageDays: 3,
    reworkCount: 1,
    moscowPriority: 'should',
    lgpdFlag: false,
    createdAt: '2026-02-27T11:00:00Z',
    assignee: 'DOM-04-Agent',
  },
]

describe('PipelineKanban', () => {
  it('renders all pipeline stages', () => {
    renderWithProviders(
      <PipelineKanban stageCounts={mockStageCounts} demands={mockDemands} />,
    )
    // Check some stage names are rendered (i18n keys)
    expect(screen.getByText(/Descoberta|Discovery/)).toBeInTheDocument()
    expect(screen.getByText(/Análise|Analysis/)).toBeInTheDocument()
    expect(screen.getByText(/Desenvolvimento|Development/)).toBeInTheDocument()
    expect(screen.getByText(/Concluído|Done/)).toBeInTheDocument()
  })

  it('renders demand cards with IDs', () => {
    renderWithProviders(
      <PipelineKanban stageCounts={mockStageCounts} demands={mockDemands} />,
    )
    expect(screen.getByText('DEM-001')).toBeInTheDocument()
    expect(screen.getByText('DEM-002')).toBeInTheDocument()
    expect(screen.getByText('DEM-003')).toBeInTheDocument()
  })

  it('shows LGPD flag on flagged demands', () => {
    renderWithProviders(
      <PipelineKanban stageCounts={mockStageCounts} demands={mockDemands} />,
    )
    expect(screen.getByText('LGPD')).toBeInTheDocument()
  })

  it('shows blocked count when stages have blocked items', () => {
    renderWithProviders(
      <PipelineKanban stageCounts={mockStageCounts} demands={mockDemands} />,
    )
    expect(screen.getByText(/1 bloqueada|1 blocked/)).toBeInTheDocument()
  })

  it('has accessible region label', () => {
    renderWithProviders(
      <PipelineKanban stageCounts={mockStageCounts} demands={mockDemands} />,
    )
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
