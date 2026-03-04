import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Power } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import type { TenantSummary } from '@domain/models/tenant'

interface TenantListTableProps {
  tenants: TenantSummary[]
  onViewDetails: (tenant: TenantSummary) => void
  onEdit: (tenant: TenantSummary) => void
  onDeactivate: (tenant: TenantSummary) => void
}

/** Gera iniciais e cor determinística para o avatar */
function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
]

function getAvatarColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function TenantListTable({ tenants, onViewDetails, onEdit, onDeactivate }: TenantListTableProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-4 py-3 font-medium text-text-secondary">{t('tenants.columns.tenant')}</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary hidden xl:table-cell">{t('tenants.columns.tenantId')}</th>
            <th className="text-center px-4 py-3 font-medium text-text-secondary">{t('tenants.columns.status')}</th>
            <th className="text-center px-4 py-3 font-medium text-text-secondary hidden md:table-cell">{t('tenants.columns.members')}</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">{t('tenants.columns.createdAt')}</th>
            <th className="text-right px-4 py-3 font-medium text-text-secondary">{t('tenants.columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr
              key={tenant.tenant_id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              {/* Tenant (avatar + name + slug) */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex items-center justify-center shrink-0',
                      'w-9 h-9 rounded-full text-white text-xs font-bold',
                      getAvatarColor(tenant.slug),
                    )}
                    aria-hidden="true"
                  >
                    {getInitials(tenant.nome)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">{tenant.nome}</p>
                    <p className="text-xs text-text-muted truncate">{tenant.slug}</p>
                  </div>
                </div>
              </td>

              {/* ID */}
              <td className="px-4 py-3 hidden xl:table-cell">
                <code className="text-xs text-text-muted font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                  {tenant.tenant_id.slice(0, 12)}…
                </code>
              </td>

              {/* Status badge */}
              <td className="px-4 py-3 text-center">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    tenant.status === 'ATIVO'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  )}
                >
                  {t(`tenants.status.${tenant.status}`)}
                </span>
              </td>

              {/* Members */}
              <td className="px-4 py-3 text-center hidden md:table-cell">
                <span className="text-text-secondary">{tenant.membros_ativos}</span>
              </td>

              {/* Created at */}
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-text-secondary text-xs">{formatDate(tenant.criado_em)}</span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onViewDetails(tenant)}
                    title={t('tenants.actions.viewDetails')}
                    aria-label={t('tenants.actions.viewDetails')}
                    className="p-1.5 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(tenant)}
                    title={t('tenants.actions.edit')}
                    aria-label={t('tenants.actions.edit')}
                    className="p-1.5 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {tenant.status === 'ATIVO' && (
                    <button
                      type="button"
                      onClick={() => onDeactivate(tenant)}
                      title={t('tenants.actions.deactivate')}
                      aria-label={t('tenants.actions.deactivate')}
                      className="p-1.5 rounded-[var(--radius-md)] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

TenantListTable.displayName = 'TenantListTable'

export { TenantListTable }
export type { TenantListTableProps }
