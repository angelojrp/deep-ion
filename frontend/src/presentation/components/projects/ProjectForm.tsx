import { useState, useCallback, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  X,
  GitBranch,
  FileText,
  Bot,
  Plus,
  Trash2,
  AlertTriangle,
  Shield,
  Globe,
  Blocks,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { useCreateProject, useTenantMembers, useTenantConfig, useBlueprints } from '@application/hooks/useProjects'
import type {
  MemberRole,
  RepositoryProvider,
  MultiModuleStrategy,
  DocumentationType,
  AIProviderName,
} from '@domain/models/project'

/* ─── Types ─── */

interface MemberSelection {
  id: string
  roles: MemberRole[]
}

interface AIProviderFormData {
  key: string
  provider: AIProviderName
  endpointUrl: string
  apiKey: string
  defaultModel: string
  rateLimitTokensPerMin: string
  rateLimitRequestsPerDay: string
}

interface ArchModuleFormData {
  key: string
  name: string
  blueprintId: string
  folderPath: string
  repositoryPath: string
}

interface ProjectFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    name: string
    slug: string
    description: string
    repositoryProvider: RepositoryProvider
    repositoryUseGlobal: boolean
    repositoryServerUrl: string
    repositoryAccessToken: string
    repositoryPath: string
    multiModule: MultiModuleStrategy
    documentationType: DocumentationType
    documentationRepoPath: string
    aiProviders: AIProviderFormData[]
    archModules: ArchModuleFormData[]
    members: MemberSelection[]
  }
}

/* ─── Constants ─── */

const MEMBER_ROLES: MemberRole[] = [
  'po',
  'architect',
  'tech-lead',
  'developer',
  'qa',
  'devops',
  'business-analyst',
]

const REPO_PROVIDERS: RepositoryProvider[] = ['github', 'gitlab', 'bitbucket', 'azure-devops']

const MULTI_MODULE_OPTIONS: MultiModuleStrategy[] = ['none', 'subfolder', 'independent']

const DOC_TYPES: DocumentationType[] = ['embedded', 'independent']

const AI_PROVIDERS: AIProviderName[] = ['openai', 'anthropic', 'google-ai', 'azure-openai', 'aws-bedrock']

const DEFAULT_MODELS: Record<AIProviderName, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4',
  'google-ai': 'gemini-2.0-flash',
  'azure-openai': 'gpt-4o',
  'aws-bedrock': 'anthropic.claude-sonnet-4-20250514-v1:0',
}

/* ─── Helpers ─── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createEmptyAIProvider(): AIProviderFormData {
  return {
    key: crypto.randomUUID(),
    provider: 'openai',
    endpointUrl: '',
    apiKey: '',
    defaultModel: DEFAULT_MODELS.openai,
    rateLimitTokensPerMin: '',
    rateLimitRequestsPerDay: '',
  }
}

function createEmptyArchModule(): ArchModuleFormData {
  return {
    key: crypto.randomUUID(),
    name: '',
    blueprintId: '',
    folderPath: '',
    repositoryPath: '',
  }
}

/* ─── Component ─── */

