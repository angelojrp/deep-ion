import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Copy,
  Save,
  Upload,
  Bot,
  FileText,
  History,
  GitBranch,
  AlertTriangle,
} from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import {
  useBlueprintsManagement,
  useCloneBlueprint,
  useCreateBlueprint,
  useUpdateBlueprint,
} from '@application/hooks/useBlueprintsManagement'
import { cn } from '@shared/utils/cn'
import type {
  Blueprint,
  BlueprintCategory,
  BlueprintCreationMode,
} from '@domain/models/blueprint'

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function createAssistantReply(input: string, t: (key: string) => string): string {
  if (input.toLowerCase().includes('categoria')) {
    return t('blueprintsPage.assistant.helpCategory')
  }
  if (input.toLowerCase().includes('vers')) {
    return t('blueprintsPage.assistant.helpVersioning')
  }
  return t('blueprintsPage.assistant.defaultReply')
}

function BlueprintsPage() {
  const { t } = useTranslation()
  const { data: blueprints, isLoading, isError, refetch } = useBlueprintsManagement()
  const createMutation = useCreateBlueprint()
  const updateMutation = useUpdateBlueprint()
  const cloneMutation = useCloneBlueprint()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<BlueprintCategory>('frontend')
  const [creationMode, setCreationMode] = useState<BlueprintCreationMode>('manual')
  const [manualYaml, setManualYaml] = useState('blueprintName: novo-blueprint\n')
  const [assistantContext, setAssistantContext] = useState('')
  const [cloneSourceId, setCloneSourceId] = useState('')
  const [publishNewVersion, setPublishNewVersion] = useState(false)
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedBlueprint = useMemo(
    () => blueprints?.find((item) => item.id === selectedId) ?? null,
    [blueprints, selectedId],
  )

  const categories: BlueprintCategory[] = ['backend', 'frontend', 'batch', 'fullstack']

  const resetForm = useCallback(() => {
    setSelectedId(null)
    setName('')
    setDescription('')
    setCategory('frontend')
    setCreationMode('manual')
    setManualYaml('blueprintName: novo-blueprint\n')
    setAssistantContext('')
    setCloneSourceId('')
    setPublishNewVersion(false)
    setAssistantInput('')
    setAssistantMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t('blueprintsPage.assistant.welcome'),
      },
    ])
    setErrors({})
  }, [t])

  useEffect(() => {
    if (!selectedBlueprint) return

    setName(selectedBlueprint.name)
    setDescription(selectedBlueprint.description)
    setCategory(selectedBlueprint.category)
    setCreationMode('manual')
    setManualYaml(selectedBlueprint.manualYaml)
    setAssistantContext('')
    setPublishNewVersion(false)
    setAssistantMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t('blueprintsPage.assistant.editWelcome'),
      },
    ])
    setErrors({})
  }, [selectedBlueprint, t])

  useEffect(() => {
    if (!selectedId && !isLoading) {
      resetForm()
    }
  }, [selectedId, isLoading, resetForm])

  const validateForm = useCallback((): boolean => {
    const formErrors: Record<string, string> = {}
    if (!name.trim()) formErrors.name = t('blueprintsPage.form.errors.nameRequired')
    if (!description.trim()) formErrors.description = t('blueprintsPage.form.errors.descriptionRequired')
    if (!category) formErrors.category = t('blueprintsPage.form.errors.categoryRequired')
    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }, [name, description, category, t])

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (!validateForm()) return

      if (selectedBlueprint) {
        updateMutation.mutate(
          {
            id: selectedBlueprint.id,
            payload: {
              name,
              description,
              category,
              editMode: creationMode,
              manualYaml,
              assistantContext,
              publishNewVersion,
            },
          },
          {
            onSuccess: () => {
              setPublishNewVersion(false)
            },
          },
        )
        return
      }

      createMutation.mutate(
        {
          name,
          description,
          category,
          creationMode,
          manualYaml,
          assistantContext,
          cloneSourceId: cloneSourceId || undefined,
        },
        {
          onSuccess: (created) => {
            setSelectedId(created.id)
          },
        },
      )
    },
    [
      validateForm,
      selectedBlueprint,
      updateMutation,
      name,
      description,
      category,
      creationMode,
      manualYaml,
      assistantContext,
      publishNewVersion,
      createMutation,
      cloneSourceId,
    ],
  )

  const handleClone = useCallback(
    (blueprintId: string) => {
      cloneMutation.mutate(blueprintId)
    },
    [cloneMutation],
  )

  const handleYamlUpload = useCallback(
    (file: File | null) => {
      if (!file) return
      file.text().then((content) => {
        setManualYaml(content)
      })
    },
    [],
  )

  const handleAssistantSend = useCallback(() => {
    if (!assistantInput.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: assistantInput,
    }
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: createAssistantReply(assistantInput, t),
    }

    setAssistantContext((prev) => `${prev}\n${assistantInput}`.trim())
    setAssistantMessages((prev) => [...prev, userMessage, assistantMessage])
    setAssistantInput('')
  }, [assistantInput, t])

  return (
    <>
      <Header
        title={t('blueprintsPage.title')}
        subtitle={t('blueprintsPage.subtitle')}
      />
      <PageContainer className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <section className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">{t('blueprintsPage.list.title')}</h2>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg"
              aria-label={t('blueprintsPage.list.newBlueprint')}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('blueprintsPage.list.newBlueprint')}
            </button>
          </div>

          {isLoading && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">{t('common.loading')}</div>
          )}

          {isError && (
            <div className="space-y-3 px-4 py-10 text-center">
              <p className="text-sm text-error">{t('common.error')}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-[var(--radius-md)] bg-primary px-3 py-2 text-xs font-medium text-white"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          <ul className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto p-3" aria-label={t('blueprintsPage.list.title')}>
            {blueprints?.map((item: Blueprint) => (
              <li
                key={item.id}
                className={cn(
                  'rounded-[var(--radius-md)] border border-border p-3',
                  selectedId === item.id && 'border-primary bg-primary/5',
                )}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedId(item.id)}
                  aria-label={t('blueprintsPage.list.selectBlueprint', { name: item.name })}
                >
                  <p className="text-sm font-semibold text-text">{item.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                    <span>{t(`blueprintsPage.categories.${item.category}`)}</span>
                    <span>{item.currentVersion}</span>
                  </div>
                </button>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleClone(item.id)}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-bg"
                    aria-label={t('blueprintsPage.list.cloneBlueprint')}
                  >
                    <Copy className="h-3 w-3" />
                    {t('blueprintsPage.list.cloneBlueprint')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text">
                  {selectedBlueprint
                    ? t('blueprintsPage.form.editTitle')
                    : t('blueprintsPage.form.createTitle')}
                </h2>
                <p className="mt-1 text-xs text-text-muted">{t('blueprintsPage.form.subtitle')}</p>
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {selectedBlueprint ? t('common.save') : t('common.create')}
              </button>
            </div>

            {!selectedBlueprint && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary" htmlFor="clone-source">
                  {t('blueprintsPage.form.cloneFromLabel')}
                </label>
                <select
                  id="clone-source"
                  value={cloneSourceId}
                  onChange={(event) => setCloneSourceId(event.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">{t('blueprintsPage.form.cloneFromPlaceholder')}</option>
                  {blueprints?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary" htmlFor="blueprint-name">
                  {t('blueprintsPage.form.name')} *
                </label>
                <input
                  id="blueprint-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={t('blueprintsPage.form.namePlaceholder')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-error">{errors.name}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary" htmlFor="blueprint-description">
                  {t('blueprintsPage.form.description')} *
                </label>
                <textarea
                  id="blueprint-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={t('blueprintsPage.form.descriptionPlaceholder')}
                  aria-invalid={!!errors.description}
                />
                {errors.description && <p className="text-xs text-error">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary" htmlFor="blueprint-category">
                  {t('blueprintsPage.form.category')} *
                </label>
                <select
                  id="blueprint-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as BlueprintCategory)}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-invalid={!!errors.category}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {t(`blueprintsPage.categories.${item}`)}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-error">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-text-secondary">{t('blueprintsPage.form.creationType')}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCreationMode('manual')}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium',
                      creationMode === 'manual'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:bg-bg',
                    )}
                    aria-label={t('blueprintsPage.form.modeManual')}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {t('blueprintsPage.form.modeManual')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationMode('assisted')}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium',
                      creationMode === 'assisted'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:bg-bg',
                    )}
                    aria-label={t('blueprintsPage.form.modeAssisted')}
                  >
                    <Bot className="h-3.5 w-3.5" />
                    {t('blueprintsPage.form.modeAssisted')}
                  </button>
                </div>
              </div>
            </div>

            {selectedBlueprint && (
              <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <p className="text-xs text-text-secondary">{t('blueprintsPage.form.editModeInfo')}</p>
              </div>
            )}

            {creationMode === 'manual' ? (
              <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-bg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-text-secondary">{t('blueprintsPage.form.manualEditor')}</p>
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-surface">
                    <Upload className="h-3 w-3" />
                    {t('blueprintsPage.form.uploadYaml')}
                    <input
                      type="file"
                      accept=".yaml,.yml,.txt"
                      className="hidden"
                      onChange={(event) => handleYamlUpload(event.target.files?.[0] ?? null)}
                      aria-label={t('blueprintsPage.form.uploadYaml')}
                    />
                  </label>
                </div>

                <textarea
                  value={manualYaml}
                  onChange={(event) => setManualYaml(event.target.value)}
                  rows={10}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 font-mono text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={t('blueprintsPage.form.manualEditor')}
                />
              </div>
            ) : (
              <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-bg p-4">
                <p className="text-xs font-medium text-text-secondary">{t('blueprintsPage.form.assistantChatTitle')}</p>

                <div className="max-h-56 space-y-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface p-3" role="log" aria-live="polite">
                  {assistantMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-xs',
                        message.role === 'assistant'
                          ? 'bg-primary/10 text-text'
                          : 'ml-auto bg-border text-text-secondary',
                      )}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={assistantInput}
                    onChange={(event) => setAssistantInput(event.target.value)}
                    className="flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={t('blueprintsPage.assistant.placeholder')}
                    aria-label={t('blueprintsPage.assistant.placeholder')}
                  />
                  <button
                    type="button"
                    onClick={handleAssistantSend}
                    className="rounded-[var(--radius-md)] bg-primary px-3 py-2 text-xs font-medium text-white"
                    aria-label={t('blueprintsPage.assistant.send')}
                  >
                    {t('blueprintsPage.assistant.send')}
                  </button>
                </div>
              </div>
            )}

            {selectedBlueprint && (
              <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={publishNewVersion}
                  onChange={(event) => setPublishNewVersion(event.target.checked)}
                />
                {t('blueprintsPage.form.publishNewVersion')}
              </label>
            )}
          </form>

          {selectedBlueprint && selectedBlueprint.linkedProjects.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-semibold">{t('blueprintsPage.linkedProjects.title')}</p>
              </div>
              <p className="text-xs text-text-secondary">{t('blueprintsPage.linkedProjects.description')}</p>
              <ul className="mt-3 space-y-1 text-xs text-text-secondary">
                {selectedBlueprint.linkedProjects.map((project) => (
                  <li key={project.projectId} className="flex items-center justify-between rounded-[var(--radius-sm)] bg-surface px-2 py-1">
                    <span>{project.projectName}</span>
                    <span>{project.version}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedBlueprint && (
            <div className="grid gap-4 xl:grid-cols-2">
              <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-text-secondary" />
                  <h3 className="text-sm font-semibold text-text">{t('blueprintsPage.versions.title')}</h3>
                </div>
                <ul className="space-y-2">
                  {selectedBlueprint.versions.map((version) => (
                    <li key={version.version} className="rounded-[var(--radius-sm)] border border-border p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text">{version.version}</span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                            version.status === 'active' && 'bg-success/15 text-success',
                            version.status === 'in-use' && 'bg-warning/20 text-warning',
                            version.status === 'superseded' && 'bg-border text-text-muted',
                          )}
                        >
                          {t(`blueprintsPage.versions.status.${version.status}`)}
                        </span>
                      </div>
                      <p className="mt-1 text-text-muted">{version.notes}</p>
                      <p className="mt-1 text-[10px] text-text-muted">{formatDate(version.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-text-secondary" />
                  <h3 className="text-sm font-semibold text-text">{t('blueprintsPage.history.title')}</h3>
                </div>
                <ul className="space-y-2">
                  {selectedBlueprint.history.map((item) => (
                    <li key={item.id} className="rounded-[var(--radius-sm)] border border-border p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text">{item.action}</span>
                        <span className="text-[10px] text-text-muted">{formatDate(item.date)}</span>
                      </div>
                      <p className="mt-1 text-text-secondary">{item.detail}</p>
                      <p className="mt-1 text-[10px] text-text-muted">{item.author}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </section>
      </PageContainer>
    </>
  )
}

export { BlueprintsPage }
