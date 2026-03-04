/* ──────────────────────────────────────────────────────────
 * Tenant — Domain Validators
 * Funções de validação puras (sem framework)
 * ────────────────────────────────────────────────────────── */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+\d{1,3}\s?\d{4,15}$/

/** Gera slug a partir do nome: lowercase, sem especiais, hífens no lugar de espaços */
export function generateSlug(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove especiais
    .trim()
    .replace(/\s+/g, '-') // espaços → hífens
    .replace(/-+/g, '-') // hífens duplicados
    .slice(0, 50)
}

/** Valida formato do slug */
export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug) && slug.length <= 50
}

/** Valida formato de e-mail */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/** Valida formato de telefone internacional */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone)
}

/** Valida nome (obrigatório, max 100 chars) */
export function isValidNome(nome: string): boolean {
  return nome.trim().length > 0 && nome.trim().length <= 100
}

/** Valida primeiro nome / sobrenome (obrigatório, max 80 chars) */
export function isValidNameField(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 80
}
