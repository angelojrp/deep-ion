import { useTranslation } from 'react-i18next'
import {
  GitBranch,
  ExternalLink,
  Users,
  FileText,
  Bot,
  Shield,
  Globe,
  AlertTriangle,
  Key,
  Blocks,
} from 'lucide-react'
import type { Project, MemberRole, RepositoryProvider, AIProviderName } from '@domain/models/project'
import { useBlueprints } from '@application/hooks/useProjects'

interface ProjectOverviewProps {
  project: Project
}

const providerLabels: Record<RepositoryProvider, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  'azure-devops': 'Azure DevOps',
}

const aiProviderLabels: Record<AIProviderName, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  'google-ai': 'Google AI',
  'azure-openai': 'Azure OpenAI',
  'aws-bedrock': 'AWS Bedrock',
}

function ProjectOverview({ project }: ProjectOverviewProps) {
  const { t } = useTranslation()
  const { data: blueprints } = useBlueprints()

  const createdDate = new Date(project.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Repository + Documentation */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Repository info */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={16} className="text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text">
              {t('projectsPage.detail.repository.title')}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{t('projectsPage.detail.repository.provider')}:</span>
              <span className="text-sm font-medium text-text">
                {providerLabels[project.repository.provider]}
              </span>
            </div>
            {project.repository.useGlobalConfig && (
              <div className="flex items-center gap-1.5 text-xs text-info">
                <Globe size={12} aria-hidden="true" />
                {t('projectsPage.detail.repository.globalConfig')}
              </div>
            )}
            {project.repository.serverUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{t('projectsPage.detail.repository.serverUrl')}:</span>
                <span className="text-xs font-mono text-text truncate">{project.repository.serverUrl}</span>
              </div>
            )}
            {project.repository.repositoryPath ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{t('projectsPage.detail.repository.path')}:</span>
                <span className="inline-flex items-center gap-1 text-sm font-mono text-text">
                  {project.repository.repositoryPath}
                  <ExternalLink size={10} className="text-text-muted" aria-hidden="true" />
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-warning">
                <AlertTriangle size={12} />
                {t('projectsPage.detail.repository.notConfigured')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{t('projectsPage.detail.repository.multiModule')}:</span>
              <span className="text-sm text-text">
                {t(`projectsPage.multiModule.${project.repository.multiModule}`)}
              </span>
            </div>
            {project.repository.accessTokenMasked && (
              <div className="flex items-center gap-2">
                <Key size={12} className="text-text-muted" aria-hidden="true" />
                <span className="text-xs font-mono text-text-muted">
                  {project.repository.accessTokenMasked}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Documentation info */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text">
              {t('projectsPage.detail.documentation.title')}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{t('projectsPage.detail.documentation.type')}:</span>
              <span className="text-sm text-text">
                {t(`projectsPage.form.docTypes.${project.documentation.type}`)}
              </span>
            </div>
            {project.documentation.type === 'embedded' && (
              <div className="flex items-start gap-1.5 mt-2 p-2.5 rounded-[var(--radius-md)] bg-warning-light border border-warning-border">
                <Shield size={14} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-warning">
                  {t('projectsPage.detail.documentation.securityWarning')}
                </p>
              </div>
            )}
            {project.documentation.type === 'independent' && project.documentation.repositoryPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{t('projectsPage.detail.documentation.repo')}:</span>
                <span className="inline-flex items-center gap-1 text-sm font-mono text-text">
                  {project.documentation.repositoryPath}
                  <ExternalLink size={10} className="text-text-muted" aria-hidden="true" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-3">
          <Blocks size={16} className="text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text">
            {t('projectsPage.detail.architecture.title')}
          </h3>
          <span className="ml-auto text-xs text-text-muted">
            {project.architecture?.modules?.length ?? 0} {t('projectsPage.detail.architecture.modules')}
          </span>
        </div>
        {(!project.architecture?.modules || project.architecture.modules.length === 0) ? (
          <div className="flex items-center gap-2 text-sm text-warning py-2">
            <AlertTriangle size={16} />
            {t('projectsPage.detail.architecture.empty')}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {project.architecture.modules.map((mod) => {
              const bp = blueprints?.find((b) => b.id === mod.blueprintId)
              return (
                <div
                  key={mod.id}
                  className="rounded-[var(--radius-md)] border border-border bg-bg p-3"
                >
                  <p className="text-sm font-medium text-text mb-1">{mod.name}</p>
                  <div className="space-y-1 text-xs text-text-muted">
                    <p>
                      {t('projectsPage.detail.architecture.blueprint')}:{' '}
                      <span className="font-medium text-text">{bp?.name ?? mod.blueprintId}</span>
                    </p>
                    {mod.folderPath && (
                      <p>
                        {t('projectsPage.detail.architecture.folder')}:{' '}
                        <span className="font-mono text-text">{mod.folderPath}</span>
                      </p>
                    )}
                    {mod.repositoryPath && (
                      <p className="flex items-center gap-1">
                        {t('projectsPage.detail.architecture.repository')}:{' '}
                        <span className="font-mono text-text">{mod.repositoryPath}</span>
                        <ExternalLink size={10} className="text-text-muted" aria-hidden="true" />
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Providers */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={16} className="text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text">
            {t('projectsPage.detail.aiProviders.title')}
          </h3>
          <span className="ml-auto text-xs text-text-muted">
            {project.aiProviders.length} {t('projectsPage.detail.aiProviders.count')}
          </span>
        </div>
        {project.aiProviders.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-warning py-2">
            <AlertTriangle size={16} />
            {t('projectsPage.detail.aiProviders.empty')}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {project.aiProviders.map((ap) => (
              <div
                key={ap.id}
                className="rounded-[var(--radius-md)] border border-border bg-bg p-3"
              >
                <p className="text-sm font-medium text-text mb-1">
                  {aiProviderLabels[ap.provider]}
                </p>
                <div className="space-y-1 text-xs text-text-muted">
                  <p>{t('projectsPage.detail.aiProviders.model')}: <span className="font-mono text-text">{ap.defaultModel}</span></p>
                  <p className="flex items-center gap-1">
                    <Key size={10} aria-hidden="true" />
                    <span className="font-mono">{ap.apiKeyMasked}</span>
                  </p>
                  {ap.endpointUrl && (
                    <p className="truncate">{t('projectsPage.detail.aiProviders.endpoint')}: {ap.endpointUrl}</p>
                  )}
                  {(ap.rateLimitTokensPerMin || ap.rateLimitRequestsPerDay) && (
                    <p>
                      {ap.rateLimitTokensPerMin && `${ap.rateLimitTokensPerMin.toLocaleString('pt-BR')} tok/min`}
                      {ap.rateLimitTokensPerMin && ap.rateLimitRequestsPerDay && ' · '}
                      {ap.rateLimitRequestsPerDay && `${ap.rateLimitRequestsPerDay.toLocaleString('pt-BR')} req/dia`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-start gap-1.5 mt-3 p-2.5 rounded-[var(--radius-md)] bg-warning-light border border-warning-border">
          <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-warning">
            {t('projectsPage.detail.aiProviders.costWarning')}
          </p>
        </div>
      </div>

      {/* Members + Meta */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Team */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text">
              {t('projectsPage.detail.team.title')}
            </h3>
            <span className="ml-auto text-xs text-text-muted">
              {project.members.length} {t('projectsPage.detail.team.members')}
            </span>
          </div>
          <div className="space-y-2">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{member.name}</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {member.roles.map((role: MemberRole) => (
                    <span
                      key={role}
                      className="rounded-full bg-bg border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted uppercase"
                    >
                      {t(`projectsPage.detail.team.roles.${role}`)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project meta */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold text-text mb-3">
            {t('projectsPage.detail.meta.title')}
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-text-muted">{t('projectsPage.detail.meta.id')}</dt>
              <dd className="font-mono text-text">{project.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">{t('projectsPage.detail.meta.slug')}</dt>
              <dd className="font-mono text-text">{project.slug}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">{t('projectsPage.detail.meta.tenant')}</dt>
              <dd className="text-text">{project.tenantId}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">{t('projectsPage.detail.meta.createdAt')}</dt>
              <dd className="text-text">{createdDate}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export { ProjectOverview }
export type { ProjectOverviewProps }
