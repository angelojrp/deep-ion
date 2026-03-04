import { describe, expect, it } from 'vitest'
import { isTenantSlugValid } from '../tenantSlugValidator'

describe('isTenantSlugValid', () => {
  it('returns true for valid slug', () => {
    expect(isTenantSlugValid('acme-corp')).toBe(true)
  })

  it('returns false for invalid slug', () => {
    expect(isTenantSlugValid('Acme Corp')).toBe(false)
  })
})