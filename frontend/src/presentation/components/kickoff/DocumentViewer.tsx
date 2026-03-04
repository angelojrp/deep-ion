import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import {
  Pencil,
  Save,
  X,
  MessageSquare,
  Bot,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import type { VisionSection, ArchitectureSection, DocumentStatus, ReviewComment } from '@domain/models/project-kickoff'

type AnySection = VisionSection | ArchitectureSection

interface DocumentViewerProps {
  title: string
  sections: AnySection[]
  status: DocumentStatus
  comments: ReviewComment[]
  generatedBy: string
  reviewedBy: string | null
  editable: boolean
  onSaveSection?: (sectionId: string, content: string) => void
  onApprove?: () => void
  onReject?: (comment: string) => void
}

const statusConfig: Record<DocumentStatus, { labelKey: string; className: string; icon: typeof Clock }> = {
  pending: { labelKey: 'kickoff.docStatus.pending', className: 'bg-surface text-text-muted border-border', icon: Clock },
  generating: { labelKey: 'kickoff.docStatus.generating', className: 'bg-info-light text-info border-info-border', icon: Bot },
  draft: { labelKey: 'kickoff.docStatus.draft', className: 'bg-warning-light text-warning border-warning-border', icon: Pencil },
  in_review: { labelKey: 'kickoff.docStatus.inReview', className: 'bg-info-light text-info border-info-border', icon: MessageSquare },
  approved: { labelKey: 'kickoff.docStatus.approved', className: 'bg-success-light text-success border-success-border', icon: CheckCircle2 },
  rejected: { labelKey: 'kickoff.docStatus.rejected', className: 'bg-error-light text-error border-error-border', icon: AlertTriangle },
}

function DocumentViewer({
  title,
  sections,
  status,
  comments,
  generatedBy,
  reviewedBy,
  editable,
  onSaveSection,
  onApprove,
  onReject,
}: DocumentViewerProps) {
  const { t } = useTranslation()
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [rejectComment, setRejectComment] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const statusCfg = statusConfig[status]
  const StatusIcon = statusCfg.icon

  function handleEdit(section: AnySection) {
    setEditingSectionId(section.id)
    setEditContent(section.content)
  }

  function handleSave(sectionId: string) {
    onSaveSection?.(sectionId, editContent)
    setEditingSectionId(null)
    setEditContent('')
  }

  function handleCancel() {
    setEditingSectionId(null)
    setEditContent('')
  }

  function handleReject() {
    onReject?.(rejectComment)
    setShowRejectForm(false)
    setRejectComment('')
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              statusCfg.className,
            )}
          >
            <StatusIcon size={12} />
            {t(statusCfg.labelKey)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Bot size={12} />
            {t('kickoff.generatedBy', { agent: generatedBy })}
          </span>
          {reviewedBy && (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} />
              {t('kickoff.reviewedBy', { name: reviewedBy })}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-border">
        {sections.map((section) => {
          const isEditing = editingSectionId === section.id
          const sectionComments = comments.filter((c) => c.sectionId === section.id)

          return (
            <div key={section.id} className="px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-semibold text-text">{section.title}</h4>
                {editable && !isEditing && (
                  <button
                    type="button"
                    onClick={() => handleEdit(section)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label={t('kickoff.editSection', { title: section.title })}
                  >
                    <Pencil size={12} />
                    {t('kickoff.edit')}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[200px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-text font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label={t('kickoff.editSectionContent', { title: section.title })}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(section.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
                    >
                      <Save size={12} />
                      {t('kickoff.save')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
                    >
                      <X size={12} />
                      {t('kickoff.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-text-muted whitespace-pre-wrap">
                  {section.content}
                </div>
              )}

              {/* Section comments */}
              {sectionComments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {sectionComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        'rounded-lg border px-4 py-3 text-xs',
                        comment.resolved
                          ? 'border-success-border bg-success-light/50'
                          : 'border-warning-border bg-warning-light/50',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={12} className="text-warning" />
                        <span className="font-medium text-text">{comment.author}</span>
                        <span className="text-text-muted">
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-text-muted">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      {editable && (status === 'draft' || status === 'in_review') && (onApprove || onReject) && (
        <div className="border-t border-border px-6 py-4">
          {showRejectForm ? (
            <div className="space-y-3">
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder={t('kickoff.rejectCommentPlaceholder')}
                className="w-full min-h-[80px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-error/30"
                aria-label={t('kickoff.rejectComment')}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!rejectComment.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-xs font-medium text-white hover:bg-error/90 transition-colors disabled:opacity-50"
                >
                  {t('kickoff.confirmReject')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectForm(false); setRejectComment('') }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
                >
                  {t('kickoff.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {onApprove && (
                <button
                  type="button"
                  onClick={onApprove}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  {t('kickoff.approve')}
                </button>
              )}
              {onReject && (
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-error text-error px-4 py-2 text-sm font-medium hover:bg-error/5 transition-colors"
                >
                  <AlertTriangle size={14} />
                  {t('kickoff.reject')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { DocumentViewer }
export type { DocumentViewerProps }
