import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import {
  FileText,
  Bot,
  Search,
  Pencil,
  CheckCircle2,
  Blocks,
  Wrench,
} from 'lucide-react'
import type { KickoffStep } from '@domain/models/project-kickoff'

interface KickoffStepperProps {
  currentStep: KickoffStep
}

interface StepDef {
  key: KickoffStep
  labelKey: string
  icon: typeof FileText
  group: 'vision' | 'architecture' | 'scaffold'
}

const STEPS: StepDef[] = [
  { key: 'initial_description', labelKey: 'kickoff.steps.initialDescription', icon: FileText, group: 'vision' },
  { key: 'vision_generation', labelKey: 'kickoff.steps.visionGeneration', icon: Bot, group: 'vision' },
  { key: 'vision_review', labelKey: 'kickoff.steps.visionReview', icon: Pencil, group: 'vision' },
  { key: 'vision_approved', labelKey: 'kickoff.steps.visionApproved', icon: CheckCircle2, group: 'vision' },
  { key: 'architecture_check', labelKey: 'kickoff.steps.architectureCheck', icon: Search, group: 'architecture' },
  { key: 'architecture_task', labelKey: 'kickoff.steps.architectureTask', icon: Wrench, group: 'architecture' },
  { key: 'architecture_generation', labelKey: 'kickoff.steps.architectureGeneration', icon: Bot, group: 'architecture' },
  { key: 'architecture_review', labelKey: 'kickoff.steps.architectureReview', icon: Pencil, group: 'architecture' },
  { key: 'architecture_approved', labelKey: 'kickoff.steps.architectureApproved', icon: CheckCircle2, group: 'architecture' },
  { key: 'scaffold_generation', labelKey: 'kickoff.steps.scaffoldGeneration', icon: Blocks, group: 'scaffold' },
  { key: 'completed', labelKey: 'kickoff.steps.completed', icon: CheckCircle2, group: 'scaffold' },
]

const STEP_ORDER = STEPS.map((s) => s.key)

function getStepStatus(step: KickoffStep, currentStep: KickoffStep): 'completed' | 'current' | 'upcoming' {
  const currentIdx = STEP_ORDER.indexOf(currentStep)
  const stepIdx = STEP_ORDER.indexOf(step)
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'current'
  return 'upcoming'
}

function KickoffStepper({ currentStep }: KickoffStepperProps) {
  const { t } = useTranslation()

  // Only show relevant steps (skip architecture_task if not needed)
  const visibleSteps = STEPS.filter((s) => {
    if (s.key === 'architecture_task' && currentStep !== 'architecture_task') {
      const currentIdx = STEP_ORDER.indexOf(currentStep)
      const taskIdx = STEP_ORDER.indexOf('architecture_task')
      if (currentIdx > taskIdx) return false
    }
    return true
  })

  return (
    <nav aria-label={t('kickoff.stepper.label')} className="mb-8">
      <ol className="flex items-center gap-1 overflow-x-auto pb-2">
        {visibleSteps.map((step, idx) => {
          const status = getStepStatus(step.key, currentStep)
          const Icon = step.icon
          const isLast = idx === visibleSteps.length - 1

          return (
            <li key={step.key} className="flex items-center flex-shrink-0">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  status === 'completed' && 'bg-success-light text-success',
                  status === 'current' && 'bg-primary/10 text-primary ring-1 ring-primary/30',
                  status === 'upcoming' && 'bg-surface text-text-muted',
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                <Icon size={14} className="flex-shrink-0" />
                <span className="whitespace-nowrap">{t(step.labelKey)}</span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-1 h-px w-4 flex-shrink-0',
                    status === 'completed' ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { KickoffStepper }
export type { KickoffStepperProps }
