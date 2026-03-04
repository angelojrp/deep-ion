import { DomainError } from './DomainError'

export class UnauthorizedRoleError extends DomainError {
  public constructor() {
    super('UNAUTHORIZED_ROLE', 'errors.auth.unauthorizedRole')
  }
}