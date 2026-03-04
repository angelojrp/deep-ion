import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  GitBranch,
  Users,
  Activity,
  CheckCircle2,
  Settings2,
  MoreVertical,
  Pencil,
  Trash2,
  Bot,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import type { ProjectSummary, ProjectStatus, RepositoryProvider } from '@domain/models/project'
import { useState, useRef, useEffect } from 'react'

interface ProjectCardProps {
  project: ProjectSummary
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const statusConfig: Record<ProjectStatus, { label: string; className: string; icon: typeof Activity }> = {
  pending: {
    label: 'projectsPage.status.pending',
    className: 'bg-info-light text-info border-info-border',
    icon: Activity,
  },
  active: {
    label: 'projectsPage.status.active',
    className: 'bg-success-light text-success border-success-border',
    icon: CheckCircle2,
  },
  configuring: {
    label: 'projectsPage.status.configuring',
    className: 'bg-warning-light text-warning border-warning-border',
    icon: Settings2,
  },
  archived: {
    label: 'projectsPage.status.archived',
    className: 'bg-surface text-text-muted border-border',
    icon: Activity,
  },
}

const providerColors: Record<RepositoryProvider, string> = {
  'github': 'bg-surface text-text border-border',
  'gitlab': 'bg-warning-light text-warning border-warning-border',
  'bitbucket': 'bg-info-light text-info border-info-border',
  'azure-devops': 'bg-info-light text-info border-info-border',
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updatedDate = new Date(project.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex-1 min-w-0">
          <Link
            to={`/projects/${project.id}`}
            className="text-base font-semibold text-text hover:text-primary transition-colors truncate block"
          >
            {project.name}
          </Link>
          <p className="text-xs text-text-muted mt-0.5 font-mono">{project.slug}</p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
              status.className,
            )}
          >
            <StatusIcon size={12} aria-hidden="true" />
            {t(status.label)}
          </span>
          {/* Context menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-bg transition-colors"
              aria-label={t('projectsPage.actions.menu')}
            >
              <MoreVertical size={14} className="text-text-muted" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-40 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-lg)] py-1">
                <button
                  type="button"
                  onClick={() => { onEdit(project.id); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text hover:bg-bg transition-colors"
                >
                  <Pencil size={14} /> {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => { onDelete(project.id); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error-light transition-colors"
                >
                  <Trash2 size={14} /> {t('common.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm text-text-secondary line-clamp-2">{project.description}</p>
      </div>

      {/* Provider badge */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            providerColors[project.repositoryProvider],
          )}
        >
          <GitBranch size={10} aria-hidden="true" />
          {t(`projectsPage.providers.${project.repositoryProvider}`)}
        </span>
        {project.multiModule !== 'none' && (
          <span className="inline-flex items-center rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs font-medium text-text-muted">
            {t(`projectsPage.multiModule.${project.multiModule}`)}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-3 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Users size={12} aria-hidden="true" />
          {project.membersCount} {t('projectsPage.stats.members')}
        </span>

        <span className="inline-flex items-center gap-1 ml-auto">
          <Bot size={12} aria-hidden="true" />
          {project.aiProvidersCount} {t('projectsPage.stats.aiProviders')}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <span className="text-xs text-text-muted">
          {t('projectsPage.updatedAt')}: {updatedDate}
        </span>
        <Link
          to={`/projects/${project.id}`}
          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t('projectsPage.viewDetails')} →
        </Link>
      </div>
    </div>
  )
}

export { ProjectCard }
export type { ProjectCardProps }
