/* ──────────────────────────────────────────────────────────
 * Project Kickoff — Domain Models
 * Workflow "Iniciar Projeto" — tipos puros sem dependência de framework
 * ────────────────────────────────────────────────────────── */

/** Etapa do workflow de kickoff */
export type KickoffStep =
  | 'initial_description'
  | 'vision_generation'
  | 'vision_review'
  | 'vision_approved'
  | 'architecture_check'
  | 'architecture_task'
  | 'architecture_generation'
  | 'architecture_review'
  | 'architecture_approved'
  | 'scaffold_generation'
  | 'completed'

/** Status de um documento no workflow */
export type DocumentStatus = 'pending' | 'generating' | 'draft' | 'in_review' | 'approved' | 'rejected'

/** Status de uma tarefa do workflow */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

/** Tipo do agente que executa a ação */
export type AgentType = 'DOM-02' | 'DOM-03'

/** Papel do revisor humano */
export type ReviewerRole = 'po' | 'business-analyst' | 'architect'

/* ─── Documento de Visão ─── */

/** Seção do documento de visão */
export interface VisionSection {
  id: string
  title: string
  content: string
  order: number
}

/** Documento de visão do projeto */
export interface VisionDocument {
  id: string
  projectId: string
  version: number
  status: DocumentStatus
  sections: VisionSection[]
  generatedBy: AgentType
  reviewedBy: string | null
  reviewerRole: ReviewerRole | null
  comments: ReviewComment[]
  createdAt: string
  updatedAt: string
}

/* ─── Documento de Arquitetura ─── */

/** Seção do documento de arquitetura */
export interface ArchitectureSection {
  id: string
  title: string
  content: string
  order: number
}

/** Documento de arquitetura do projeto */
export interface ArchitectureDocument {
  id: string
  projectId: string
  version: number
  status: DocumentStatus
  sections: ArchitectureSection[]
  generatedBy: AgentType
  reviewedBy: string | null
  reviewerRole: ReviewerRole | null
  comments: ReviewComment[]
  createdAt: string
  updatedAt: string
}

/* ─── Review & Comentários ─── */

/** Comentário de revisão em um documento */
export interface ReviewComment {
  id: string
  sectionId: string | null
  author: string
  authorRole: ReviewerRole
  content: string
  resolved: boolean
  createdAt: string
}

/* ─── Tarefas ─── */

/** Tarefa pendente no workflow (ex: arquiteto configurar módulos) */
export interface KickoffTask {
  id: string
  projectId: string
  type: 'configure_modules' | 'configure_blueprints' | 'review_vision' | 'review_architecture'
  title: string
  description: string
  assignedTo: string
  assignedRole: ReviewerRole
  status: TaskStatus
  createdAt: string
  completedAt: string | null
}

/* ─── Verificação de Arquitetura ─── */

/** Resultado da verificação de módulos/blueprints */
export interface ArchitectureCheckResult {
  hasModules: boolean
  hasBlueprints: boolean
  missingItems: string[]
  ready: boolean
}

/* ─── Scaffold ─── */

/** Resultado da geração de scaffold */
export interface ScaffoldResult {
  moduleId: string
  moduleName: string
  blueprintId: string
  filesGenerated: number
  status: 'success' | 'error'
  log: string[]
}

/* ─── Estado do Kickoff ─── */

/** Estado completo do workflow de kickoff de um projeto */
export interface ProjectKickoff {
  id: string
  projectId: string
  projectName: string
  currentStep: KickoffStep
  initialDescription: string
  visionDocument: VisionDocument | null
  architectureCheck: ArchitectureCheckResult | null
  architectureDocument: ArchitectureDocument | null
  tasks: KickoffTask[]
  scaffoldResults: ScaffoldResult[]
  startedBy: string
  startedAt: string
  completedAt: string | null
}

/* ─── Payloads ─── */

/** Payload para iniciar o kickoff */
export interface StartKickoffPayload {
  projectId: string
  initialDescription: string
}

/** Payload para ação do revisor no documento */
export interface ReviewDocumentPayload {
  action: 'approve' | 'reject' | 'comment'
  comment?: string
  sectionId?: string
}

/** Payload para atualizar conteúdo de uma seção */
export interface UpdateSectionPayload {
  sectionId: string
  content: string
}
