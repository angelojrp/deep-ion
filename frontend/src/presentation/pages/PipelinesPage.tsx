import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GitBranch,
  Plus,
  Search,
  Globe,
  FolderKanban,
  CheckCircle,
  FileEdit,
  Archive,
  ChevronRight,
  Settings2,
  Bot,
  Cpu,
  Layers,
  X,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { usePipelines, useCreatePipeline } from '@application/hooks/usePipelines'
import type { PipelineScope, PipelineStatus, PipelineSummary } from '@domain/models/pipeline'

/* ── Status config ── */
const statusConfig: Record<PipelineStatus, { icon: typeof CheckCircle; label: string; className: string }> = {
  active: { icon: CheckCircle, label: 'pipelinesPage.status.active', className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
  draft: { icon: FileEdit, label: 'pipelinesPage.status.draft', className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
  archived: { icon: Archive, label: 'pipelinesPage.status.archived', className: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
}

/* ── Scope config ── */
const scopeConfig: Record<PipelineScope, { icon: typeof Globe; label: string; className: string }> = {
  global: { icon: Globe, label: 'pipelinesPage.scope.global', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  project: { icon: FolderKanban, label: 'pipelinesPage.scope.project', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
}

/* ═══════════════════════════════════════════
 *  Create Pipeline Dialog
 * ═══════════════════════════════════════════ */
interface CreateDialogProps { open: boolean; onClose: () => void }

function CreatePipelineDialog({ open, onClose }: CreateDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreatePipeline()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scope, setScope] = useState<PipelineScope>('global')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reset = useCallback(() => { setName(''); setDescription(''); setScope('global'); setErrors({}) }, [])
  const handleClose = useCallback(() => { reset(); onClose() }, [reset, onClose])

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = t('pipelinesPage.form.errors.nameRequired')
    if (!description.trim()) e.description = t('pipelinesPage.form.errors.descriptionRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }, [name, description, t])

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    try {
      await createMutation.mutateAsync({ name: name.trim(), description: description.trim(), scope })
      handleClose()
    } catch { setErrors({ submit: t('pipelinesPage.form.errors.submitFailed') }) }
  }, [name, description, scope, validate, createMutation, handleClose, t])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={t('pipelinesPage.form.title')}>
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-[var(--radius-lg)] bg-card border border-border shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t('pipelinesPage.form.title')}</h2>
            <p className="text-sm text-text-muted mt-0.5">{t('pipelinesPage.form.subtitle')}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-muted transition-colors" aria-label={t('common.close')}>
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">{errors.submit}</div>}
          <div>
            <label htmlFor="pipe-name" className="block text-sm font-medium text-text-primary mb-1">{t('pipelinesPage.form.name')}</label>
            <input id="pipe-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('pipelinesPage.form.namePlaceholder')} className={cn('w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50', errors.name ? 'border-red-500' : 'border-border')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="pipe-desc" className="block text-sm font-medium text-text-primary mb-1">{t('pipelinesPage.form.description')}</label>
            <textarea id="pipe-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('pipelinesPage.form.descriptionPlaceholder')} className={cn('w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none', errors.description ? 'border-red-500' : 'border-border')} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('pipelinesPage.form.scope')}</label>
            <div className="flex gap-3">
              {(['global', 'project'] as PipelineScope[]).map((s) => {
                const cfg = scopeConfig[s]
                const Icon = cfg.icon
                return (
                  <button key={s} type="button" onClick={() => setScope(s)} className={cn('flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors', scope === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:bg-muted')}>
                    <Icon className="h-4 w-4" />
                    {t(cfg.label)}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-border text-text-secondary hover:bg-muted transition-colors">{t('common.cancel')}</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {createMutation.isPending ? t('common.loading') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
 *  Pipeline Card
 * ═══════════════════════════════════════════ */
interface PipelineCardProps { pipeline: PipelineSummary; onSelect: (id: string) => void }

function PipelineCard({ pipeline, onSelect }: PipelineCardProps) {
  const { t } = useTranslation()
  const status = statusConfig[pipeline.status]
  const scope = scopeConfig[pipeline.scope]
  const StatusIcon = status.icon
  const ScopeIcon = scope.icon

  return (
    <button onClick={() => onSelect(pipeline.id)} className={cn('w-full text-left rounded-[var(--radius-lg)] border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all group focus:outline-none focus:ring-2 focus:ring-primary/50', pipeline.scope === 'global' ? 'border-l-4 border-l-indigo-500' : 'border-l-4 border-l-teal-500')} aria-label={t('pipelinesPage.openPipeline', { name: pipeline.name })}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text-primary truncate">{pipeline.name}</h3>
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
              <StatusIcon className="h-3 w-3" /> {t(status.label)}
            </span>
          </div>
          <p className="text-xs text-text-muted line-clamp-2 mb-3">{pipeline.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium', scope.className)}>
              <ScopeIcon className="h-3 w-3" /> {t(scope.label)}
            </span>
            {pipeline.projectName && <span className="text-text-secondary">{pipeline.projectName}</span>}
            <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {pipeline.tierCount} tiers</span>
            <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {pipeline.assignmentCount} {t('pipelinesPage.assignments')}</span>
            <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> {pipeline.domainsConfigured}/5 {t('pipelinesPage.domains')}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors shrink-0 ml-3" />
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════
 *  PipelinesPage
 * ═══════════════════════════════════════════ */
function PipelinesPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState<PipelineScope | ''>('')
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | ''>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: pipelines, isLoading, isError, refetch } = usePipelines()

  const filtered = useMemo(() => {
    if (!pipelines) return []
    return pipelines.filter((p) => {
      if (scopeFilter && p.scope !== scopeFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.projectName?.toLowerCase().includes(q) ?? false)
      }
      return true
    })
  }, [pipelines, scopeFilter, statusFilter, search])

  if (selectedId) {
    return <PipelineDetailView id={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <>
      <Header title={t('pipelinesPage.title')} subtitle={t('pipelinesPage.subtitle')} />
      <PageContainer>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pipelinesPage.searchPlaceholder')} className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-md)] border border-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50" aria-label={t('pipelinesPage.searchPlaceholder')} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as PipelineScope | '')} className="text-sm rounded-[var(--radius-md)] border border-border bg-card text-text-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" aria-label={t('pipelinesPage.filterScope')}>
              <option value="">{t('pipelinesPage.allScopes')}</option>
              <option value="global">{t('pipelinesPage.scope.global')}</option>
              <option value="project">{t('pipelinesPage.scope.project')}</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PipelineStatus | '')} className="text-sm rounded-[var(--radius-md)] border border-border bg-card text-text-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" aria-label={t('pipelinesPage.filterStatus')}>
              <option value="">{t('pipelinesPage.allStatuses')}</option>
              <option value="active">{t('pipelinesPage.status.active')}</option>
              <option value="draft">{t('pipelinesPage.status.draft')}</option>
              <option value="archived">{t('pipelinesPage.status.archived')}</option>
            </select>
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-primary text-white hover:bg-primary/90 transition-colors" aria-label={t('pipelinesPage.createPipeline')}>
              <Plus className="h-4 w-4" /> {t('pipelinesPage.createPipeline')}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-red-500 mb-2">{t('common.error')}</p>
            <button onClick={() => refetch()} className="text-sm text-primary hover:underline">{t('common.retry')}</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <GitBranch className="h-10 w-10 text-text-muted mb-2" />
            <p className="text-sm text-text-muted">{t('common.noResults')}</p>
          </div>
        )}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid gap-4">
            {filtered.map((p) => (
              <PipelineCard key={p.id} pipeline={p} onSelect={setSelectedId} />
            ))}
          </div>
        )}
      </PageContainer>
      <CreatePipelineDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

export { PipelinesPage }

/* ═══════════════════════════════════════════════════════════
 *  Pipeline Detail View (inline — same route, state-driven)
 * ═══════════════════════════════════════════════════════════ */
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Zap,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react'
import { usePipeline, useLlmCatalog, useUpsertAssignment, useDeleteAssignment } from '@application/hooks/usePipelines'
import { useAgents } from '@application/hooks/useAgents'
import { PIPELINE_DOMAINS, BATCH_SAVINGS_PERCENT } from '@domain/models/pipeline'
import type { TierClassification, TierConfig, PipelineAgentAssignment, ExecutionMode, PipelineLlmConfig } from '@domain/models/pipeline'
import type { DomainId, AgentSummary } from '@domain/models/agent'

type DetailTab = 'matrix' | 'tiers' | 'settings'

const tierColors: Record<TierClassification, string> = {
  T0: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
  T1: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700',
  T2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700',
  T3: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700',
}

const domainBorderColors: Record<string, string> = {
  'DOM-01': 'border-l-blue-500',
  'DOM-02': 'border-l-purple-500',
  'DOM-03': 'border-l-amber-500',
  'DOM-04': 'border-l-emerald-500',
  'DOM-05': 'border-l-red-500',
}

interface DetailViewProps { id: string; onBack: () => void }

function PipelineDetailView({ id, onBack }: DetailViewProps) {
  const { t } = useTranslation()
  const { data: pipeline, isLoading, isError, refetch } = usePipeline(id)
  const { data: allAgents } = useAgents()
  const { data: llmCatalog } = useLlmCatalog()
  const upsertMutation = useUpsertAssignment()
  const deleteMutation = useDeleteAssignment()
  const [activeTab, setActiveTab] = useState<DetailTab>('matrix')
  const [editingCell, setEditingCell] = useState<{ domainId: DomainId; tier: TierClassification } | null>(null)

  const tabs: { id: DetailTab; label: string; icon: typeof Layers }[] = [
    { id: 'matrix', label: t('pipelinesPage.detail.tabs.matrix'), icon: Layers },
    { id: 'tiers', label: t('pipelinesPage.detail.tabs.tiers'), icon: Settings2 },
    { id: 'settings', label: t('pipelinesPage.detail.tabs.settings'), icon: Settings2 },
  ]

  if (isLoading) {
    return (
      <>
        <Header title={t('common.loading')} />
        <PageContainer>
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
          </div>
        </PageContainer>
      </>
    )
  }

  if (isError || !pipeline) {
    return (
      <>
        <Header title={t('common.error')} />
        <PageContainer>
          <div className="flex flex-col items-center py-16">
            <p className="text-sm text-red-500 mb-2">{t('common.error')}</p>
            <button onClick={() => refetch()} className="text-sm text-primary hover:underline">{t('common.retry')}</button>
          </div>
        </PageContainer>
      </>
    )
  }

  const getAssignment = (domainId: DomainId, tier: TierClassification): PipelineAgentAssignment | undefined =>
    pipeline.assignments.find((a) => a.domainId === domainId && a.tier === tier)

  const agentsByDomain = (domainId: DomainId): AgentSummary[] =>
    allAgents?.filter((a) => a.domainId === domainId) ?? []

  const handleDeleteAssignment = async (assignmentId: string) => {
    try { await deleteMutation.mutateAsync({ pipelineId: id, assignmentId }) } catch { /* ignore */ }
  }

  return (
    <>
      <Header title={pipeline.name} subtitle={pipeline.description} />
      <PageContainer>
        {/* Back + meta */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors" aria-label={t('pipelinesPage.detail.backToList')}>
            <ArrowLeft className="h-4 w-4" /> {t('pipelinesPage.detail.backToList')}
          </button>
          <div className="flex items-center gap-3">
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', statusConfig[pipeline.status].className)}>
              {t(statusConfig[pipeline.status].label)}
            </span>
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', scopeConfig[pipeline.scope].className)}>
              {t(scopeConfig[pipeline.scope].label)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6" role="tablist" aria-label={t('pipelinesPage.detail.tabs.label')}>
          <div className="flex gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={cn('inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border')}>
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Matrix Tab — Domain × Tier grid */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">{t('pipelinesPage.detail.matrixHelp')}</p>
            </div>

            {/* Grid header */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid" aria-label={t('pipelinesPage.detail.tabs.matrix')}>
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider p-3 w-48">{t('pipelinesPage.detail.domain')}</th>
                    {pipeline.tiers.map((tier) => (
                      <th key={tier.tier} className="text-center text-xs font-semibold uppercase tracking-wider p-3 min-w-[200px]">
                        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full border', tierColors[tier.tier])}>
                          {tier.tier} — {tier.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PIPELINE_DOMAINS.map((domain) => (
                    <tr key={domain.id} className={cn('border-l-4', domainBorderColors[domain.id])}>
                      <td className="p-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{domain.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{domain.id}</p>
                            <p className="text-xs text-text-muted">{domain.name}</p>
                          </div>
                        </div>
                      </td>
                      {pipeline.tiers.map((tier) => {
                        const assignment = getAssignment(domain.id, tier.tier)
                        const isEditing = editingCell?.domainId === domain.id && editingCell?.tier === tier.tier
                        return (
                          <td key={tier.tier} className="p-2 align-top">
                            {isEditing ? (
                              <AssignmentEditor
                                pipelineId={id}
                                domainId={domain.id}
                                tier={tier.tier}
                                agents={agentsByDomain(domain.id)}
                                llmCatalog={llmCatalog ?? []}
                                current={assignment}
                                onClose={() => setEditingCell(null)}
                                upsertMutation={upsertMutation}
                              />
                            ) : assignment ? (
                              <AssignmentCell
                                assignment={assignment}
                                onEdit={() => setEditingCell({ domainId: domain.id, tier: tier.tier })}
                                onDelete={() => handleDeleteAssignment(assignment.id)}
                                t={t}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell({ domainId: domain.id, tier: tier.tier })}
                                className="w-full h-20 flex flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-text-muted"
                                aria-label={t('pipelinesPage.detail.addAssignment', { domain: domain.name, tier: tier.tier })}
                              >
                                <Plus className="h-4 w-4 mb-1" />
                                <span className="text-xs">{t('pipelinesPage.detail.assign')}</span>
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">{t('pipelinesPage.detail.tiersHelp')}</p>
            {pipeline.tiers.map((tier) => (
              <TierCard key={tier.tier} tier={tier} t={t} />
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">{t('pipelinesPage.detail.generalInfo')}</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-text-muted">{t('pipelinesPage.detail.pipelineName')}</dt><dd className="font-medium text-text-primary mt-0.5">{pipeline.name}</dd></div>
                <div><dt className="text-text-muted">{t('pipelinesPage.detail.pipelineScope')}</dt><dd className="font-medium text-text-primary mt-0.5">{t(scopeConfig[pipeline.scope].label)}</dd></div>
                {pipeline.projectName && <div><dt className="text-text-muted">{t('pipelinesPage.detail.project')}</dt><dd className="font-medium text-text-primary mt-0.5">{pipeline.projectName}</dd></div>}
                <div><dt className="text-text-muted">{t('pipelinesPage.detail.createdBy')}</dt><dd className="font-medium text-text-primary mt-0.5">{pipeline.createdBy}</dd></div>
                <div><dt className="text-text-muted">{t('pipelinesPage.detail.createdAt')}</dt><dd className="font-medium text-text-primary mt-0.5">{new Date(pipeline.createdAt).toLocaleDateString('pt-BR')}</dd></div>
                <div><dt className="text-text-muted">{t('pipelinesPage.detail.updatedAt')}</dt><dd className="font-medium text-text-primary mt-0.5">{new Date(pipeline.updatedAt).toLocaleDateString('pt-BR')}</dd></div>
              </dl>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3">{t('pipelinesPage.detail.stats')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-[var(--radius-md)] bg-muted/50"><p className="text-2xl font-bold text-text-primary">{pipeline.tiers.length}</p><p className="text-xs text-text-muted">{t('pipelinesPage.detail.totalTiers')}</p></div>
                <div className="text-center p-3 rounded-[var(--radius-md)] bg-muted/50"><p className="text-2xl font-bold text-text-primary">{pipeline.assignments.length}</p><p className="text-xs text-text-muted">{t('pipelinesPage.detail.totalAssignments')}</p></div>
                <div className="text-center p-3 rounded-[var(--radius-md)] bg-muted/50"><p className="text-2xl font-bold text-text-primary">{new Set(pipeline.assignments.map((a) => a.domainId)).size}/5</p><p className="text-xs text-text-muted">{t('pipelinesPage.detail.domainsConfigured')}</p></div>
                <div className="text-center p-3 rounded-[var(--radius-md)] bg-muted/50"><p className="text-2xl font-bold text-text-primary">{pipeline.assignments.filter((a) => a.executionMode === 'batch').length}</p><p className="text-xs text-text-muted">{t('pipelinesPage.detail.batchAgents')}</p></div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}

/* ─── Assignment Cell ─── */
interface AssignmentCellProps {
  assignment: PipelineAgentAssignment
  onEdit: () => void
  onDelete: () => void
  t: (key: string, opts?: Record<string, unknown>) => string
}

function AssignmentCell({ assignment, onEdit, onDelete, t }: AssignmentCellProps) {
  return (
    <div className={cn('rounded-[var(--radius-md)] border border-border bg-card p-3 space-y-2 relative group', !assignment.enabled && 'opacity-50')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Bot className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-text-primary truncate">{assignment.agentName}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded hover:bg-muted" aria-label={t('common.edit')}><Settings2 className="h-3 w-3 text-text-muted" /></button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={t('common.delete')}><X className="h-3 w-3 text-red-500" /></button>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Cpu className="h-3 w-3 text-text-muted" />
        <span className="text-[10px] text-text-muted truncate">{assignment.llmConfig.displayName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {assignment.executionMode === 'batch' ? (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <Clock className="h-2.5 w-2.5" /> Batch
            <span className="text-[9px] ml-0.5">(-{BATCH_SAVINGS_PERCENT}% {t('pipelinesPage.detail.cost')})</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <Zap className="h-2.5 w-2.5" /> Realtime
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-[9px] text-text-muted">
        <DollarSign className="h-2.5 w-2.5" />
        <span>In: ${assignment.llmConfig.costPer1kInput}/1k</span>
        <span>Out: ${assignment.llmConfig.costPer1kOutput}/1k</span>
      </div>
    </div>
  )
}

/* ─── Assignment Editor (inline form) ─── */
interface AssignmentEditorProps {
  pipelineId: string
  domainId: DomainId
  tier: TierClassification
  agents: AgentSummary[]
  llmCatalog: Omit<PipelineLlmConfig, 'id'>[]
  current?: PipelineAgentAssignment
  onClose: () => void
  upsertMutation: ReturnType<typeof useUpsertAssignment>
}

function AssignmentEditor({ pipelineId, domainId, tier, agents, llmCatalog, current, onClose, upsertMutation }: AssignmentEditorProps) {
  const { t } = useTranslation()
  const [agentId, setAgentId] = useState(current?.agentId ?? '')
  const [llmKey, setLlmKey] = useState(current ? `${current.llmConfig.provider}:${current.llmConfig.modelId}` : '')
  const [mode, setMode] = useState<ExecutionMode>(current?.executionMode ?? 'realtime')
  const [enabled, setEnabled] = useState(current?.enabled ?? true)

  const selectedLlm = useMemo(() => {
    if (!llmKey) return null
    const [provider, modelId] = llmKey.split(':')
    return llmCatalog.find((l) => l.provider === provider && l.modelId === modelId) ?? null
  }, [llmKey, llmCatalog])

  const selectedAgent = useMemo(() => agents.find((a) => a.id === agentId), [agentId, agents])

  const handleSave = async () => {
    if (!agentId || !selectedLlm || !selectedAgent) return
    try {
      await upsertMutation.mutateAsync({
        pipelineId,
        payload: {
          domainId,
          tier,
          agentId,
          llmConfig: {
            provider: selectedLlm.provider,
            modelId: selectedLlm.modelId,
            displayName: selectedLlm.displayName,
            costPer1kInput: selectedLlm.costPer1kInput,
            costPer1kOutput: selectedLlm.costPer1kOutput,
          },
          executionMode: mode,
          enabled,
        },
      })
      onClose()
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-[var(--radius-md)] border-2 border-primary bg-card p-3 space-y-3 shadow-lg">
      {/* Agent select */}
      <div>
        <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{t('pipelinesPage.detail.editor.agent')}</label>
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full text-xs px-2 py-1.5 rounded border border-border bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50" aria-label={t('pipelinesPage.detail.editor.selectAgent')}>
          <option value="">{t('pipelinesPage.detail.editor.selectAgent')}</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {agents.length === 0 && (
          <p className="text-[10px] text-amber-600 mt-1">{t('pipelinesPage.detail.editor.noAgentsForDomain')}</p>
        )}
      </div>

      {/* LLM select */}
      <div>
        <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{t('pipelinesPage.detail.editor.llmModel')}</label>
        <select value={llmKey} onChange={(e) => setLlmKey(e.target.value)} className="w-full text-xs px-2 py-1.5 rounded border border-border bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50" aria-label={t('pipelinesPage.detail.editor.selectLlm')}>
          <option value="">{t('pipelinesPage.detail.editor.selectLlm')}</option>
          {llmCatalog.map((l) => (
            <option key={`${l.provider}:${l.modelId}`} value={`${l.provider}:${l.modelId}`}>
              {l.displayName} ({l.provider})
            </option>
          ))}
        </select>
        {selectedLlm && (
          <p className="text-[9px] text-text-muted mt-1">
            In: ${selectedLlm.costPer1kInput}/1k | Out: ${selectedLlm.costPer1kOutput}/1k
          </p>
        )}
      </div>

      {/* Execution mode */}
      <div>
        <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{t('pipelinesPage.detail.editor.executionMode')}</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('realtime')} className={cn('flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors', mode === 'realtime' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-border text-text-muted hover:bg-muted')}>
            <Zap className="h-3 w-3" /> Realtime
          </button>
          <button type="button" onClick={() => setMode('batch')} className={cn('flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors', mode === 'batch' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'border-border text-text-muted hover:bg-muted')}>
            <Clock className="h-3 w-3" /> Batch
          </button>
        </div>
        {mode === 'batch' && (
          <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[9px] text-amber-700 dark:text-amber-400">{t('pipelinesPage.detail.editor.batchWarning', { savings: BATCH_SAVINGS_PERCENT })}</p>
          </div>
        )}
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{t('pipelinesPage.detail.editor.enabled')}</span>
        <button type="button" onClick={() => setEnabled(!enabled)} className="p-0.5" aria-label={enabled ? t('pipelinesPage.detail.editor.disable') : t('pipelinesPage.detail.editor.enable')}>
          {enabled ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border">
        <button type="button" onClick={onClose} className="flex-1 text-xs py-1.5 rounded border border-border text-text-muted hover:bg-muted transition-colors">{t('common.cancel')}</button>
        <button type="button" onClick={handleSave} disabled={!agentId || !selectedLlm || upsertMutation.isPending} className="flex-1 text-xs py-1.5 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {upsertMutation.isPending ? '...' : t('common.save')}
        </button>
      </div>
    </div>
  )
}

/* ─── Tier Config Card ─── */
interface TierCardProps { tier: TierConfig; t: (key: string, opts?: Record<string, unknown>) => string }

function TierCard({ tier, t }: TierCardProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden')}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors" aria-expanded={expanded}>
        <div className="flex items-center gap-3">
          <span className={cn('inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold border', tierColors[tier.tier])}>
            {tier.tier}
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">{tier.name}</p>
            <p className="text-xs text-text-muted">{tier.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>SLA: {tier.slaHours}h</span>
          <span>Lead: {tier.maxLeadTimeDays}d</span>
          {tier.autoApproveGates && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-medium">{t('pipelinesPage.detail.autoApprove')}</span>}
          <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{t('pipelinesPage.detail.criteria')}</h4>
          {tier.criteria.length === 0 ? (
            <p className="text-xs text-text-muted italic">{t('pipelinesPage.detail.noCriteria')}</p>
          ) : (
            <div className="space-y-2">
              {tier.criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded bg-muted/50 text-xs">
                  <code className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">{c.field}</code>
                  <span className="text-text-muted">{c.operator}</span>
                  <code className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">{c.value}</code>
                  <span className="text-text-muted ml-auto">{c.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
