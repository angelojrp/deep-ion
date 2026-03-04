import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Globe, Plus, Trash2, AlertCircle, Check, Loader2 } from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useCreateTenant, useCheckSlug } from '@application/hooks/useTenants'
import { generateSlug, isValidSlug, isValidEmail, isValidNome, isValidNameField } from '@domain/validators/tenant'
import { cn } from '@shared/utils/cn'

function TenantCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateTenant()

  // Form state
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [emailAdmin, setEmailAdmin] = useState('')
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [telefones, setTelefones] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && nome) {
      setSlug(generateSlug(nome))
    }
  }, [nome, slugTouched])

  // Check slug availability
  const { data: slugCheck, isLoading: slugChecking } = useCheckSlug(slug)

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isValidNome(nome)) {
      newErrors.nome = t('tenants.error.update')
    }
    if (!isValidSlug(slug)) {
      newErrors.slug = t('tenants.create.slugHelp')
    }
    if (slugCheck && !slugCheck.available) {
      newErrors.slug = t('tenants.error.slugDuplicate')
    }
    if (!isValidEmail(emailAdmin)) {
      newErrors.emailAdmin = t('tenants.error.create')
    }
    if (!isValidNameField(primeiroNome)) {
      newErrors.primeiroNome = t('tenants.error.update')
    }
    if (!isValidNameField(sobrenome)) {
      newErrors.sobrenome = t('tenants.error.update')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [nome, slug, emailAdmin, primeiroNome, sobrenome, slugCheck, t])

  // Check if form is valid for enabling submit button
  const isFormValid =
    isValidNome(nome) &&
    isValidSlug(slug) &&
    isValidEmail(emailAdmin) &&
    isValidNameField(primeiroNome) &&
    isValidNameField(sobrenome) &&
    (!slugCheck || slugCheck.available)

  // Add phone
  const addPhone = () => {
    setTelefones([...telefones, '+55 '])
  }

  const removePhone = (index: number) => {
    setTelefones(telefones.filter((_, i) => i !== index))
  }

  const updatePhone = (index: number, value: string) => {
    const updated = [...telefones]
    updated[index] = value
    setTelefones(updated)
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    try {
      await createMutation.mutateAsync({
        nome: nome.trim(),
        slug,
        email_admin: emailAdmin.trim(),
        primeiro_nome_admin: primeiroNome.trim(),
        sobrenome_admin: sobrenome.trim(),
        telefones_admin: telefones.filter((t) => t.trim().length > 3),
      })
      navigate('/tenants')
    } catch (err) {
      const error = err as Error & { code?: string }
      if (error.code === 'SLUG_DUPLICADO') {
        setErrors((prev) => ({ ...prev, slug: t('tenants.error.slugDuplicate') }))
      } else {
        setApiError(t('tenants.error.create'))
      }
    }
  }

  return (
    <>
      <Header
        title={t('tenants.create.title')}
        subtitle={t('tenants.create.subtitle')}
      />
      <PageContainer className="max-w-4xl">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/tenants')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('tenants.detail.backToList')}
        </button>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card: Organization data */}
            <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-base font-semibold text-text mb-4">{t('tenants.create.sectionOrg')}</h3>

              {/* Nome */}
              <div className="mb-4">
                <label htmlFor="nome" className="block text-sm font-medium text-text mb-1">
                  {t('tenants.create.nome')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={t('tenants.create.nomePlaceholder')}
                  maxLength={100}
                  aria-required="true"
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-[var(--radius-md)]',
                    'border bg-surface text-text',
                    errors.nome ? 'border-red-500' : 'border-border',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                />
                {errors.nome && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" /> {errors.nome}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="mb-4">
                <label htmlFor="slug" className="block text-sm font-medium text-text mb-1">
                  {t('tenants.create.slug')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }}
                  maxLength={50}
                  aria-required="true"
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-[var(--radius-md)] font-mono',
                    'border bg-surface text-text',
                    errors.slug ? 'border-red-500' : 'border-border',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                />
                <p className="mt-1 text-xs text-text-muted">{t('tenants.create.slugHelp')}</p>

                {/* Slug availability indicator */}
                {slug.length >= 2 && (
                  <div className="mt-1 flex items-center gap-1">
                    {slugChecking && (
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verificando...
                      </span>
                    )}
                    {!slugChecking && slugCheck?.available && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Disponível
                      </span>
                    )}
                    {!slugChecking && slugCheck && !slugCheck.available && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('tenants.error.slugDuplicate')}
                      </span>
                    )}
                  </div>
                )}

                {/* URL Preview */}
                {slug && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted" aria-live="polite">
                    <Globe className="w-3.5 h-3.5" />
                    <span>app.deepion.net/<strong className="text-text">{slug}</strong></span>
                  </div>
                )}

                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" /> {errors.slug}
                  </p>
                )}
              </div>
            </div>

            {/* Card: Admin data */}
            <div className="rounded-[var(--radius-lg)] bg-surface border border-border p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-base font-semibold text-text mb-4">{t('tenants.create.sectionAdmin')}</h3>

              {/* Primeiro nome */}
              <div className="mb-4">
                <label htmlFor="primeiroNome" className="block text-sm font-medium text-text mb-1">
                  {t('tenants.create.primeiroNome')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="primeiroNome"
                  type="text"
                  value={primeiroNome}
                  onChange={(e) => setPrimeiroNome(e.target.value)}
                  placeholder={t('tenants.create.primeiroNomePlaceholder')}
                  maxLength={80}
                  aria-required="true"
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-[var(--radius-md)]',
                    'border bg-surface text-text',
                    errors.primeiroNome ? 'border-red-500' : 'border-border',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                />
                {errors.primeiroNome && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" /> {errors.primeiroNome}
                  </p>
                )}
              </div>

              {/* Sobrenome */}
              <div className="mb-4">
                <label htmlFor="sobrenome" className="block text-sm font-medium text-text mb-1">
                  {t('tenants.create.sobrenome')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="sobrenome"
                  type="text"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  placeholder={t('tenants.create.sobrenomePlaceholder')}
                  maxLength={80}
                  aria-required="true"
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-[var(--radius-md)]',
                    'border bg-surface text-text',
                    errors.sobrenome ? 'border-red-500' : 'border-border',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                />
                {errors.sobrenome && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" /> {errors.sobrenome}
                  </p>
                )}
              </div>

              {/* Email admin */}
              <div className="mb-4">
                <label htmlFor="emailAdmin" className="block text-sm font-medium text-text mb-1">
                  {t('tenants.create.emailAdmin')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="emailAdmin"
                  type="email"
                  value={emailAdmin}
                  onChange={(e) => setEmailAdmin(e.target.value)}
                  placeholder={t('tenants.create.emailAdminPlaceholder')}
                  aria-required="true"
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-[var(--radius-md)]',
                    'border bg-surface text-text',
                    errors.emailAdmin ? 'border-red-500' : 'border-border',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                />
                {errors.emailAdmin && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" /> {errors.emailAdmin}
                  </p>
                )}
              </div>

              {/* Phones */}
              <div>
                <h4 className="text-sm font-medium text-text mb-2">{t('tenants.create.sectionPhones')}</h4>
                <p className="text-xs text-text-muted mb-3">
                  {t('tenants.create.countryCode')}: +55 ({t('common.cancel').toLowerCase().replace('cancelar', 'padrão')})
                </p>
                {telefones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      placeholder={t('tenants.create.telefonePlaceholder')}
                      className={cn(
                        'flex-1 px-3 py-2 text-sm rounded-[var(--radius-md)]',
                        'border border-border bg-surface text-text',
                        'placeholder:text-text-muted',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      aria-label={t('tenants.create.removePhone')}
                      className="p-2 rounded-[var(--radius-md)] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhone}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('tenants.create.addPhone')}
                </button>
              </div>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mt-4 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3" role="alert">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {apiError}
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/tenants')}
              className={cn(
                'px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium',
                'border border-border bg-surface text-text',
                'hover:bg-muted transition-colors',
              )}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!isFormValid || createMutation.isPending}
              className={cn(
                'px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium',
                'bg-primary text-white',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('tenants.create.submitting')}
                </span>
              ) : (
                t('tenants.create.submit')
              )}
            </button>
          </div>
        </form>
      </PageContainer>
    </>
  )
}

export { TenantCreatePage }
