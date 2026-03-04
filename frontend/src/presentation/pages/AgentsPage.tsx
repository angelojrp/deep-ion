import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  Plus,
  Search,
  Filter,
  Zap,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  ChevronRight,
  Activity,
  Cpu,
  FileText,
  X,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useAgents, useCreateAgent } from '@application/hooks/useAgents'
import { DOMAINS, type DomainId, type AgentStatus, type AutonomyLevel } from '@domain/models/agent'
import { ROUTES } from '@shared/constants/routes'

/* ── Status config ── */
const statusConfig: Record<AgentStatus, { icon: typeof CheckCircle; label: string; className: string }> = {
  active: { icon: CheckCircle, label: 'agentsPage.status.active', className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { icon: Clock, label: 'agentsPage.status.inactive', className: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
  error: { icon: AlertCircle, label: 'agentsPage.status.error', className: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
  maintenance: { icon: Wrench, label: 'agentsPage.status.maintenance', className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
}

/* ── Autonomy config ── */
const autonomyConfig: Record<AutonomyLevel, { label: string; className: string }> = {
  full: { label: 'agentsPage.autonomy.full', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  semi: { label: 'agentsPage.autonomy.semi', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  assisted: { label: 'agentsPage.autonomy.assisted', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  none: { label: 'agentsPage.autonomy.none', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

/* ── Domain color mapping ── */
const domainColors: Record<string, string> = {
  'DOM-01': 'border-l-blue-500',
  'DOM-02': 'border-l-purple-500',
  'DOM-03': 'border-l-amber-500',
  'DOM-04': 'border-l-emerald-500',
  'DOM-05': 'border-l-red-500',
}

/* ═══════════════════════════════════════════
 *  Create Agent Dialog
 * ═══════════════════════════════════════════ */
interface CreateAgentDialogProps {
  open: boolean
  onClose: () => void
}

function CreateAgentDialog({ open, onClose }: CreateAgentDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreateAgent()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domainId, setDomainId] = useState<DomainId>('DOM-01')
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('semi')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setDomainId('DOM-01')
    setAutonomy('semi')
    setTags('')
    setErrors({})
  }, [])

  const handleClose = useCallback(() => { resetForm(); onClose() }, [resetForm, onClose])

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = t('agentsPage.form.errors.nameRequired')
    if (!description.trim()) e.description = t('agentsPage.form.errors.descriptionRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }, [name, description, t])

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    try {
      await createMutation.mutateAsync({
        domainId,
        name: name.trim(),
        description: description.trim(),
        autonomyLevel: autonomy,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        executionConfig: { maxConcurrentIssues: 3, retryOnFailure: true, maxRetries: 2, cooldownSeconds: 15, notifyOnError: true, notifyOnEscalation: true, autoEscalateAfterSeconds: 600 },
      })
      handleClose()
    } catch {
      setErrors({ submit: t('agentsPage.form.errors.submitFailed') })
    }
  }, [validate, createMutation, domainId, name, description, autonomy, tags, t, handleClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label={t('agentsPage.form.title')}>
      <div className="mx-4 w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">{t('agentsPage.form.title')}</h2>
            <p className="text-sm text-text-muted">{t('agentsPage.form.subtitle')}</p>
          </div>
          <button onClick={handleClose} className="rounded-[var(--radius-md)] p-1.5 hover:bg-muted" aria-label={t('common.close')} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Domain */}
          <div>
            <label htmlFor="agent-domain" className="mb-1.5 block text-sm font-medium text-text">{t('agentsPage.form.domain')}</label>
            <select id="agent-domain" value={domainId} onChange={(e) => setDomainId(e.target.value as DomainId)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary">
              {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.name}</option>)}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="agent-name" className="mb-1.5 block text-sm font-medium text-text">{t('agentsPage.form.name')}</label>
            <input id="agent-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t('agentsPage.form.namePlaceholder')}
              className={cn('w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary', errors.name ? 'border-error' : 'border-border')}
              aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
            {errors.name && <p id="name-error" className="mt-1 text-xs text-error">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="agent-desc" className="mb-1.5 block text-sm font-medium text-text">{t('agentsPage.form.description')}</label>
            <textarea id="agent-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={t('agentsPage.form.descriptionPlaceholder')}
              className={cn('w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none', errors.description ? 'border-error' : 'border-border')}
              aria-invalid={!!errors.description} aria-describedby={errors.description ? 'desc-error' : undefined} />
            {errors.description && <p id="desc-error" className="mt-1 text-xs text-error">{errors.description}</p>}
          </div>

          {/* Autonomy Level */}
          <div>
            <label htmlFor="agent-autonomy" className="mb-1.5 block text-sm font-medium text-text">{t('agentsPage.form.autonomyLevel')}</label>
            <select id="agent-autonomy" value={autonomy} onChange={(e) => setAutonomy(e.target.value as AutonomyLevel)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary">
              {(['full', 'semi', 'assisted', 'none'] as AutonomyLevel[]).map((a) => (
                <option key={a} value={a}>{t(autonomyConfig[a].label)}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="agent-tags" className="mb-1.5 block text-sm font-medium text-text">{t('agentsPage.form.tags')}</label>
            <input id="agent-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder={t('agentsPage.form.tagsPlaceholder')}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
            <p className="mt-1 text-xs text-text-muted">{t('agentsPage.form.tagsHelp')}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-text hover:bg-muted">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
              {createMutation.isPending ? t('common.loading') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
 *  Agents Page
 * ═══════════════════════════════════════════ */
function AgentsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterDomain, setFilterDomain] = useState<DomainId | ''>('')
  const [filterStatus, setFilterStatus] = useState<AgentStatus | ''>('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: agents, isLoading, error } = useAgents(filterDomain || undefined)

  const filtered = useMemo(() => {
    if (!agents) return []
    let result = agents
    if (filterStatus) result = result.filter((a) => a.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }
    return result
  }, [agents, filterStatus, search])

  /* Group by domain for visual grouping */
  const groupedByDomain = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const agent of filtered) {
      const key = agent.domainId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(agent)
    }
    return map
  }, [filtered])

  return (
    <>
      <Header title={t('agentsPage.title')} subtitle={t('agentsPage.subtitle')} />
      <PageContainer>
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t('agentsPage.searchPlaceholder')}
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('common.search')}
              />
            </div>

            {/* Domain filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value as DomainId | '')}
                className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('agentsPage.filterDomain')}>
                <option value="">{t('agentsPage.allDomains')}</option>
                {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.name}</option>)}
              </select>

              {/* Status filter */}
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AgentStatus | '')}
                className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('agentsPage.filterStatus')}>
                <option value="">{t('agentsPage.allStatuses')}</option>
                {(['active', 'inactive', 'error', 'maintenance'] as AgentStatus[]).map((s) => (
                  <option key={s} value={s}>{t(statusConfig[s].label)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            aria-label={t('agentsPage.createAgent')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('agentsPage.createAgent')}
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-400">{t('common.error')}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="h-12 w-12 text-text-muted mb-3" />
            <p className="text-sm text-text-muted">{t('common.noResults')}</p>
          </div>
        )}

        {/* Agent cards grouped by domain */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="space-y-8">
            {Array.from(groupedByDomain.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([domId, domAgents]) => {
                const domain = DOMAINS.find((d) => d.id === domId)
                return (
                  <section key={domId}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: domain?.color ?? '#6b7280' }} />
                      <h2 className="text-sm font-semibold text-text uppercase tracking-wider">
                        {domId} — {domain?.name ?? domId}
                      </h2>
                      <span className="text-xs text-text-muted">({domAgents.length})</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {domAgents.map((agent) => {
                        const sc = statusConfig[agent.status]
                        const ac = autonomyConfig[agent.autonomyLevel]
                        const StatusIcon = sc.icon
                        return (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => navigate(ROUTES.AGENT_DETAIL.replace(':id', agent.id))}
                            className={cn(
                              'flex flex-col rounded-[var(--radius-lg)] border border-border bg-card p-4 text-left',
                              'border-l-4 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary',
                              domainColors[agent.domainId] ?? 'border-l-gray-400',
                            )}
                            aria-label={`${agent.name} — ${agent.domainId}`}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
                                <h3 className="text-sm font-semibold text-text leading-tight">{agent.name}</h3>
                              </div>
                              <ChevronRight className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                            </div>

                            {/* Description */}
                            <p className="text-xs text-text-muted mb-3 line-clamp-2">{agent.description}</p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', sc.className)}>
                                <StatusIcon className="h-3 w-3" aria-hidden="true" />
                                {t(sc.label)}
                              </span>
                              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', ac.className)}>
                                {t(ac.label)}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-text-muted">
                                v{agent.version}
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-text-muted border-t border-border pt-2">
                              <span className="flex items-center gap-1" title={t('agentsPage.skills')}>
                                <Zap className="h-3.5 w-3.5" aria-hidden="true" /> {agent.skillCount}
                              </span>
                              <span className="flex items-center gap-1" title={t('agentsPage.llms')}>
                                <Brain className="h-3.5 w-3.5" aria-hidden="true" /> {agent.llmCount}
                              </span>
                              <span className="flex items-center gap-1" title={t('agentsPage.prompts')}>
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {agent.promptCount}
                              </span>
                              <span className="flex items-center gap-1 ml-auto" title={t('agentsPage.executions')}>
                                <Activity className="h-3.5 w-3.5" aria-hidden="true" /> {agent.totalExecutions}
                              </span>
                              <span className="flex items-center gap-1" title={t('agentsPage.successRate')}>
                                <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> {agent.successRate}%
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
          </div>
        )}
      </PageContainer>

      <CreateAgentDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
    </>
  )
}

export { AgentsPage }
