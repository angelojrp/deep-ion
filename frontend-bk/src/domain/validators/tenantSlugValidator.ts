const TENANT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isTenantSlugValid = (slug: string): boolean => TENANT_SLUG_REGEX.test(slug)