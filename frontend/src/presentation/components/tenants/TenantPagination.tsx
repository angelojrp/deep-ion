import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@shared/utils/cn'

interface TenantPaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

function TenantPagination({ page, totalPages, total, pageSize, onPageChange }: TenantPaginationProps) {
  const { t } = useTranslation()

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-xs text-text-muted hidden sm:block">
        {t('tenants.pagination.showing', { from, to, total })}
      </p>
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('tenants.pagination.previous')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium',
            'border border-border bg-surface text-text',
            'hover:bg-muted transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t('tenants.pagination.previous')}
        </button>
        <span className="text-xs text-text-secondary px-2">
          {t('tenants.pagination.page', { page, totalPages })}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t('tenants.pagination.next')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium',
            'border border-border bg-surface text-text',
            'hover:bg-muted transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          {t('tenants.pagination.next')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

TenantPagination.displayName = 'TenantPagination'

export { TenantPagination }
export type { TenantPaginationProps }
