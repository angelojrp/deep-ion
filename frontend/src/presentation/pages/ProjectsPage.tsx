import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { ProjectCard, DeleteConfirmDialog } from '@presentation/components/projects'
import { useProjects, useDeleteProject } from '@application/hooks/useProjects'
import { cn } from '@shared/utils/cn'
import type { ProjectStatus } from '@domain/models/project'

function ProjectsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: projects, isLoading, isError, refetch } = useProjects()
  const deleteMutation = useDeleteProject()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const handleEdit = useCallback(
    (id: string) => navigate(`/projects/${id}/edit`),
    [navigate],
  )

  const handleDeleteRequest = useCallback(
    (id: string) => {
      const project = projects?.find((p) => p.id === id)
      if (project) {
        setDeleteTarget({ id: project.id, name: project.name })
      }
    },
    [projects],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }, [deleteTarget, deleteMutation])

  return (
    <>
      <Header
        title={t('projectsPage.title')}
        subtitle={t('projectsPage.subtitle')}
      />
      <PageContainer>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('projectsPage.searchPlaceholder')}
                className={cn(
                  'w-full rounded-[var(--radius-md)] border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text',
                  'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                )}
                aria-label={t('projectsPage.searchPlaceholder')}
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className={cn(
                  'appearance-none rounded-[var(--radius-md)] border border-border bg-surface pl-9 pr-8 py-2 text-sm text-text',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer',
                )}
                aria-label={t('projectsPage.filterByStatus')}
              >
                <option value="all">{t('projectsPage.filters.all')}</option>
                <option value="active">{t('projectsPage.status.active')}</option>
                <option value="configuring">{t('projectsPage.status.configuring')}</option>
                <option value="archived">{t('projectsPage.status.archived')}</option>
              </select>
            </div>
          </div>

          {/* New project button */}
          <button
            type="button"
            onClick={() => navigate('/projects/new')}
            className={cn(
              'inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white',
              'hover:bg-primary-dark transition-colors shadow-[var(--shadow-card)]',
            )}
          >
            <Plus size={16} />
            {t('projectsPage.newProject')}
          </button>
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

        {/* Empty state */}
        {projects && filteredProjects.length === 0 && !isLoading && (
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-12 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-text-muted mb-4">
              {searchQuery || statusFilter !== 'all'
                ? t('common.noResults')
                : t('projectsPage.emptyState')}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                type="button"
                onClick={() => navigate('/projects/new')}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                <Plus size={16} />
                {t('projectsPage.newProject')}
              </button>
            )}
          </div>
        )}

        {/* Projects grid */}
        {filteredProjects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}

        {/* Summary */}
        {projects && projects.length > 0 && (
          <div className="mt-4 text-xs text-text-muted text-center">
            {t('projectsPage.showing', { count: filteredProjects.length, total: projects.length })}
          </div>
        )}
      </PageContainer>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        projectName={deleteTarget?.name ?? ''}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export { ProjectsPage }
