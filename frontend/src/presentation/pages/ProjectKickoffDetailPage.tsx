import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Rocket,
  Bot,
  CheckCircle2,
  PartyPopper,
} from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import {
  KickoffStepper,
  DocumentViewer,
  ArchitectureCheck,
  ScaffoldResults,
  AgentProcessing,
} from '@presentation/components/kickoff'
import {
  useKickoff,
  useGenerateVision,
  useReviewVision,
  useUpdateVisionSection,
  useCheckArchitecture,
  useCompleteArchitectureTask,
  useGenerateArchitecture,
  useReviewArchitecture,
  useUpdateArchitectureSection,
  useGenerateScaffold,
} from '@application/hooks/useProjectKickoff'

function ProjectKickoffDetailPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data: kickoff, isLoading, isError } = useKickoff(projectId ?? null)

  const generateVision = useGenerateVision()
  const reviewVision = useReviewVision()
  const updateVisionSection = useUpdateVisionSection()
  const checkArchitecture = useCheckArchitecture()
  const completeArchTask = useCompleteArchitectureTask()
  const generateArchitecture = useGenerateArchitecture()
  const reviewArchitecture = useReviewArchitecture()
  const updateArchSection = useUpdateArchitectureSection()
  const generateScaffold = useGenerateScaffold()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingAction, setGeneratingAction] = useState<string | null>(null)

  const handleGenerateVision = useCallback(() => {
    if (!kickoff) return
    setIsGenerating(true)
    setGeneratingAction('kickoff.agentProcessing.generatingVision')
    // Simulate agent delay
    setTimeout(() => {
      generateVision.mutate(kickoff.id, {
        onSettled: () => {
          setIsGenerating(false)
          setGeneratingAction(null)
        },
      })
    }, 2000)
  }, [kickoff, generateVision])

  const handleApproveVision = useCallback(() => {
    if (!kickoff) return
    reviewVision.mutate({
      kickoffId: kickoff.id,
      payload: { action: 'approve' },
    })
  }, [kickoff, reviewVision])

  const handleRejectVision = useCallback(
    (comment: string) => {
      if (!kickoff) return
      reviewVision.mutate({
        kickoffId: kickoff.id,
        payload: { action: 'reject', comment },
      })
    },
    [kickoff, reviewVision],
  )

  const handleSaveVisionSection = useCallback(
    (sectionId: string, content: string) => {
      if (!kickoff) return
      updateVisionSection.mutate({
        kickoffId: kickoff.id,
        sectionId,
        content,
      })
    },
    [kickoff, updateVisionSection],
  )

  const handleCheckArchitecture = useCallback(() => {
    if (!kickoff) return
    checkArchitecture.mutate(kickoff.id)
  }, [kickoff, checkArchitecture])

  const handleConfigureModules = useCallback(() => {
    if (!kickoff) return
    // Simulate architect completing the task
    completeArchTask.mutate(kickoff.id)
  }, [kickoff, completeArchTask])

  const handleGenerateArchitecture = useCallback(() => {
    if (!kickoff) return
    setIsGenerating(true)
    setGeneratingAction('kickoff.agentProcessing.generatingArchitecture')
    setTimeout(() => {
      generateArchitecture.mutate(kickoff.id, {
        onSettled: () => {
          setIsGenerating(false)
          setGeneratingAction(null)
        },
      })
    }, 2000)
  }, [kickoff, generateArchitecture])

  const handleApproveArchitecture = useCallback(() => {
    if (!kickoff) return
    reviewArchitecture.mutate({
      kickoffId: kickoff.id,
      payload: { action: 'approve' },
    })
  }, [kickoff, reviewArchitecture])

  const handleRejectArchitecture = useCallback(
    (comment: string) => {
      if (!kickoff) return
      reviewArchitecture.mutate({
        kickoffId: kickoff.id,
        payload: { action: 'reject', comment },
      })
    },
    [kickoff, reviewArchitecture],
  )

  const handleSaveArchSection = useCallback(
    (sectionId: string, content: string) => {
      if (!kickoff) return
      updateArchSection.mutate({
        kickoffId: kickoff.id,
        sectionId,
        content,
      })
    },
    [kickoff, updateArchSection],
  )

  const handleGenerateScaffold = useCallback(() => {
    if (!kickoff) return
    setIsGenerating(true)
    setGeneratingAction('kickoff.agentProcessing.generatingScaffold')
    setTimeout(() => {
      generateScaffold.mutate(kickoff.id, {
        onSettled: () => {
          setIsGenerating(false)
          setGeneratingAction(null)
        },
      })
    }, 3000)
  }, [kickoff, generateScaffold])

  if (isLoading) {
    return (
      <>
        <Header title={t('kickoff.detail.loading')} subtitle="" />
        <PageContainer>
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
          </div>
        </PageContainer>
      </>
    )
  }

  if (isError || !kickoff) {
    return (
      <>
        <Header title={t('kickoff.detail.error')} subtitle="" />
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-sm text-text-muted">{t('kickoff.detail.notFound')}</p>
            <button
              type="button"
              onClick={() => navigate('/projects/kickoff')}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft size={14} />
              {t('kickoff.detail.backToList')}
            </button>
          </div>
        </PageContainer>
      </>
    )
  }

  const currentStep = kickoff.currentStep

  return (
    <>
      <Header
        title={kickoff.projectName}
        subtitle={t('kickoff.detail.subtitle')}
      />
      <PageContainer>
        {/* Back button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/projects/kickoff')}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            {t('kickoff.detail.backToList')}
          </button>
        </div>

        {/* Stepper */}
        <KickoffStepper currentStep={currentStep} />

        {/* Initial description */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-text">
              {t('kickoff.detail.initialDescription')}
            </h3>
          </div>
          <p className="text-sm text-text-muted whitespace-pre-wrap">
            {kickoff.initialDescription}
          </p>
        </div>

        {/* Step: Generate Vision (if at initial_description step) */}
        {currentStep === 'initial_description' && !isGenerating && (
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={handleGenerateVision}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors shadow-[var(--shadow-card)]"
            >
              <Bot size={18} />
              {t('kickoff.detail.generateVision')}
            </button>
          </div>
        )}

        {/* Agent Processing Animation */}
        {isGenerating && generatingAction && (
          <div className="mb-6">
            <AgentProcessing
              agentName={
                generatingAction.includes('Vision') || generatingAction.includes('vision')
                  ? 'DOM-02'
                  : 'DOM-03'
              }
              actionKey={generatingAction}
            />
          </div>
        )}

        {/* Vision Document */}
        {kickoff.visionDocument && !isGenerating && (
          <div className="mb-6">
            <DocumentViewer
              title={t('kickoff.visionDoc.title')}
              sections={kickoff.visionDocument.sections}
              status={kickoff.visionDocument.status}
              comments={kickoff.visionDocument.comments}
              generatedBy={kickoff.visionDocument.generatedBy}
              reviewedBy={kickoff.visionDocument.reviewedBy}
              editable={currentStep === 'vision_review'}
              onSaveSection={handleSaveVisionSection}
              onApprove={currentStep === 'vision_review' ? handleApproveVision : undefined}
              onReject={currentStep === 'vision_review' ? handleRejectVision : undefined}
            />
          </div>
        )}

        {/* Architecture Check — after vision approved */}
        {(currentStep === 'vision_approved' ||
          currentStep === 'architecture_check' ||
          currentStep === 'architecture_task') && (
          <div className="mb-6">
            <ArchitectureCheck
              result={kickoff.architectureCheck}
              isChecking={checkArchitecture.isPending}
              onCheck={handleCheckArchitecture}
              onConfigureModules={
                currentStep === 'architecture_task' ? handleConfigureModules : undefined
              }
              onProceed={
                kickoff.architectureCheck?.ready ? handleGenerateArchitecture : undefined
              }
            />
          </div>
        )}

        {/* Architecture Document */}
        {kickoff.architectureDocument && !isGenerating && (
          <div className="mb-6">
            <DocumentViewer
              title={t('kickoff.archDoc.title')}
              sections={kickoff.architectureDocument.sections}
              status={kickoff.architectureDocument.status}
              comments={kickoff.architectureDocument.comments}
              generatedBy={kickoff.architectureDocument.generatedBy}
              reviewedBy={kickoff.architectureDocument.reviewedBy}
              editable={currentStep === 'architecture_review'}
              onSaveSection={handleSaveArchSection}
              onApprove={
                currentStep === 'architecture_review' ? handleApproveArchitecture : undefined
              }
              onReject={
                currentStep === 'architecture_review' ? handleRejectArchitecture : undefined
              }
            />
          </div>
        )}

        {/* Generate Scaffold Button — after architecture approved */}
        {currentStep === 'architecture_approved' && !isGenerating && (
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={handleGenerateScaffold}
              className="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-3 text-sm font-medium text-white hover:bg-success/90 transition-colors shadow-[var(--shadow-card)]"
            >
              <Bot size={18} />
              {t('kickoff.detail.generateScaffold')}
            </button>
          </div>
        )}

        {/* Scaffold Results */}
        {kickoff.scaffoldResults.length > 0 && (
          <div className="mb-6">
            <ScaffoldResults results={kickoff.scaffoldResults} />
          </div>
        )}

        {/* Completed */}
        {currentStep === 'completed' && (
          <div className="rounded-[var(--radius-lg)] border border-success-border bg-success-light p-8 text-center shadow-[var(--shadow-card)]">
            <PartyPopper size={40} className="mx-auto text-success mb-3" />
            <h3 className="text-lg font-semibold text-success mb-2">
              {t('kickoff.completed.title')}
            </h3>
            <p className="text-sm text-success/80 mb-4">
              {t('kickoff.completed.message', { name: kickoff.projectName })}
            </p>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-white hover:bg-success/90 transition-colors"
            >
              {t('kickoff.completed.goToProjects')}
            </button>
          </div>
        )}

        {/* Tasks summary */}
        {kickoff.tasks.length > 0 && (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-base font-semibold text-text mb-4">
              {t('kickoff.tasks.title')}
            </h3>
            <div className="space-y-3">
              {kickoff.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-text">{task.title}</span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {t('kickoff.tasks.assignedTo', { name: task.assignedTo })} · {t(`kickoff.tasks.roles.${task.assignedRole}`)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      task.status === 'completed'
                        ? 'bg-success-light text-success border-success-border'
                        : task.status === 'in_progress'
                          ? 'bg-info-light text-info border-info-border'
                          : 'bg-surface text-text-muted border-border'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 size={12} />}
                    {t(`kickoff.tasks.status.${task.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}

export { ProjectKickoffDetailPage }
