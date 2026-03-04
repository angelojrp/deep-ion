export class DomainError extends Error {
  public readonly code: string
  public readonly messageKey: string

  public constructor(code: string, messageKey: string) {
    super(messageKey)
    this.name = 'DomainError'
    this.code = code
    this.messageKey = messageKey
  }
}