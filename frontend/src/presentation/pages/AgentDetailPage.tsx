import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  ArrowLeft,
  Zap,
  Brain,
  FileText,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  Shield,
  Timer,
  Hash,
  Tag,
  ToggleLeft,
  ToggleRight,
  Activity,
  DollarSign,
  Thermometer,
  Code,
  Eye,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useAgent } from '@application/hooks/useAgents'
import { DOMAINS } from '@domain/models/agent'
import type { AgentStatus, AutonomyLevel, AgentSkill, AuthorizedLlm, AgentPrompt, LlmTier, PromptType, TriggerType } from '@domain/models/agent'
import { ROUTES } from '@shared/constants/routes'

type TabId = 'overview' | 'skills' | 'llms' | 'prompts' | 'config'

/* ── Status config ── */
const statusIcons: Record<AgentStatus, typeof CheckCircle> = {
  active: CheckCircle,
  inactive: Clock,
  error: AlertCircle,
  maintenance: Wrench,
}
const statusColors: Record<AgentStatus, string> = {
  active: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
  error: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  maintenance: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const autonomyColors: Record<AutonomyLevel, string> = {
  full: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  semi: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  assisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  none: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

const tierColors: Record<LlmTier, string> = {
  junior: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  mid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  senior: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  specialist: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const promptTypeColors: Record<PromptType, string> = {
  system: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  task: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  escalation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  template: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const triggerIcons: Record<TriggerType, string> = {
  'gate-approval': '/gate-approve',
  label: 'label:',
  schedule: 'cron:',
  manual: 'manual',
  event: 'event:',
}

/* ═══════════════════════════════════════════════
 *  Skills Tab
 * ═══════════════════════════════════════════════ */
function SkillsTab({ skills }: { skills: AgentSkill[] }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Zap className="h-10 w-10 text-text-muted mb-2" />
        <p className="text-sm text-text-muted">{t('agentDetail.skills.empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {skills.map((skill) => (
        <div key={skill.id} className="rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            aria-expanded={expanded === skill.id}
          >
            <div className="flex items-center gap-3">
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold', skill.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-text-muted')}>
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{skill.name}</span>
                  <code className="text-xs text-text-muted bg-muted px-1.5 py-0.5 rounded">{skill.code}</code>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{skill.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {skill.enabled
                ? <ToggleRight className="h-5 w-5 text-green-500" aria-label={t('agentDetail.skills.enabled')} />
                : <ToggleLeft className="h-5 w-5 text-gray-400" aria-label={t('agentDetail.skills.disabled')} />
              }
            </div>
          </button>

          {expanded === skill.id && (
            <div className="border-t border-border p-4 bg-muted/20 space-y-4">
              {/* Trigger + Config */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.trigger')}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{triggerIcons[skill.triggerType]} {skill.triggerValue}</code>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.timeout')}</p>
                  <span className="text-sm text-text">{skill.timeoutSeconds}s</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.confidence')}</p>
                  <span className="text-sm text-text">{skill.confidenceThreshold}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.requiredTier')}</p>
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tierColors[skill.requiredLlmTier ?? 'junior'])}>
                    {skill.requiredLlmTier ?? '—'}
                  </span>
                </div>
              </div>

              {/* Execution stats */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.executionCount')}</p>
                  <span className="text-sm font-semibold text-text">{skill.executionCount.toLocaleString()}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.avgDuration')}</p>
                  <span className="text-sm text-text">{skill.avgDurationSeconds != null ? `${skill.avgDurationSeconds}s` : '—'}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">{t('agentDetail.skills.lastExecuted')}</p>
                  <span className="text-sm text-text">{skill.lastExecutedAt ? new Date(skill.lastExecutedAt).toLocaleString('pt-BR') : '—'}</span>
                </div>
              </div>

              {/* Checks */}
              {skill.checks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-2">{t('agentDetail.skills.checks')} ({skill.checks.length})</p>
                  <div className="space-y-1.5">
                    {skill.checks.map((check) => (
                      <div key={check.id} className="flex items-center gap-2 text-xs">
                        <code className="bg-muted px-1.5 py-0.5 rounded font-medium min-w-[4rem] text-center">{check.code}</code>
                        <span className="text-text flex-1">{check.description}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                          check.type === 'deterministic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                        )}>
                          {check.type === 'deterministic' ? t('agentDetail.skills.deterministic') : t('agentDetail.skills.llmAssisted')}
                        </span>
                        {check.blocking && (
                          <span className="rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 text-[10px] font-medium">
                            {t('agentDetail.skills.blocking')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
 *  LLMs Tab
 * ═══════════════════════════════════════════════ */
function LlmsTab({ llms }: { llms: AuthorizedLlm[] }) {
  const { t } = useTranslation()

  if (llms.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Brain className="h-10 w-10 text-text-muted mb-2" />
        <p className="text-sm text-text-muted">{t('agentDetail.llms.empty')}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {llms.map((llm) => (
        <div key={llm.id} className={cn('rounded-[var(--radius-lg)] border border-border bg-card p-4', !llm.enabled && 'opacity-50')}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <div>
                <h4 className="text-sm font-semibold text-text">{llm.displayName}</h4>
                <code className="text-xs text-text-muted">{llm.modelId}</code>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {llm.isDefault && (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">{t('agentDetail.llms.default')}</span>
              )}
              {llm.enabled
                ? <ToggleRight className="h-5 w-5 text-green-500" />
                : <ToggleLeft className="h-5 w-5 text-gray-400" />
              }
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              <span className="text-text-muted">{t('agentDetail.llms.provider')}:</span>
              <span className="font-medium text-text capitalize">{llm.provider}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              <span className="text-text-muted">{t('agentDetail.llms.tier')}:</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', tierColors[llm.tier])}>{llm.tier}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              <span className="text-text-muted">{t('agentDetail.llms.maxTokens')}:</span>
              <span className="font-medium text-text">{llm.maxTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              <span className="text-text-muted">{t('agentDetail.llms.temperature')}:</span>
              <span className="font-medium text-text">{llm.temperatureDefault} ({llm.temperatureRange[0]}–{llm.temperatureRange[1]})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              <span className="text-text-muted">{t('agentDetail.llms.costInput')}:</span>
              <span className="font-medium text-text">${llm.costPer1kInput}/1k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              <span className="text-text-muted">{t('agentDetail.llms.costOutput')}:</span>
              <span className="font-medium text-text">${llm.costPer1kOutput}/1k</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
 *  Prompts Tab
 * ═══════════════════════════════════════════════ */
function PromptsTab({ prompts }: { prompts: AgentPrompt[] }) {
  const { t } = useTranslation()
  const [viewContent, setViewContent] = useState<string | null>(null)

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <FileText className="h-10 w-10 text-text-muted mb-2" />
        <p className="text-sm text-text-muted">{t('agentDetail.prompts.empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <FileText className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text">{prompt.name}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', promptTypeColors[prompt.type])}>
                    {prompt.type}
                  </span>
                  {!prompt.isActive && (
                    <span className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-[10px] dark:bg-gray-800 dark:text-gray-400">
                      {t('agentDetail.prompts.inactive')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{prompt.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="text-xs text-text-muted">v{prompt.version}</span>
              <button
                type="button"
                onClick={() => setViewContent(viewContent === prompt.id ? null : prompt.id)}
                className={cn(
                  'flex items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs font-medium transition-colors',
                  viewContent === prompt.id ? 'bg-primary text-white' : 'bg-muted text-text hover:bg-muted/80',
                )}
                aria-label={t('agentDetail.prompts.viewContent')}
              >
                {viewContent === prompt.id ? <Eye className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
                {viewContent === prompt.id ? t('agentDetail.prompts.hide') : t('agentDetail.prompts.view')}
              </button>
            </div>
          </div>

          {viewContent === prompt.id && (
            <div className="border-t border-border p-4 bg-muted/20 space-y-3">
              {/* Variables */}
              {prompt.variables.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1.5">{t('agentDetail.prompts.variables')} ({prompt.variables.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.variables.map((v) => (
                      <code key={v} className="bg-muted px-2 py-0.5 rounded text-xs text-text">{`{${v}}`}</code>
                    ))}
                  </div>
                </div>
              )}
              {/* Content */}
              <div>
                <p className="text-xs font-medium text-text-muted mb-1.5">{t('agentDetail.prompts.content')}</p>
                <pre className="bg-[#1e1e2e] text-gray-100 rounded-[var(--radius-md)] p-3 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64">
                  {prompt.content}
                </pre>
              </div>
              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>{t('agentDetail.prompts.created')}: {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>{t('agentDetail.prompts.updated')}: {new Date(prompt.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
 *  Agent Detail Page
 * ═══════════════════════════════════════════════ */
function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { data: agent, isLoading, error } = useAgent(id ?? null)

  const tabs: { id: TabId; label: string; icon: typeof Zap; count?: number }[] = [
    { id: 'overview', label: t('agentDetail.tabs.overview'), icon: Bot },
    { id: 'skills', label: t('agentDetail.tabs.skills'), icon: Zap, count: agent?.skills.length },
    { id: 'llms', label: t('agentDetail.tabs.llms'), icon: Brain, count: agent?.authorizedLlms.length },
    { id: 'prompts', label: t('agentDetail.tabs.prompts'), icon: FileText, count: agent?.prompts.length },
    { id: 'config', label: t('agentDetail.tabs.config'), icon: Settings },
  ]

  return (
    <>
      <Header title={agent?.name ?? t('common.loading')} subtitle={agent ? `${agent.domainId} — v${agent.version}` : ''} />
      <PageContainer>
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.AGENTS)}
          className="mb-4 flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          aria-label={t('agentDetail.backToList')}
        >
          <ArrowLeft className="h-4 w-4" /> {t('agentDetail.backToList')}
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">{t('common.error')}</p>
          </div>
        )}

        {agent && (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b border-border">
              <div className="flex gap-1 -mb-px overflow-x-auto" role="tablist" aria-label={t('agentDetail.tabs.label')}>
                {tabs.map((tab) => {
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-muted hover:text-text hover:border-border',
                      )}
                    >
                      <TabIcon className="h-4 w-4" aria-hidden="true" />
                      {tab.label}
                      {tab.count != null && (
                        <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">{tab.count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div role="tabpanel">
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Agent info card */}
                  <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-text">{agent.name}</h2>
                        <p className="text-sm text-text-muted mt-1">{agent.description}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', statusColors[agent.status])}>
                        {(() => { const Icon = statusIcons[agent.status]; return <Icon className="h-3 w-3" /> })()}
                        {t(`agentsPage.status.${agent.status}`)}
                      </span>
                      <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', autonomyColors[agent.autonomyLevel])}>
                        {t(`agentsPage.autonomy.${agent.autonomyLevel}`)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-text-muted">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOMAINS.find((d) => d.id === agent.domainId)?.color }} />
                        {agent.domainId}
                      </span>
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-text-muted">v{agent.version}</span>
                    </div>

                    {/* Tags */}
                    {agent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-text-muted">
                            <Tag className="h-3 w-3" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-[var(--radius-md)] bg-muted/30 p-3 text-center">
                        <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-lg font-bold text-text">{agent.totalExecutions.toLocaleString()}</p>
                        <p className="text-xs text-text-muted">{t('agentDetail.overview.totalExecutions')}</p>
                      </div>
                      <div className="rounded-[var(--radius-md)] bg-muted/30 p-3 text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-text">{agent.successRate}%</p>
                        <p className="text-xs text-text-muted">{t('agentDetail.overview.successRate')}</p>
                      </div>
                      <div className="rounded-[var(--radius-md)] bg-muted/30 p-3 text-center">
                        <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-text">{agent.skills.length}</p>
                        <p className="text-xs text-text-muted">{t('agentDetail.overview.skills')}</p>
                      </div>
                      <div className="rounded-[var(--radius-md)] bg-muted/30 p-3 text-center">
                        <Brain className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-text">{agent.authorizedLlms.length}</p>
                        <p className="text-xs text-text-muted">{t('agentDetail.overview.llms')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-text mb-3">{t('agentDetail.overview.metadata')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-text-muted">{t('agentDetail.overview.createdBy')}</p>
                        <p className="font-medium text-text">{agent.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">{t('agentDetail.overview.createdAt')}</p>
                        <p className="font-medium text-text">{new Date(agent.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">{t('agentDetail.overview.updatedAt')}</p>
                        <p className="font-medium text-text">{new Date(agent.updatedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">{t('agentDetail.overview.lastActive')}</p>
                        <p className="font-medium text-text">{agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleString('pt-BR') : '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeTab === 'skills' && <SkillsTab skills={agent.skills} />}

              {/* LLMs */}
              {activeTab === 'llms' && <LlmsTab llms={agent.authorizedLlms} />}

              {/* Prompts */}
              {activeTab === 'prompts' && <PromptsTab prompts={agent.prompts} />}

              {/* Config */}
              {activeTab === 'config' && (
                <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
                  <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" /> {t('agentDetail.config.title')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'maxConcurrentIssues', icon: Activity, value: agent.executionConfig.maxConcurrentIssues },
                      { key: 'maxRetries', icon: Timer, value: agent.executionConfig.maxRetries },
                      { key: 'cooldownSeconds', icon: Clock, value: `${agent.executionConfig.cooldownSeconds}s` },
                      { key: 'autoEscalateAfterSeconds', icon: AlertCircle, value: `${agent.executionConfig.autoEscalateAfterSeconds}s` },
                    ].map(({ key, icon: Icon, value }) => (
                      <div key={key} className="flex items-center gap-3 rounded-[var(--radius-md)] bg-muted/30 p-3">
                        <Icon className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-xs text-text-muted">{t(`agentDetail.config.${key}`)}</p>
                          <p className="text-sm font-semibold text-text">{value}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-muted/30 p-3">
                      <Shield className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-text-muted">{t('agentDetail.config.retryOnFailure')}</p>
                        <p className="text-sm font-semibold text-text">{agent.executionConfig.retryOnFailure ? t('agentDetail.config.yes') : t('agentDetail.config.no')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-muted/30 p-3">
                      <AlertCircle className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-text-muted">{t('agentDetail.config.notifications')}</p>
                        <p className="text-sm text-text">
                          {agent.executionConfig.notifyOnError && <span className="mr-2">Error</span>}
                          {agent.executionConfig.notifyOnEscalation && <span>Escalation</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </PageContainer>
    </>
  )
}

export { AgentDetailPage }
