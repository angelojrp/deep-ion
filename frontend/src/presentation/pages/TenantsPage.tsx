import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Building2, AlertCircle, RefreshCw, Search, X } from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { TenantListTable } from '@presentation/components/tenants/TenantListTable'
import { TenantListCards } from '@presentation/components/tenants/TenantListCards'
import { TenantTableSkeleton, TenantCardsSkeleton } from '@presentation/components/tenants/TenantListSkeleton'
import { TenantPagination } from '@presentation/components/tenants/TenantPagination'
import { TenantDeactivateDialog } from '@presentation/components/tenants/TenantDeactivateDialog'
import { useTenants, useDeactivateTenant } from '@application/hooks/useTenants'
import { cn } from '@shared/utils/cn'
import type { TenantSummary } from '@domain/models/tenant'

const PAGE_SIZE = 20

type StatusFilter = 'TODOS' | 'ATIVO' | 'INATIVO'

function TenantsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')
  const [deactivateTarget, setDeactivateTarget] = useState<TenantSummary | null>(null)

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (searchTimeout) clearTimeout(searchTimeout)
      const tid = setTimeout(() => {
        setDebouncedSearch(value)
        setPage(1)
      }, 300)
      setSearchTimeout(tid)
    },
    [searchTimeout],
  )

  // Queries
  const { data, isLoading, isError, refetch } = useTenants({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'TODOS' ? statusFilter : undefined,
  })
  const deactivateMutation = useDeactivateTenant()

  // Handlers
  const handleViewDetails = (tenant: TenantSummary) => {
    navigate(`/tenants/${tenant.tenant_id}`)
  }

  const handleEdit = (tenant: TenantSummary) => {
    navigate(`/tenants/${tenant.tenant_id}`)
  }

  const handleDeactivate = (tenant: TenantSummary) => {
    setDeactivateTarget(tenant)
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return
    await deactivateMutation.mutateAsync(deactivateTarget.tenant_id)
    setDeactivateTarget(null)
  }

  const handleStatusFilter = (filter: StatusFilter) => {
    setStatusFilter(filter)
    setPage(1)
  }

  const isEmpty = data && data.total === 0 && !debouncedSearch && statusFilter === 'TODOS'
  const isSearchEmpty = data && data.items.length === 0 && (debouncedSearch || statusFilter !== 'TODOS')

  return (
    <>
      <Header
        title={t('tenants.pageTitle')}
        subtitle={t('tenants.pageSubtitle')}
      />
      <PageContainer>
        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('tenants.searchPlaceholder')}
              className={cn(
                'w-full pl-9 pr-8 py-2 text-sm rounded-[var(--radius-md)]',
                'border border-border bg-surface text-text',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              )}
              aria-label={t('tenants.searchPlaceholder')}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New tenant button (desktop) */}
          <button
            type="button"
            onClick={() => navigate('/tenants/new')}
            className={cn(
              'hidden sm:flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]',
              'bg-primary text-white text-sm font-medium',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <Plus className="w-4 h-4" />
            {t('tenants.newTenant')}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4">
          {(['TODOS', 'ATIVO', 'INATIVO'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleStatusFilter(filter)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                statusFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-muted text-text-secondary hover:bg-muted/80',
              )}
            >
              {filter === 'TODOS' && t('tenants.filterAll')}
              {filter === 'ATIVO' && t('tenants.filterActive')}
              {filter === 'INATIVO' && t('tenants.filterInactive')}
            </button>
          ))}

          {/* Summary bar */}
          {data && (
            <span className="text-xs text-text-muted ml-auto hidden sm:inline">
              {t('tenants.summary.total', { count: data.total })}
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <>
            <div className="hidden lg:block">
              <TenantTableSkeleton />
            </div>
            <div className="lg:hidden">
              <TenantCardsSkeleton />
            </div>
          </>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-[var(--radius-lg)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">{t('tenants.error.load')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Empty state (zero tenants) */}
        {isEmpty && (
          <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-12 text-center shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <Building2 className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">{t('tenants.empty.title')}</h3>
            <p className="text-sm text-text-secondary mb-6">{t('tenants.empty.description')}</p>
            <button
              type="button"
              onClick={() => navigate('/tenants/new')}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)]',
                'bg-primary text-white text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
              )}
            >
              <Plus className="w-4 h-4" />
              {t('tenants.provisionFirst')}
            </button>
          </div>
        )}

        {/* Search empty state */}
        {isSearchEmpty && (
          <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-12 text-center shadow-[var(--shadow-card)]">
            <Search className="w-8 h-8 mx-auto mb-3 text-text-muted" />
            <p className="text-sm text-text-secondary">
              {debouncedSearch
                ? t('tenants.empty.noResults', { term: debouncedSearch })
                : t('common.noResults')}
            </p>
          </div>
        )}

        {/* Data state */}
        {data && data.items.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <TenantListTable
                tenants={data.items}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
              />
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden">
              <TenantListCards
                tenants={data.items}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
              />
            </div>

            {/* Pagination */}
            <TenantPagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          </>
        )}

        {/* Mobile FAB */}
        <button
          type="button"
          onClick={() => navigate('/tenants/new')}
          className={cn(
            'fixed right-4 bottom-20 sm:hidden z-30',
            'flex items-center justify-center w-14 h-14 rounded-full',
            'bg-primary text-white shadow-lg',
            'hover:bg-primary/90 transition-colors',
          )}
          aria-label={t('tenants.newTenant')}
        >
          <Plus className="w-6 h-6" />
        </button>
      </PageContainer>

      {/* Deactivation dialog (Tela 03) */}
      <TenantDeactivateDialog
        open={!!deactivateTarget}
        tenantName={deactivateTarget?.nome ?? ''}
        membersCount={deactivateTarget?.membros_ativos ?? 0}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </>
  )
}

export { TenantsPage }
