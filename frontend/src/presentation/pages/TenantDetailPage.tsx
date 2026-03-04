import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Lock,
  Users,
  Info,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Save,
  Copy,
  Check,
} from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { TenantDeactivateDialog } from '@presentation/components/tenants/TenantDeactivateDialog'
import {
  useTenant,
  useUpdateTenant,
  useDeactivateTenant,
  useReactivateTenant,
} from '@application/hooks/useTenants'
import { cn } from '@shared/utils/cn'

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

function TenantDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Queries & mutations
  const { data: tenant, isLoading, isError, refetch } = useTenant(id ?? '')
  const updateMutation = useUpdateTenant()
  const deactivateMutation = useDeactivateTenant()
  const reactivateMutation = useReactivateTenant()

  // Edit state
  const [editedNome, setEditedNome] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Dialog state
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)

  // Copy state
  const [copied, setCopied] = useState(false)

  // Toggle state (optimistic)
  const [toggleStatus, setToggleStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO')

  // Sync from tenant data
  useEffect(() => {
    if (tenant) {
      setEditedNome(tenant.nome)
      setToggleStatus(tenant.status)
      setHasChanges(false)
    }
  }, [tenant])

  const handleNomeChange = (value: string) => {
    setEditedNome(value)
    setHasChanges(value !== tenant?.nome)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!tenant || !hasChanges) return
    setSaveError(null)
    try {
      await updateMutation.mutateAsync({
        id: tenant.tenant_id,
        payload: { nome: editedNome.trim() },
      })
      setHasChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError(t('tenants.error.update'))
    }
  }

  const handleToggle = () => {
    if (!tenant) return

    if (tenant.status === 'ATIVO' || toggleStatus === 'ATIVO') {
      // ATIVO → INATIVO: show confirmation dialog
      setShowDeactivateDialog(true)
    } else {
      // INATIVO → ATIVO: reactivate directly (non-destructive)
      handleReactivate()
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!tenant) return
    await deactivateMutation.mutateAsync(tenant.tenant_id)
    setToggleStatus('INATIVO')
    setShowDeactivateDialog(false)
    refetch()
  }

  const handleCancelDeactivate = () => {
    setShowDeactivateDialog(false)
    // Toggle returns to ON (ATIVO)
    setToggleStatus(tenant?.status ?? 'ATIVO')
  }

  const handleReactivate = async () => {
    if (!tenant) return
    try {
      await reactivateMutation.mutateAsync(tenant.tenant_id)
      setToggleStatus('ATIVO')
      refetch()
    } catch {
      // Revert toggle
      setToggleStatus('INATIVO')
    }
  }

  const handleCopyId = async () => {
    if (!tenant) return
    await navigator.clipboard.writeText(tenant.tenant_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading
  if (isLoading) {
    return (
      <>
        <Header title={t('tenants.detail.title')} />
        <PageContainer className="max-w-5xl">
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
          </div>
        </PageContainer>
      </>
    )
  }

  // Error
  if (isError || !tenant) {
    return (
      <>
        <Header title={t('tenants.detail.title')} />
        <PageContainer className="max-w-5xl">
          <div className="rounded-[var(--radius-lg)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">{t('tenants.error.load')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-[var(--radius-md)] bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </PageContainer>
      </>
    )
  }

  const isActive = toggleStatus === 'ATIVO'

  return (
    <>
      <Header
        title={t('tenants.detail.title')}
        subtitle={tenant.nome}
      />
      <PageContainer className="max-w-5xl">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/tenants')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('tenants.detail.backToList')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Identification + Status */}
          <div className="space-y-6">
            {/* Identification card */}
            <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-base font-semibold text-text mb-4">
                {t('tenants.detail.sectionIdentification')}
              </h3>

              {/* Tenant ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-1">
                  {t('tenants.detail.tenantId')}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 text-sm font-mono bg-muted/50 rounded-[var(--radius-md)] text-text-secondary border border-border truncate">
                    {tenant.tenant_id}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-2 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-muted transition-colors shrink-0"
                    aria-label="Copiar ID"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-text-muted flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {t('tenants.detail.tenantIdHelp')}
                </p>
              </div>

              {/* Nome (editable) */}
              <div className="mb-4">
                <label htmlFor="detailNome" className="block text-sm font-medium text-text mb-1">
                  {t('tenants.detail.nome')}
                </label>
                <input
                  id="detailNome"
                  type="text"
                  value={editedNome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  maxLength={100}
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-[var(--radius-md)]',
                    'border border-border bg-surface text-text',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                />
              </div>

              {/* Slug (readonly) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-1">
                  {t('tenants.detail.slug')}
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 text-sm rounded-[var(--radius-md)] border border-border text-text-secondary">
                  <Lock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="font-mono">{tenant.slug}</span>
                </div>
                <p className="mt-1 text-xs text-text-muted">{t('tenants.detail.slugReadonly')}</p>
              </div>

              {/* Email admin */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-1">
                  {t('tenants.detail.emailAdmin')}
                </label>
                <p className="text-sm text-text-secondary">{tenant.email_admin}</p>
              </div>

              {/* Created at */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  {t('tenants.detail.createdAt')}
                </label>
                <p className="text-sm text-text-secondary">{formatDate(tenant.criado_em)}</p>
              </div>
            </div>

            {/* Status card */}
            <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-base font-semibold text-text mb-4">
                {t('tenants.detail.sectionStatus')}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">{t('tenants.detail.statusLabel')}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {isActive ? t('tenants.detail.deactivateHelp') : t('tenants.detail.reactivateHelp')}
                  </p>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  aria-label={t('tenants.detail.statusLabel')}
                  onClick={handleToggle}
                  disabled={deactivateMutation.isPending || reactivateMutation.isPending}
                  className={cn(
                    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200',
                      isActive ? 'translate-x-6' : 'translate-x-1',
                    )}
                  />
                </button>
              </div>

              {/* Status badge */}
              <div className="mt-3">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  )}
                >
                  {isActive ? t('tenants.detail.statusActive') : t('tenants.detail.statusInactive')}
                </span>
              </div>
            </div>
          </div>

          {/* Right column: Members + Danger Zone */}
          <div className="space-y-6">
            {/* Members card */}
            <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-base font-semibold text-text mb-4">
                {t('tenants.detail.sectionMembers')}
              </h3>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-[var(--radius-md)]">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{tenant.membros_ativos}</p>
                  <p className="text-xs text-text-muted">
                    {t('tenants.detail.membersCount', { count: tenant.membros_ativos })}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-text-muted flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {t('tenants.detail.membersInfo')}
              </p>
            </div>

            {/* Infrastructure info */}
            <div className="rounded-[var(--radius-lg)] bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {t('tenants.detail.infrastructure')}
              </p>
            </div>

            {/* Danger zone */}
            {isActive && (
              <div className="rounded-[var(--radius-lg)] bg-surface border-2 border-red-200 dark:border-red-800 p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">
                  {t('tenants.detail.sectionDangerZone')}
                </h3>
                <p className="text-xs text-text-secondary mb-4">
                  {t('tenants.detail.deactivateWarning')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeactivateDialog(true)}
                  disabled={deactivateMutation.isPending}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium',
                    'bg-red-600 text-white hover:bg-red-700 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {t('tenants.detail.deactivateTenant')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save bar */}
        {(hasChanges || saveSuccess || saveError) && (
          <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-surface border-t border-border shadow-lg z-20">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {saveSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  {t('tenants.success.updated')}
                </p>
              )}
              {saveError && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {saveError}
                </p>
              )}
              {!saveSuccess && !saveError && <div />}
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium',
                  'bg-primary text-white hover:bg-primary/90 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('tenants.detail.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('tenants.detail.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </PageContainer>

      {/* Deactivation dialog (Tela 03) */}
      <TenantDeactivateDialog
        open={showDeactivateDialog}
        tenantName={tenant.nome}
        membersCount={tenant.membros_ativos}
        onConfirm={handleConfirmDeactivate}
        onCancel={handleCancelDeactivate}
      />
    </>
  )
}

export { TenantDetailPage }
