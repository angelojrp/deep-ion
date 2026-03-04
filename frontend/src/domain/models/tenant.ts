/* ──────────────────────────────────────────────────────────
 * Tenant — Domain Models
 * Tipos puros sem dependência de framework
 * Gestão de Tenants (organizações clientes)
 * ────────────────────────────────────────────────────────── */

/** Status do tenant na plataforma */
export type TenantStatus = 'ATIVO' | 'INATIVO'

/** Papel de um membro no squad */
export type SquadRole = 'PO' | 'Arquiteto' | 'Dev' | 'QA' | 'Gate Keeper'

/** Status do convite de um membro */
export type InviteStatus = 'PENDENTE' | 'ATIVO'

/** Entidade Tenant completa */
export interface Tenant {
  /** Identificador único (ULID) */
  tenant_id: string
  /** Nome da organização cliente */
  nome: string
  /** Slug único (imutável após cadastro) */
  slug: string
  /** Status do tenant */
  status: TenantStatus
  /** Data de criação (ISO-8601 UTC) */
  criado_em: string
  /** E-mail do administrador inicial */
  email_admin: string
  /** Primeiro nome do administrador inicial */
  primeiro_nome_admin: string
  /** Sobrenome do administrador inicial */
  sobrenome_admin: string
  /** Telefones do administrador inicial */
  telefones_admin: string[]
  /** Contagem de membros ativos no squad */
  membros_ativos: number
}

/** Resumo do tenant para listagem */
export interface TenantSummary {
  tenant_id: string
  nome: string
  slug: string
  status: TenantStatus
  criado_em: string
  membros_ativos: number
}

/** Payload para criação de tenant */
export interface CreateTenantPayload {
  nome: string
  slug: string
  email_admin: string
  primeiro_nome_admin: string
  sobrenome_admin: string
  telefones_admin: string[]
}

/** Payload para edição de tenant */
export interface UpdateTenantPayload {
  nome: string
}

/** Resposta paginada de tenants */
export interface TenantListResponse {
  items: TenantSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
