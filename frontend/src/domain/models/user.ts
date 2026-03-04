/* ──────────────────────────────────────────────────────────
 * User — Domain Models
 * Tipos puros sem dependência de framework
 * Cadastro de Usuários + Perfil Profissional
 * ────────────────────────────────────────────────────────── */

/** Papéis que um usuário pode assumir na plataforma */
export type UserRole =
  | 'admin'
  | 'po'
  | 'architect'
  | 'tech-lead'
  | 'developer'
  | 'qa'
  | 'devops'
  | 'business-analyst'
  | 'requirements-analyst'
  | 'ux-analyst'

/** Status do convite do usuário */
export type InviteStatus = 'pending' | 'accepted' | 'expired'

/** Status do usuário */
export type UserStatus = 'active' | 'inactive' | 'pending'

/** Certificação profissional */
export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expirationDate: string | null
  credentialUrl: string | null
}

/** Telefone */
export interface Phone {
  id: string
  type: 'mobile' | 'work' | 'home'
  number: string
  isPrimary: boolean
}

/** Experiência profissional */
export interface ProfessionalExperience {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string
}

/** Formação acadêmica */
export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
  current: boolean
}

/** Link de rede social / portfólio */
export interface SocialLink {
  id: string
  type: 'linkedin' | 'github' | 'portfolio' | 'other'
  url: string
  label: string
}

/** Perfil profissional completo do usuário */
export interface UserProfile {
  userId: string
  photoUrl: string | null
  phones: Phone[]
  bio: string | null
  location: string | null
  timezone: string | null
  languages: string[]
  skills: string[]
  certifications: Certification[]
  experience: ProfessionalExperience[]
  education: Education[]
  socialLinks: SocialLink[]
  availabilityHoursPerWeek: number | null
  completedAt: string | null
  updatedAt: string
}

/** Usuário cadastrado (visão admin) */
export interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
  status: UserStatus
  inviteStatus: InviteStatus
  inviteSentAt: string | null
  inviteAcceptedAt: string | null
  createdAt: string
  updatedAt: string
  profile: UserProfile | null
}

/** Resumo do usuário para listagem */
export interface UserSummary {
  id: string
  name: string
  email: string
  roles: UserRole[]
  status: UserStatus
  inviteStatus: InviteStatus
  photoUrl: string | null
  createdAt: string
}

/** Payload para cadastrar novo usuário (admin) */
export interface CreateUserPayload {
  name: string
  email: string
  roles: UserRole[]
}

/** Payload para atualizar perfil (próprio usuário) */
export interface UpdateProfilePayload {
  photoUrl: string | null
  phones: Omit<Phone, 'id'>[]
  bio: string | null
  location: string | null
  timezone: string | null
  languages: string[]
  skills: string[]
  certifications: Omit<Certification, 'id'>[]
  experience: Omit<ProfessionalExperience, 'id'>[]
  education: Omit<Education, 'id'>[]
  socialLinks: Omit<SocialLink, 'id'>[]
  availabilityHoursPerWeek: number | null
}
