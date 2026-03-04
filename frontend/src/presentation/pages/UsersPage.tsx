import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  UserPlus,
  Mail,
  MailCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useUsers, useAvailableRoles, useCreateUser, useResendInvite, useDeleteUser } from '@application/hooks/useUsers'
import type { UserRole, UserSummary } from '@domain/models/user'

/* ── Role badge color mapping ── */
const roleBadgeColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  po: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  architect: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'tech-lead': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  developer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  qa: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  devops: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'business-analyst': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'requirements-analyst': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'ux-analyst': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

/* ── Invite status config ── */
function getInviteStatusConfig(status: string, t: (key: string) => string) {
  switch (status) {
    case 'accepted':
      return { icon: CheckCircle, label: t('usersPage.inviteStatus.accepted'), className: 'text-green-600' }
    case 'expired':
      return { icon: XCircle, label: t('usersPage.inviteStatus.expired'), className: 'text-red-600' }
    default:
      return { icon: Clock, label: t('usersPage.inviteStatus.pending'), className: 'text-yellow-600' }
  }
}

/* ══════════════════════════════════════════════
 *  Create User Dialog
 * ══════════════════════════════════════════════ */
interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
}

function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const { t } = useTranslation()
  const { data: roles } = useAvailableRoles()
  const createUserMutation = useCreateUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setName('')
    setEmail('')
    setSelectedRoles([])
    setErrors({})
    setSuccessMessage(null)
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const toggleRole = useCallback((role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }, [])

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = t('usersPage.form.errors.nameRequired')
    if (!email.trim()) newErrors.email = t('usersPage.form.errors.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t('usersPage.form.errors.emailInvalid')
    if (selectedRoles.length === 0) newErrors.roles = t('usersPage.form.errors.rolesRequired')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, email, selectedRoles, t])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate()) return

      try {
        await createUserMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          roles: selectedRoles,
        })
        setSuccessMessage(t('usersPage.form.successMessage', { email: email.trim() }))
        setTimeout(() => {
          handleClose()
        }, 2500)
      } catch {
        setErrors({ submit: t('usersPage.form.errors.submitFailed') })
      }
    },
    [validate, createUserMutation, name, email, selectedRoles, t, handleClose],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label={t('usersPage.form.createTitle')}>
      <div className="mx-4 w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">{t('usersPage.form.createTitle')}</h2>
            <p className="text-sm text-text-muted">{t('usersPage.form.createSubtitle')}</p>
          </div>
          <button onClick={handleClose} className="rounded-[var(--radius-md)] p-1.5 hover:bg-muted" aria-label={t('common.close')} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success state */}
        {successMessage && (
          <div className="rounded-[var(--radius-md)] border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <MailCheck className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">{t('usersPage.form.inviteSent')}</p>
                <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-text">
                {t('usersPage.form.name')}
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('usersPage.form.namePlaceholder')}
                className={cn(
                  'w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  errors.name ? 'border-error' : 'border-border',
                )}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="mt-1 text-xs text-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="user-email" className="mb-1.5 block text-sm font-medium text-text">
                {t('usersPage.form.email')}
              </label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('usersPage.form.emailPlaceholder')}
                className={cn(
                  'w-full rounded-[var(--radius-md)] border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  errors.email ? 'border-error' : 'border-border',
                )}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-xs text-error">{errors.email}</p>}
            </div>

            {/* Roles */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                {t('usersPage.form.roles')}
              </label>
              <p className="mb-2 text-xs text-text-muted">{t('usersPage.form.rolesHelp')}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('usersPage.form.roles')}>
                {(roles ?? []).map((role) => {
                  const isSelected = selectedRoles.includes(role.value)
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        isSelected
                          ? cn(roleBadgeColors[role.value], 'border-current')
                          : 'border-border bg-muted/50 text-text-muted hover:bg-muted',
                      )}
                      aria-pressed={isSelected}
                    >
                      {role.label}
                    </button>
                  )
                })}
              </div>
              {errors.roles && <p className="mt-1 text-xs text-error">{errors.roles}</p>}
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-primary/5 p-3 text-xs text-text-muted">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>{t('usersPage.form.inviteInfo')}</p>
            </div>

            {errors.submit && <p className="text-xs text-error">{errors.submit}</p>}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleClose} className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-text hover:bg-muted">
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {createUserMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {t('usersPage.form.sendInvite')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
 *  Delete Confirmation Dialog
 * ══════════════════════════════════════════════ */
interface DeleteDialogProps {
  user: UserSummary | null
  onClose: () => void
}

function DeleteDialog({ user, onClose }: DeleteDialogProps) {
  const { t } = useTranslation()
  const deleteUserMutation = useDeleteUser()

  const handleDelete = useCallback(async () => {
    if (!user) return
    try {
      await deleteUserMutation.mutateAsync(user.id)
      onClose()
    } catch {
      // error handled by mutation state
    }
  }, [user, deleteUserMutation, onClose])

  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label={t('usersPage.deleteDialog.title')}>
      <div className="mx-4 w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text">{t('usersPage.deleteDialog.title')}</h2>
        <p className="mt-2 text-sm text-text-muted">
          {t('usersPage.deleteDialog.message', { name: user.name })}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-text hover:bg-muted">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
 *  Users Page
 * ══════════════════════════════════════════════ */
function UsersPage() {
  const { t } = useTranslation()
  const { data: users, isLoading, isError, refetch } = useUsers()
  const resendInviteMutation = useResendInvite()

  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)

  const filteredUsers = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleResendInvite = useCallback(
    async (user: UserSummary) => {
      try {
        await resendInviteMutation.mutateAsync(user.id)
        setResendSuccess(user.email)
        setTimeout(() => setResendSuccess(null), 3000)
      } catch {
        // error handled by mutation
      }
    },
    [resendInviteMutation],
  )

  return (
    <>
      <Header
        title={t('usersPage.title')}
        subtitle={t('usersPage.subtitle')}
      />
      <PageContainer>
        {/* Top actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('usersPage.searchPlaceholder')}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('usersPage.searchPlaceholder')}
            />
          </div>
          {/* New user button */}
          <button
            type="button"
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <UserPlus className="h-4 w-4" />
            {t('usersPage.newUser')}
          </button>
        </div>

        {/* Resend success toast */}
        {resendSuccess && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            <div className="flex items-center gap-2">
              <MailCheck className="h-4 w-4" />
              {t('usersPage.resendSuccess', { email: resendSuccess })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-text-muted">{t('common.loading')}</span>
            </div>
          </div>
        )}

        {/* Error state */}
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
        {!isLoading && !isError && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="mb-4 h-12 w-12 text-text-muted/50" />
            <p className="text-sm text-text-muted">
              {search
                ? t('common.noResults')
                : t('usersPage.emptyState')}
            </p>
          </div>
        )}

        {/* Users table */}
        {!isLoading && !isError && filteredUsers.length > 0 && (
          <>
            <p className="mb-3 text-xs text-text-muted">
              {t('usersPage.showing', { count: filteredUsers.length, total: users?.length ?? 0 })}
            </p>

            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-text-muted">{t('usersPage.table.user')}</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">{t('usersPage.table.roles')}</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">{t('usersPage.table.status')}</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">{t('usersPage.table.invite')}</th>
                    <th className="px-4 py-3 text-right font-medium text-text-muted">{t('usersPage.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const inviteConfig = getInviteStatusConfig(user.inviteStatus, t)
                    const InviteIcon = inviteConfig.icon
                    return (
                      <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                        {/* User info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {user.photoUrl ? (
                                <img src={user.photoUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                              ) : (
                                user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-text">{user.name}</p>
                              <p className="text-xs text-text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-xs font-medium',
                                  roleBadgeColors[role] ?? 'bg-gray-100 text-gray-700',
                                )}
                              >
                                {t(`usersPage.roles.${role}`)}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              user.status === 'active' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                              user.status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                              user.status === 'inactive' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                            )}
                          >
                            {t(`usersPage.status.${user.status}`)}
                          </span>
                        </td>

                        {/* Invite status */}
                        <td className="px-4 py-3">
                          <div className={cn('flex items-center gap-1.5 text-xs', inviteConfig.className)}>
                            <InviteIcon className="h-3.5 w-3.5" />
                            {inviteConfig.label}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {user.inviteStatus === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleResendInvite(user)}
                                disabled={resendInviteMutation.isPending}
                                className="rounded-[var(--radius-md)] p-1.5 text-text-muted hover:bg-muted hover:text-primary"
                                title={t('usersPage.resendInvite')}
                                aria-label={t('usersPage.resendInvite')}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="rounded-[var(--radius-md)] p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              title={t('common.delete')}
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Dialogs */}
        <CreateUserDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
        <DeleteDialog user={deleteTarget} onClose={() => setDeleteTarget(null)} />
      </PageContainer>
    </>
  )
}

export { UsersPage }
