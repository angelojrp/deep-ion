import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Play,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bot,
  FileText,
  Blocks,
  Plus,
} from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { cn } from '@shared/utils/cn'
import {
  usePendingProjects,
  useKickoffs,
  useStartKickoff,
  useCreatePendingProject,
} from '@application/hooks/useProjectKickoff'
import type { KickoffStep } from '@domain/models/project-kickoff'

const stepLabels: Record<KickoffStep, string> = {
  initial_description: 'kickoff.steps.initialDescription',
  vision_generation: 'kickoff.steps.visionGeneration',
  vision_review: 'kickoff.steps.visionReview',
  vision_approved: 'kickoff.steps.visionApproved',
  architecture_check: 'kickoff.steps.architectureCheck',
  architecture_task: 'kickoff.steps.architectureTask',
  architecture_generation: 'kickoff.steps.architectureGeneration',
  architecture_review: 'kickoff.steps.architectureReview',
  architecture_approved: 'kickoff.steps.architectureApproved',
  scaffold_generation: 'kickoff.steps.scaffoldGeneration',
  completed: 'kickoff.steps.completed',
}

const stepIcons: Record<string, typeof Clock> = {
  initial_description: FileText,
  vision_generation: Bot,
  vision_review: FileText,
  vision_approved: CheckCircle2,
  architecture_check: Blocks,
  architecture_task: Blocks,
  architecture_generation: Bot,
  architecture_review: FileText,
  architecture_approved: CheckCircle2,
  scaffold_generation: Blocks,
  completed: CheckCircle2,
}

function ProjectKickoffPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: pendingProjects, isLoading: loadingPending } = usePendingProjects()
  const { data: kickoffs, isLoading: loadingKickoffs } = useKickoffs()
  const startKickoff = useStartKickoff()
  const createPending = useCreatePendingProject()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [initialDescription, setInitialDescription] = useState('')
  const [showNewKickoff, setShowNewKickoff] = useState(false)

  // New project form state
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectSlug, setNewProjectSlug] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  const isLoading = loadingPending || loadingKickoffs
  const hasPendingProjects = pendingProjects && pendingProjects.length > 0

  /** Auto-generate slug from project name */
  const handleNameChange = useCallback((value: string) => {
    setNewProjectName(value)
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setNewProjectSlug(slug)
    setFormErrors({})
    setCreateSuccess(null)
  }, [])

  /** Validate the create project form */
  function validateCreateForm(): boolean {
    const errors: Record<string, string> = {}
    if (!newProjectName.trim()) {
      errors.name = t('kickoff.newKickoff.createProject.errors.nameRequired')
    }
    if (!newProjectSlug.trim()) {
      errors.slug = t('kickoff.newKickoff.createProject.errors.slugRequired')
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newProjectSlug)) {
      errors.slug = t('kickoff.newKickoff.createProject.errors.slugInvalid')
    }
    if (!newProjectDescription.trim()) {
      errors.description = t('kickoff.newKickoff.createProject.errors.descriptionRequired')
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /** Submit new pending project */
  function handleCreateProject() {
    if (!validateCreateForm()) return
    createPending.mutate(
      {
        name: newProjectName.trim(),
        slug: newProjectSlug.trim(),
        description: newProjectDescription.trim(),
      },
      {
        onSuccess: (data) => {
          setCreateSuccess(t('kickoff.newKickoff.createProject.success', { name: data.name }))
          setSelectedProjectId(data.id)
          setNewProjectName('')
          setNewProjectSlug('')
          setNewProjectDescription('')
          setFormErrors({})
        },
      },
    )
  }

  function handleStartKickoff() {
    if (!selectedProjectId || !initialDescription.trim()) return
    startKickoff.mutate(
      {
        projectId: selectedProjectId,
        initialDescription: initialDescription.trim(),
      },
      {
        onSuccess: (data) => {
          navigate(`/projects/kickoff/${data.projectId}`)
        },
      },
    )
  }

  return (
    <>
      <Header
        title={t('kickoff.page.title')}
        subtitle={t('kickoff.page.subtitle')}
      />
      <PageContainer>
        {/* Active Kickoffs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text flex items-center gap-2">
              <Rocket size={18} className="text-primary" />
              {t('kickoff.activeKickoffs')}
            </h2>
            <button
              type="button"
              onClick={() => setShowNewKickoff(!showNewKickoff)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              <Play size={14} />
              {t('kickoff.startNew')}
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
            </div>
          ) : kickoffs && kickoffs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kickoffs.map((kickoff) => {
                const StepIcon = stepIcons[kickoff.currentStep] ?? Clock
                const isCompleted = kickoff.currentStep === 'completed'

                return (
                  <button
                    key={kickoff.id}
                    type="button"
                    onClick={() => navigate(`/projects/kickoff/${kickoff.projectId}`)}
                    className={cn(
                      'group rounded-[var(--radius-lg)] border bg-surface p-5 text-left transition-all hover:shadow-[var(--shadow-card)] hover:border-primary/30',
                      isCompleted ? 'border-success-border' : 'border-border',
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">
                        {kickoff.projectName}
                      </h3>
                      <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2 mb-3">
                      {kickoff.initialDescription}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                          isCompleted
                            ? 'bg-success-light text-success border-success-border'
                            : 'bg-info-light text-info border-info-border',
                        )}
                      >
                        <StepIcon size={12} />
                        {t(stepLabels[kickoff.currentStep])}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-text-muted">
                      {t('kickoff.startedBy', { name: kickoff.startedBy })} ·{' '}
                      {new Date(kickoff.startedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-8 text-center">
              <Rocket size={32} className="mx-auto text-text-muted mb-3" />
              <p className="text-sm text-text-muted">{t('kickoff.emptyState')}</p>
            </div>
          )}
        </section>

        {/* New Kickoff Form */}
        {showNewKickoff && (
          <section className="rounded-[var(--radius-lg)] border border-primary/30 bg-primary/5 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
              <Play size={18} className="text-primary" />
              {t('kickoff.newKickoff.title')}
            </h2>

            {/* Project selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-2" htmlFor="kickoff-project-select">
                {t('kickoff.newKickoff.selectProject')}
              </label>
              {hasPendingProjects ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProjectId(project.id)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-all',
                        selectedProjectId === project.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-surface hover:border-primary/30',
                      )}
                    >
                      <span className="text-sm font-medium text-text">{project.name}</span>
                      <span className="block text-xs text-text-muted mt-0.5">{project.slug}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-text-muted">{t('kickoff.newKickoff.noPendingProjects')}</p>

                  {/* Inline create project form */}
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                      <Plus size={16} className="text-primary" />
                      {t('kickoff.newKickoff.createProject.title')}
                    </h3>

                    {createSuccess && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg border border-success-border bg-success-light px-4 py-3 text-sm text-success">
                        <CheckCircle2 size={16} />
                        {createSuccess}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Nome */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label htmlFor="new-project-name" className="block text-xs font-medium text-text mb-1">
                          {t('kickoff.newKickoff.createProject.name')}
                        </label>
                        <input
                          id="new-project-name"
                          type="text"
                          value={newProjectName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder={t('kickoff.newKickoff.createProject.namePlaceholder')}
                          className={cn(
                            'w-full rounded-lg border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30',
                            formErrors.name ? 'border-error' : 'border-border',
                          )}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-error">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Slug */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label htmlFor="new-project-slug" className="block text-xs font-medium text-text mb-1">
                          {t('kickoff.newKickoff.createProject.slug')}
                        </label>
                        <input
                          id="new-project-slug"
                          type="text"
                          value={newProjectSlug}
                          onChange={(e) => {
                            setNewProjectSlug(e.target.value)
                            setFormErrors((prev) => {
                              const next = { ...prev }
                              delete next.slug
                              return next
                            })
                          }}
                          placeholder={t('kickoff.newKickoff.createProject.slugPlaceholder')}
                          className={cn(
                            'w-full rounded-lg border bg-background px-3 py-2 text-sm text-text font-mono focus:outline-none focus:ring-2 focus:ring-primary/30',
                            formErrors.slug ? 'border-error' : 'border-border',
                          )}
                        />
                        <p className={cn('mt-1 text-xs', formErrors.slug ? 'text-error' : 'text-text-muted')}>
                          {formErrors.slug ?? t('kickoff.newKickoff.createProject.slugHelp')}
                        </p>
                      </div>

                      {/* Descrição */}
                      <div className="sm:col-span-2">
                        <label htmlFor="new-project-desc" className="block text-xs font-medium text-text mb-1">
                          {t('kickoff.newKickoff.createProject.description')}
                        </label>
                        <textarea
                          id="new-project-desc"
                          value={newProjectDescription}
                          onChange={(e) => {
                            setNewProjectDescription(e.target.value)
                            setFormErrors((prev) => {
                              const next = { ...prev }
                              delete next.description
                              return next
                            })
                          }}
                          placeholder={t('kickoff.newKickoff.createProject.descriptionPlaceholder')}
                          rows={3}
                          className={cn(
                            'w-full rounded-lg border bg-background px-3 py-2 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-primary/30',
                            formErrors.description ? 'border-error' : 'border-border',
                          )}
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-xs text-error">{formErrors.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleCreateProject}
                        disabled={createPending.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        {createPending.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            {t('kickoff.newKickoff.createProject.submitting')}
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            {t('kickoff.newKickoff.createProject.submit')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Initial description */}
            {selectedProjectId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2" htmlFor="kickoff-description">
                  {t('kickoff.newKickoff.descriptionLabel')}
                </label>
                <textarea
                  id="kickoff-description"
                  value={initialDescription}
                  onChange={(e) => setInitialDescription(e.target.value)}
                  placeholder={t('kickoff.newKickoff.descriptionPlaceholder')}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleStartKickoff}
                disabled={!selectedProjectId || !initialDescription.trim() || startKickoff.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {startKickoff.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('kickoff.newKickoff.starting')}
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    {t('kickoff.newKickoff.start')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewKickoff(false)
                  setSelectedProjectId(null)
                  setInitialDescription('')
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text transition-colors"
              >
                {t('kickoff.cancel')}
              </button>
            </div>
          </section>
        )}
      </PageContainer>
    </>
  )
}

export { ProjectKickoffPage }
