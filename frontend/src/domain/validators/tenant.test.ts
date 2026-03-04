import { describe, it, expect } from 'vitest'
import {
  generateSlug,
  isValidSlug,
  isValidEmail,
  isValidPhone,
  isValidNome,
  isValidNameField,
} from './tenant'

describe('Tenant Validators', () => {
  describe('generateSlug', () => {
    it('converts name to lowercase slug', () => {
      expect(generateSlug('ACME Corp')).toBe('acme-corp')
    })

    it('removes accents', () => {
      expect(generateSlug('Crédito Fácil')).toBe('credito-facil')
    })

    it('removes special characters', () => {
      expect(generateSlug('FinPay@#$% Solutions')).toBe('finpay-solutions')
    })

    it('replaces multiple spaces with single hyphen', () => {
      expect(generateSlug('Tech   Bank')).toBe('tech-bank')
    })

    it('trims whitespace', () => {
      expect(generateSlug('  ACME  ')).toBe('acme')
    })

    it('truncates to 50 chars', () => {
      const longName = 'A'.repeat(60)
      expect(generateSlug(longName).length).toBeLessThanOrEqual(50)
    })
  })

  describe('isValidSlug', () => {
    it('accepts valid slug', () => {
      expect(isValidSlug('acme-corp')).toBe(true)
    })

    it('accepts slug with numbers', () => {
      expect(isValidSlug('finpay-2026')).toBe(true)
    })

    it('rejects uppercase', () => {
      expect(isValidSlug('ACME')).toBe(false)
    })

    it('rejects spaces', () => {
      expect(isValidSlug('acme corp')).toBe(false)
    })

    it('rejects special characters', () => {
      expect(isValidSlug('acme_corp')).toBe(false)
    })

    it('rejects slug longer than 50 chars', () => {
      expect(isValidSlug('a'.repeat(51))).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('accepts valid email', () => {
      expect(isValidEmail('admin@acme.com.br')).toBe(true)
    })

    it('rejects invalid email', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('accepts valid BR phone', () => {
      expect(isValidPhone('+55 11999887766')).toBe(true)
    })

    it('accepts international phone', () => {
      expect(isValidPhone('+1 5551234567')).toBe(true)
    })

    it('rejects phone without country code', () => {
      expect(isValidPhone('11999887766')).toBe(false)
    })
  })

  describe('isValidNome', () => {
    it('accepts valid name', () => {
      expect(isValidNome('ACME Corp')).toBe(true)
    })

    it('rejects empty string', () => {
      expect(isValidNome('')).toBe(false)
    })

    it('rejects whitespace only', () => {
      expect(isValidNome('   ')).toBe(false)
    })

    it('rejects name longer than 100 chars', () => {
      expect(isValidNome('A'.repeat(101))).toBe(false)
    })
  })

  describe('isValidNameField', () => {
    it('accepts valid field', () => {
      expect(isValidNameField('Maria')).toBe(true)
    })

    it('rejects empty', () => {
      expect(isValidNameField('')).toBe(false)
    })

    it('rejects field longer than 80 chars', () => {
      expect(isValidNameField('A'.repeat(81))).toBe(false)
    })
  })
})
