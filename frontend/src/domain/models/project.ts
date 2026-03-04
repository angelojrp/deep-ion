/* ──────────────────────────────────────────────────────────
 * Project — Domain Models
 * Tipos puros sem dependência de framework
 * Alinhado com o brief de Gestão de Projetos por Tenant
 * ────────────────────────────────────────────────────────── */

/** Status do projeto */
export type ProjectStatus = 'pending' | 'active' | 'configuring' | 'archived'

/** Papel do membro na equipe — lista extensível por tenant (§5 do brief) */
export type MemberRole =
  | 'po'
  | 'architect'
  | 'tech-lead'
  | 'developer'
  | 'qa'
  | 'devops'
  | 'business-analyst'

/** Fornecedor de repositório (§6.1 do brief) */
export type RepositoryProvider = 'github' | 'gitlab' | 'bitbucket' | 'azure-devops'

/** Estratégia multi-módulo (§6.3 do brief) */
export type MultiModuleStrategy = 'none' | 'subfolder' | 'independent'

/** Tipo de documentação (§7 do brief) */
export type DocumentationType = 'embedded' | 'independent'

/** Fornecedor de IA (§8 do brief) */
export type AIProviderName =
  | 'openai'
  | 'anthropic'
  | 'google-ai'
  | 'azure-openai'
  | 'aws-bedrock'

/* ─── Blueprint & Arquitetura ─── */

/** Blueprint arquitetural disponível na plataforma */
export interface BlueprintInfo {
  id: string
  name: string
  description: string
}

/** Módulo do projeto com blueprint associado */
export interface ArchitectureModule {
  id: string
  name: string
  blueprintId: string
  /** Subpasta dentro do monorepo (usado com multiModule === 'subfolder') */
  folderPath: string | null
  /** Caminho do repositório independente (usado com multiModule === 'independent') */
  repositoryPath: string | null
}

/** Configuração de arquitetura do projeto */
export interface ArchitectureConfig {
  modules: ArchitectureModule[]
}

/* ─── Configurações compostas ─── */

/** Configuração do repositório (§6 do brief) */
export interface RepositoryConfig {
  provider: RepositoryProvider
  useGlobalConfig: boolean
  serverUrl: string | null
  accessTokenMasked: string | null
  repositoryPath: string | null
  multiModule: MultiModuleStrategy
}

/** Configuração de documentação (§7 do brief) */
export interface DocumentationConfig {
  type: DocumentationType
  repositoryPath: string | null
}

/** Configuração de fornecedor de IA (§8 do brief) */
export interface AIProviderConfig {
  id: string
  provider: AIProviderName
  endpointUrl: string | null
  apiKeyMasked: string
  defaultModel: string
  rateLimitTokensPerMin: number | null
  rateLimitRequestsPerDay: number | null
}

/* ─── Membros ─── */

/** Membro do projeto — suporta múltiplos papéis (§5 do brief) */
export interface ProjectMember {
  id: string
  name: string
  roles: MemberRole[]
  avatarUrl?: string
}

/** Membro disponível no tenant (para seleção) */
export interface TenantMember {
  id: string
  name: string
  email: string
  defaultRole: MemberRole
}

/* ─── Entidade principal ─── */

/** Entidade principal: Projeto (§4 do brief) */
export interface Project {
  id: string
  tenantId: string
  name: string
  slug: string
  description: string
  status: ProjectStatus
  repository: RepositoryConfig
  architecture: ArchitectureConfig
  documentation: DocumentationConfig
  aiProviders: AIProviderConfig[]
  members: ProjectMember[]
  createdAt: string
  updatedAt: string
}

/* ─── Payloads ─── */

/** Payload para criação de projeto */
export interface CreateProjectPayload {
  name: string
  slug: string
  description: string
  repository: {
    provider: RepositoryProvider
    useGlobalConfig: boolean
    serverUrl?: string
    accessToken?: string
    repositoryPath?: string
    multiModule: MultiModuleStrategy
  }
  documentation: {
    type: DocumentationType
    repositoryPath?: string
  }
  architecture: {
    modules: {
      name: string
      blueprintId: string
      folderPath?: string
      repositoryPath?: string
    }[]
  }
  aiProviders: {
    provider: AIProviderName
    endpointUrl?: string
    apiKey: string
    defaultModel: string
    rateLimitTokensPerMin?: number
    rateLimitRequestsPerDay?: number
  }[]
  members: { id: string; roles: MemberRole[] }[]
}

/** Payload para atualização de projeto */
export interface UpdateProjectPayload {
  name?: string
  description?: string
  status?: ProjectStatus
  repository?: CreateProjectPayload['repository']
  architecture?: CreateProjectPayload['architecture']
  documentation?: CreateProjectPayload['documentation']
  aiProviders?: CreateProjectPayload['aiProviders']
  members?: { id: string; roles: MemberRole[] }[]
}

/** Resumo do projeto para a listagem */
export interface ProjectSummary {
  id: string
  name: string
  slug: string
  description: string
  status: ProjectStatus
  repositoryProvider: RepositoryProvider
  multiModule: MultiModuleStrategy
  aiProvidersCount: number
  membersCount: number
  updatedAt: string
}
