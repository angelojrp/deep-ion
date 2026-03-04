import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Power, Users } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import type { TenantSummary } from '@domain/models/tenant'

interface TenantListCardsProps {
  tenants: TenantSummary[]
  onViewDetails: (tenant: TenantSummary) => void
  onEdit: (tenant: TenantSummary) => void
  onDeactivate: (tenant: TenantSummary) => void
}

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

function TenantListCards({ tenants, onViewDetails, onEdit, onDeactivate }: TenantListCardsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-3">
      {tenants.map((tenant) => (
        <div
          key={tenant.tenant_id}
          className="rounded-[var(--radius-lg)] bg-surface border border-border p-4 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={cn(
                'flex items-center justify-center shrink-0',
                'w-10 h-10 rounded-full text-white text-sm font-bold',
                getAvatarColor(tenant.slug),
              )}
              aria-hidden="true"
            >
              {getInitials(tenant.nome)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-text truncate">{tenant.nome}</p>
                  <p className="text-xs text-text-muted">{tenant.slug}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                    tenant.status === 'ATIVO'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  )}
                >
                  {t(`tenants.status.${tenant.status}`)}
                </span>
              </div>

              {/* Members count */}
              <div className="flex items-center gap-1 mt-2 text-xs text-text-secondary">
                <Users className="w-3.5 h-3.5" />
                <span>{t('tenants.detail.membersCount', { count: tenant.membros_ativos })}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => onViewDetails(tenant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:text-text hover:bg-muted transition-colors"
                  aria-label={t('tenants.actions.viewDetails')}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {t('tenants.actions.viewDetails')}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(tenant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:text-text hover:bg-muted transition-colors"
                  aria-label={t('tenants.actions.edit')}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t('tenants.actions.edit')}
                </button>
                {tenant.status === 'ATIVO' && (
                  <button
                    type="button"
                    onClick={() => onDeactivate(tenant)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                    aria-label={t('tenants.actions.deactivate')}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {t('tenants.actions.deactivate')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

TenantListCards.displayName = 'TenantListCards'

export { TenantListCards }
export type { TenantListCardsProps }
