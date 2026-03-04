export const isRepositoryIdentifierValid = (repository: string): boolean =>
  /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)