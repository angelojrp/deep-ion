import { DomainError } from './DomainError'

export class TenantNotFoundError extends DomainError {
  public constructor() {
    super('TENANT_NOT_FOUND', 'errors.tenant.notFound')
  }
}