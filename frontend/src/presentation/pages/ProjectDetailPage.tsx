import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Settings2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { ProjectOverview } from '@presentation/components/projects'
import { useProject } from '@application/hooks/useProjects'
import { cn } from '@shared/utils/cn'
import type { ProjectStatus } from '@domain/models/project'

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: {
    label: 'projectsPage.status.active',
    className: 'bg-success-light text-success border-success-border',
  },
  configuring: {
    label: 'projectsPage.status.configuring',
    className: 'bg-warning-light text-warning border-warning-border',
  },
  archived: {
    label: 'projectsPage.status.archived',
    className: 'bg-surface text-text-muted border-border',
  },
}

function ProjectDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading, isError, refetch } = useProject(id ?? '')

  return (
    <>
      <Header
        title={project?.name ?? t('projectsPage.detail.loading')}
        subtitle={project?.description ?? ''}
      />
      <PageContainer>
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            {t('projectsPage.form.backToList')}
          </button>

          {project && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  statusConfig[project.status].className,
                )}
              >
                {project.status === 'active' && <CheckCircle2 size={12} />}
                {project.status === 'configuring' && <Settings2 size={12} />}
                {project.status === 'archived' && <AlertTriangle size={12} />}
                {t(statusConfig[project.status].label)}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}/edit`)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text',
                  'hover:bg-bg transition-colors',
                )}
              >
                <Pencil size={14} />
                {t('common.edit')}
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-text-muted">{t('common.loading')}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-[var(--radius-lg)] border border-error-border bg-error-light p-8 text-center">
            <p className="text-sm text-error">{t('common.error')}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              type="button"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Content */}
        {project && (
          <div className="space-y-6">
            <ProjectOverview project={project} />
          </div>
        )}
      </PageContainer>
    </>
  )
}

export { ProjectDetailPage }