function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tenantMembers, isLoading: membersLoading } = useTenantMembers()
  const { data: tenantConfig } = useTenantConfig()
  const { data: blueprints, isLoading: blueprintsLoading } = useBlueprints()
  const createMutation = useCreateProject()

  /* Basic data */
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* Team */
  const [selectedMembers, setSelectedMembers] = useState<MemberSelection[]>(initialData?.members ?? [])

  /* Repository */
  const [repoProvider, setRepoProvider] = useState<RepositoryProvider>(initialData?.repositoryProvider ?? 'github')
  const [repoUseGlobal, setRepoUseGlobal] = useState(initialData?.repositoryUseGlobal ?? true)
  const [repoServerUrl, setRepoServerUrl] = useState(initialData?.repositoryServerUrl ?? '')
  const [repoAccessToken, setRepoAccessToken] = useState(initialData?.repositoryAccessToken ?? '')
  const [repoPath, setRepoPath] = useState(initialData?.repositoryPath ?? '')
  const [multiModule, setMultiModule] = useState<MultiModuleStrategy>(initialData?.multiModule ?? 'none')

  /* Documentation */
  const [docType, setDocType] = useState<DocumentationType>(initialData?.documentationType ?? 'embedded')
  const [docRepoPath, setDocRepoPath] = useState(initialData?.documentationRepoPath ?? '')

  /* AI Providers */
  const [aiProviders, setAiProviders] = useState<AIProviderFormData[]>(initialData?.aiProviders ?? [])

  /* Architecture Modules */
  const [archModules, setArchModules] = useState<ArchModuleFormData[]>(initialData?.archModules ?? [])

  /* ── Handlers: basic ── */

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value)
      if (autoSlug) setSlug(slugify(value))
    },
    [autoSlug],
  )

  const handleSlugChange = useCallback((value: string) => {
    setAutoSlug(false)
    setSlug(slugify(value))
  }, [])

  /* ── Handlers: members ── */

  const addMember = useCallback((memberId: string) => {
    const member = tenantMembers?.find((m) => m.id === memberId)
    if (!member) return
    setSelectedMembers((prev) => {
      if (prev.some((m) => m.id === memberId)) return prev
      return [...prev, { id: memberId, roles: [member.defaultRole] }]
    })
  }, [tenantMembers])

  const removeMember = useCallback((memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId))
  }, [])

  const toggleMemberRole = useCallback((memberId: string, role: MemberRole) => {
    setSelectedMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m
        const hasRole = m.roles.includes(role)
        const newRoles = hasRole
          ? m.roles.filter((r) => r !== role)
          : [...m.roles, role]
        return { ...m, roles: newRoles.length > 0 ? newRoles : [role] }
      }),
    )
  }, [])

  /* ── Handlers: AI Providers ── */

  const addAIProvider = useCallback(() => {
    setAiProviders((prev) => [...prev, createEmptyAIProvider()])
  }, [])

  const removeAIProvider = useCallback((key: string) => {
    setAiProviders((prev) => prev.filter((p) => p.key !== key))
  }, [])

  const updateAIProvider = useCallback(
    (key: string, field: keyof AIProviderFormData, value: string) => {
      setAiProviders((prev) =>
        prev.map((p) => {
          if (p.key !== key) return p
          const updated = { ...p, [field]: value }
          if (field === 'provider') {
            updated.defaultModel = DEFAULT_MODELS[value as AIProviderName] ?? ''
          }
          return updated
        }),
      )
    },
    [],
  )

  /* ── Handlers: Architecture Modules ── */

  const addArchModule = useCallback(() => {
    setArchModules((prev) => [...prev, createEmptyArchModule()])
  }, [])

  const removeArchModule = useCallback((key: string) => {
    setArchModules((prev) => prev.filter((m) => m.key !== key))
  }, [])

  const updateArchModule = useCallback(
    (key: string, field: keyof ArchModuleFormData, value: string) => {
      setArchModules((prev) =>
        prev.map((m) => (m.key === key ? { ...m, [field]: value } : m)),
      )
    },
    [],
  )

  /* ── Validation ── */

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = t('projectsPage.form.errors.nameRequired')
    if (!slug.trim()) {
      newErrors.slug = t('projectsPage.form.errors.slugRequired')
    } else if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
      newErrors.slug = t('projectsPage.form.errors.slugInvalid')
    }
    if (!description.trim()) newErrors.description = t('projectsPage.form.errors.descriptionRequired')
    /* Team: must have at least one PO */
    const hasPo = selectedMembers.some((m) => m.roles.includes('po'))
    if (!hasPo) newErrors.team = t('projectsPage.form.errors.poRequired')
    /* AI Providers: apiKey required */
    aiProviders.forEach((ap, i) => {
      if (!ap.apiKey.trim()) newErrors[`ai-${i}-key`] = t('projectsPage.form.errors.apiKeyRequired')
    })
    /* Architecture Modules validation */
    archModules.forEach((mod, i) => {
      if (!mod.name.trim()) newErrors[`arch-${i}-name`] = t('projectsPage.form.errors.moduleNameRequired')
      if (!mod.blueprintId) newErrors[`arch-${i}-blueprint`] = t('projectsPage.form.errors.moduleBlueprintRequired')
      if (multiModule === 'subfolder' && !mod.folderPath.trim()) {
        newErrors[`arch-${i}-folder`] = t('projectsPage.form.errors.moduleFolderRequired')
      }
      if (multiModule === 'independent' && !mod.repositoryPath.trim()) {
        newErrors[`arch-${i}-repo`] = t('projectsPage.form.errors.moduleRepoRequired')
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, slug, description, selectedMembers, aiProviders, archModules, multiModule, t])

  /* ── Submit ── */

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (!validate()) return
      if (mode === 'create') {
        createMutation.mutate(
          {
            name,
            slug,
            description,
            repository: {
              provider: repoProvider,
              useGlobalConfig: repoUseGlobal,
              serverUrl: repoServerUrl || undefined,
              accessToken: repoAccessToken || undefined,
              repositoryPath: repoPath || undefined,
              multiModule,
            },
            documentation: {
              type: docType,
              repositoryPath: docType === 'independent' ? docRepoPath || undefined : undefined,
            },
            architecture: {
              modules: archModules.map((mod) => ({
                name: mod.name,
                blueprintId: mod.blueprintId,
                folderPath: multiModule === 'subfolder' ? mod.folderPath || undefined : undefined,
                repositoryPath: multiModule === 'independent' ? mod.repositoryPath || undefined : undefined,
              })),
            },
            aiProviders: aiProviders.map((ap) => ({
              provider: ap.provider,
              endpointUrl: ap.endpointUrl || undefined,
              apiKey: ap.apiKey,
              defaultModel: ap.defaultModel,
              rateLimitTokensPerMin: ap.rateLimitTokensPerMin ? Number(ap.rateLimitTokensPerMin) : undefined,
              rateLimitRequestsPerDay: ap.rateLimitRequestsPerDay ? Number(ap.rateLimitRequestsPerDay) : undefined,
            })),
            members: selectedMembers.map((m) => ({ id: m.id, roles: m.roles })),
          },
          { onSuccess: () => navigate('/projects') },
        )
      }
    },
    [mode, name, slug, description, repoProvider, repoUseGlobal, repoServerUrl, repoAccessToken, repoPath, multiModule, docType, docRepoPath, archModules, aiProviders, selectedMembers, validate, createMutation, navigate],
  )

  /* ── Derived ── */

  const availableMembers = tenantMembers?.filter(
    (tm) => !selectedMembers.some((sm) => sm.id === tm.id),
  ) ?? []

  /* Embedded docs only available for single-repo or monorepo */
  const canEmbedDocs = multiModule !== 'independent'

  const inputCls = (errorKey?: string) =>
    cn(
      'w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text',
      'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
      errorKey && errors[errorKey] ? 'border-error' : 'border-border',
    )

  const selectCls =
    'w-full appearance-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer'

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft size={16} />
        {t('projectsPage.form.backToList')}
      </button>

      {/* Form card */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        {/* Section 1: Basic data */}
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-text mb-4">
            {t('projectsPage.form.basicData')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="project-name" className="block text-sm font-medium text-text mb-1">
                {t('projectsPage.form.name')} <span className="text-error">*</span>
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('projectsPage.form.namePlaceholder')}
                className={cn(
                  'w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text',
                  'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  errors.name ? 'border-error' : 'border-border',
                )}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-xs text-error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="project-slug" className="block text-sm font-medium text-text mb-1">
                {t('projectsPage.form.slug')} <span className="text-error">*</span>
              </label>
              <input
                id="project-slug"
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder={t('projectsPage.form.slugPlaceholder')}
                className={cn(
                  'w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text font-mono',
                  'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  errors.slug ? 'border-error' : 'border-border',
                )}
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? 'slug-error' : undefined}
              />
              {errors.slug && (
                <p id="slug-error" className="mt-1 text-xs text-error" role="alert">
                  {errors.slug}
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">
                {t('projectsPage.form.slugHelp')}
              </p>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="project-description" className="block text-sm font-medium text-text mb-1">
                {t('projectsPage.form.description')} <span className="text-error">*</span>
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('projectsPage.form.descriptionPlaceholder')}
                rows={3}
                className={cn(
                  'w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text resize-vertical',
                  'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  errors.description ? 'border-error' : 'border-border',
                )}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'desc-error' : undefined}
              />
              {errors.description && (
                <p id="desc-error" className="mt-1 text-xs text-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Team (§5 do brief) */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-text">{t('projectsPage.form.teamSection')}</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">
            {t('projectsPage.form.teamHelp')}
          </p>
          <div className="flex items-center gap-2 mb-4">
            {membersLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 size={16} className="animate-spin" /> {t('common.loading')}
              </div>
            ) : (
              <select
                id="add-member-select"
                className={selectCls}
                value=""
                onChange={(e) => { if (e.target.value) addMember(e.target.value) }}
                aria-label={t('projectsPage.form.addMember')}
              >
                <option value="">{t('projectsPage.form.selectMember')}</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.email}</option>
                ))}
              </select>
            )}
          </div>
          {errors.team && (
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-[var(--radius-md)] bg-error-light border border-error-border">
              <AlertTriangle size={14} className="text-error shrink-0" />
              <p className="text-xs text-error" role="alert">{errors.team}</p>
            </div>
          )}
          {selectedMembers.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center border border-dashed border-border rounded-[var(--radius-md)]">
              {t('projectsPage.form.noMembers')}
            </p>
          ) : (
            <div className="space-y-3">
              {selectedMembers.map((sm) => {
                const member = tenantMembers?.find((m) => m.id === sm.id)
                return (
                  <div key={sm.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                        {(member?.name ?? '??').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{member?.name}</p>
                        <p className="text-xs text-text-muted truncate">{member?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(sm.id)}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-text-muted hover:text-error hover:bg-error-light transition-colors"
                        aria-label={t('projectsPage.form.removeMember')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {/* Role toggles — multiple selection */}
                    <div className="flex flex-wrap gap-1.5">
                      {MEMBER_ROLES.map((role) => {
                        const isActive = sm.roles.includes(role)
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleMemberRole(sm.id, role)}
                            className={cn(
                              'rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase transition-colors',
                              isActive
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-surface border-border text-text-muted hover:border-primary/30',
                            )}
                            aria-pressed={isActive}
                            aria-label={`${t(`projectsPage.detail.team.roles.${role}`)} - ${member?.name}`}
                          >
                            {t(`projectsPage.detail.team.roles.${role}`)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Section 3: Repository (§6 do brief) */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={18} className="text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-text">{t('projectsPage.form.repoSection')}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Provider */}
            <div>
              <label htmlFor="repo-provider" className="block text-sm font-medium text-text mb-1">
                {t('projectsPage.form.repoProvider')}
              </label>
              <select
                id="repo-provider"
                value={repoProvider}
                onChange={(e) => setRepoProvider(e.target.value as RepositoryProvider)}
                className={selectCls}
                aria-label={t('projectsPage.form.repoProvider')}
              >
                {REPO_PROVIDERS.map((p) => (
                  <option key={p} value={p}>{t(`projectsPage.providers.${p}`)}</option>
                ))}
              </select>
            </div>

            {/* Use global config toggle */}
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repoUseGlobal}
                  onChange={(e) => setRepoUseGlobal(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-text">{t('projectsPage.form.repoUseGlobal')}</span>
              </label>
            </div>

            {/* Global config display */}
            {repoUseGlobal && tenantConfig && (
              <div className="sm:col-span-2 flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-info-light border border-info-border">
                <Globe size={14} className="text-info shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-info">
                  <p className="font-medium mb-1">{t('projectsPage.form.repoGlobalInfo')}</p>
                  <p>{t(`projectsPage.providers.${tenantConfig.repository.provider}`)} — {tenantConfig.repository.accessTokenMasked}</p>
                </div>
              </div>
            )}

            {/* Custom connection config (when not using global) */}
            {!repoUseGlobal && (
              <>
                <div>
                  <label htmlFor="repo-server-url" className="block text-sm font-medium text-text mb-1">
                    {t('projectsPage.form.repoServerUrl')}
                  </label>
                  <input
                    id="repo-server-url"
                    type="url"
                    value={repoServerUrl}
                    onChange={(e) => setRepoServerUrl(e.target.value)}
                    placeholder={t('projectsPage.form.repoServerUrlPlaceholder')}
                    className={inputCls()}
                  />
                </div>
                <div>
                  <label htmlFor="repo-access-token" className="block text-sm font-medium text-text mb-1">
                    {t('projectsPage.form.repoAccessToken')}
                  </label>
                  <input
                    id="repo-access-token"
                    type="password"
                    value={repoAccessToken}
                    onChange={(e) => setRepoAccessToken(e.target.value)}
                    placeholder={t('projectsPage.form.repoAccessTokenPlaceholder')}
                    className={inputCls()}
                  />
                </div>
              </>
            )}

            {/* Multi-module */}
            <div>
              <label htmlFor="multi-module" className="block text-sm font-medium text-text mb-1">
                {t('projectsPage.form.multiModuleLabel')}
              </label>
              <select
                id="multi-module"
                value={multiModule}
                onChange={(e) => {
                  const val = e.target.value as MultiModuleStrategy
                  setMultiModule(val)
                  /* If switching to independent repos, force docs to independent */
                  if (val === 'independent' && docType === 'embedded') {
                    setDocType('independent')
                  }
                }}
                className={selectCls}
                aria-label={t('projectsPage.form.multiModuleLabel')}
              >
                {MULTI_MODULE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{t(`projectsPage.multiModule.${opt}`)}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-muted">
                {t(`projectsPage.form.multiModuleHelp.${multiModule}`)}
              </p>
            </div>

            {/* Repository path */}
            {multiModule !== 'independent' && (
              <div>
                <label htmlFor="repo-path" className="block text-sm font-medium text-text mb-1">
                  {t('projectsPage.form.repoPath')}
                </label>
                <input
                  id="repo-path"
                  type="text"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder={t('projectsPage.form.repoPathPlaceholder')}
                  className={cn(inputCls(), 'font-mono')}
                />
              </div>
            )}

            {multiModule === 'independent' && (
              <div className="sm:col-span-2 flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-bg border border-border">
                <AlertTriangle size={14} className="text-text-muted shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-text-muted">
                  {t('projectsPage.form.repoIndependentInfo')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Documentation (§7 do brief) */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-text">{t('projectsPage.form.docSection')}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="doc-type" className="block text-sm font-medium text-text mb-1">
                {t('projectsPage.form.docTypeLabel')}
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentationType)}
                className={selectCls}
                aria-label={t('projectsPage.form.docTypeLabel')}
                disabled={!canEmbedDocs}
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt} disabled={dt === 'embedded' && !canEmbedDocs}>
                    {t(`projectsPage.form.docTypes.${dt}`)}
                  </option>
                ))}
              </select>
              {!canEmbedDocs && (
                <p className="mt-1 text-xs text-warning">
                  {t('projectsPage.form.docEmbedDisabled')}
                </p>
              )}
            </div>

            {docType === 'independent' && (
              <div>
                <label htmlFor="doc-repo-path" className="block text-sm font-medium text-text mb-1">
                  {t('projectsPage.form.docRepoPath')}
                </label>
                <input
                  id="doc-repo-path"
                  type="text"
                  value={docRepoPath}
                  onChange={(e) => setDocRepoPath(e.target.value)}
                  placeholder={t('projectsPage.form.docRepoPathPlaceholder')}
                  className={cn(inputCls(), 'font-mono')}
                />
              </div>
            )}

            {docType === 'embedded' && (
              <div className="sm:col-span-2 flex items-start gap-1.5 p-2.5 rounded-[var(--radius-md)] bg-warning-light border border-warning-border">
                <Shield size={14} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-warning">
                  {t('projectsPage.form.docSecurityWarning')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Architecture */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Blocks size={18} className="text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-text">{t('projectsPage.form.archSection')}</h2>
            </div>
            {(multiModule !== 'none' || archModules.length === 0) && (
              <button
                type="button"
                onClick={addArchModule}
                disabled={multiModule === 'none' && archModules.length >= 1}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary px-3 py-1.5 text-xs font-medium text-white',
                  'hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                <Plus size={14} /> {t('projectsPage.form.archAddModule')}
              </button>
            )}
          </div>

          <p className="text-xs text-text-muted mb-4">
            {multiModule === 'none' && t('projectsPage.form.archSingleHelp')}
            {multiModule === 'subfolder' && t('projectsPage.form.archMonorepoHelp')}
            {multiModule === 'independent' && t('projectsPage.form.archIndependentHelp')}
          </p>

          {multiModule === 'none' && archModules.length >= 1 && (
            <p className="text-xs text-text-muted mb-3 italic">
              {t('projectsPage.form.archSingleModuleLimit')}
            </p>
          )}

          {archModules.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center border border-dashed border-border rounded-[var(--radius-md)]">
              {t('projectsPage.form.archNoModules')}
            </p>
          ) : (
            <div className="space-y-4">
              {archModules.map((mod, index) => (
                <div key={mod.key} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-text">
                      {t('projectsPage.form.archModuleIndex', { index: index + 1 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeArchModule(mod.key)}
                      className="inline-flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors"
                      aria-label={t('projectsPage.form.archRemoveModule')}
                    >
                      <Trash2 size={12} /> {t('common.delete')}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Module name */}
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.archModuleName')} <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => updateArchModule(mod.key, 'name', e.target.value)}
                        placeholder={t('projectsPage.form.archModuleNamePlaceholder')}
                        className={inputCls(`arch-${index}-name`)}
                      />
                      {errors[`arch-${index}-name`] && (
                        <p className="mt-1 text-xs text-error">{errors[`arch-${index}-name`]}</p>
                      )}
                    </div>

                    {/* Blueprint */}
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.archBlueprint')} <span className="text-error">*</span>
                      </label>
                      {blueprintsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-text-muted py-2">
                          <Loader2 size={14} className="animate-spin" /> {t('common.loading')}
                        </div>
                      ) : (
                        <select
                          value={mod.blueprintId}
                          onChange={(e) => updateArchModule(mod.key, 'blueprintId', e.target.value)}
                          className={selectCls}
                          aria-label={t('projectsPage.form.archBlueprint')}
                        >
                          <option value="">{t('projectsPage.form.archSelectBlueprint')}</option>
                          {blueprints?.map((bp) => (
                            <option key={bp.id} value={bp.id}>{bp.name}</option>
                          ))}
                        </select>
                      )}
                      {errors[`arch-${index}-blueprint`] && (
                        <p className="mt-1 text-xs text-error">{errors[`arch-${index}-blueprint`]}</p>
                      )}
                      {mod.blueprintId && blueprints && (
                        <p className="mt-1 text-xs text-text-muted">
                          {blueprints.find((bp) => bp.id === mod.blueprintId)?.description}
                        </p>
                      )}
                    </div>

                    {/* Folder path — only for monorepo */}
                    {multiModule === 'subfolder' && (
                      <div>
                        <label className="block text-xs font-medium text-text mb-1">
                          {t('projectsPage.form.archFolderPath')} <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={mod.folderPath}
                          onChange={(e) => updateArchModule(mod.key, 'folderPath', e.target.value)}
                          placeholder={t('projectsPage.form.archFolderPathPlaceholder')}
                          className={cn(inputCls(`arch-${index}-folder`), 'font-mono')}
                        />
                        {errors[`arch-${index}-folder`] && (
                          <p className="mt-1 text-xs text-error">{errors[`arch-${index}-folder`]}</p>
                        )}
                      </div>
                    )}

                    {/* Repository path — only for independent repos */}
                    {multiModule === 'independent' && (
                      <div>
                        <label className="block text-xs font-medium text-text mb-1">
                          {t('projectsPage.form.archRepoPath')} <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={mod.repositoryPath}
                          onChange={(e) => updateArchModule(mod.key, 'repositoryPath', e.target.value)}
                          placeholder={t('projectsPage.form.archRepoPathPlaceholder')}
                          className={cn(inputCls(`arch-${index}-repo`), 'font-mono')}
                        />
                        {errors[`arch-${index}-repo`] && (
                          <p className="mt-1 text-xs text-error">{errors[`arch-${index}-repo`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: AI Providers (§8 do brief) */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-text">{t('projectsPage.form.aiSection')}</h2>
            </div>
            <button
              type="button"
              onClick={addAIProvider}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary px-3 py-1.5 text-xs font-medium text-white',
                'hover:bg-primary-dark transition-colors',
              )}
            >
              <Plus size={14} /> {t('projectsPage.form.aiAddProvider')}
            </button>
          </div>

          <p className="text-xs text-text-muted mb-4">{t('projectsPage.form.aiHelp')}</p>

          {/* Global AI config toggle */}
          {tenantConfig && tenantConfig.aiProviders.length > 0 && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-[var(--radius-md)] bg-info-light border border-info-border">
              <Globe size={14} className="text-info shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-info">
                <p className="font-medium mb-1">{t('projectsPage.form.aiGlobalInfo')}</p>
                <div className="flex flex-wrap gap-2">
                  {tenantConfig.aiProviders.map((ap) => (
                    <span key={ap.provider} className="font-mono">{ap.provider} ({ap.defaultModel})</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {aiProviders.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center border border-dashed border-border rounded-[var(--radius-md)]">
              {t('projectsPage.form.aiNoProviders')}
            </p>
          ) : (
            <div className="space-y-4">
              {aiProviders.map((ap, index) => (
                <div key={ap.key} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-text">
                      {t('projectsPage.form.aiProviderIndex', { index: index + 1 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAIProvider(ap.key)}
                      className="inline-flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors"
                      aria-label={t('projectsPage.form.aiRemoveProvider')}
                    >
                      <Trash2 size={12} /> {t('common.delete')}
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.aiProviderName')}
                      </label>
                      <select
                        value={ap.provider}
                        onChange={(e) => updateAIProvider(ap.key, 'provider', e.target.value)}
                        className={selectCls}
                        aria-label={t('projectsPage.form.aiProviderName')}
                      >
                        {AI_PROVIDERS.map((p) => (
                          <option key={p} value={p}>{t(`projectsPage.aiProviders.${p}`)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.aiDefaultModel')}
                      </label>
                      <input
                        type="text"
                        value={ap.defaultModel}
                        onChange={(e) => updateAIProvider(ap.key, 'defaultModel', e.target.value)}
                        placeholder={t('projectsPage.form.aiDefaultModelPlaceholder')}
                        className={cn(inputCls(), 'font-mono')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.aiApiKey')} <span className="text-error">*</span>
                      </label>
                      <input
                        type="password"
                        value={ap.apiKey}
                        onChange={(e) => updateAIProvider(ap.key, 'apiKey', e.target.value)}
                        placeholder={t('projectsPage.form.aiApiKeyPlaceholder')}
                        className={inputCls(`ai-${index}-key`)}
                      />
                      {errors[`ai-${index}-key`] && (
                        <p className="mt-1 text-xs text-error">{errors[`ai-${index}-key`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.aiEndpointUrl')}
                      </label>
                      <input
                        type="url"
                        value={ap.endpointUrl}
                        onChange={(e) => updateAIProvider(ap.key, 'endpointUrl', e.target.value)}
                        placeholder={t('projectsPage.form.aiEndpointUrlPlaceholder')}
                        className={inputCls()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.aiRateTokens')}
                      </label>
                      <input
                        type="number"
                        value={ap.rateLimitTokensPerMin}
                        onChange={(e) => updateAIProvider(ap.key, 'rateLimitTokensPerMin', e.target.value)}
                        placeholder={t('projectsPage.form.aiRateTokensPlaceholder')}
                        className={inputCls()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        {t('projectsPage.form.aiRateRequests')}
                      </label>
                      <input
                        type="number"
                        value={ap.rateLimitRequestsPerDay}
                        onChange={(e) => updateAIProvider(ap.key, 'rateLimitRequestsPerDay', e.target.value)}
                        placeholder={t('projectsPage.form.aiRateRequestsPlaceholder')}
                        className={inputCls()}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cost warning */}
          <div className="flex items-start gap-1.5 mt-4 p-2.5 rounded-[var(--radius-md)] bg-warning-light border border-warning-border">
            <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-warning">
              {t('projectsPage.form.aiCostWarning')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-bg transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className={cn(
            'inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white',
            'hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {createMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {mode === 'create' ? t('projectsPage.form.createButton') : t('common.save')}
        </button>
      </div>

      {/* Error feedback */}
      {createMutation.isError && (
        <div className="rounded-[var(--radius-md)] border border-error-border bg-error-light p-3 text-sm text-error" role="alert">
          {t('common.error')}
        </div>
      )}
    </form>
  )
}

export { ProjectForm }
export type { ProjectFormProps }
