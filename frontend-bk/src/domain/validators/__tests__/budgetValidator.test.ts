import { describe, expect, it } from 'vitest'
import { isBudgetThresholdValid } from '../budgetValidator'

describe('isBudgetThresholdValid', () => {
  it('accepts values between 1 and 100', () => {
    expect(isBudgetThresholdValid(1)).toBe(true)
    expect(isBudgetThresholdValid(50)).toBe(true)
    expect(isBudgetThresholdValid(100)).toBe(true)
  })

  it('rejects values outside range', () => {
    expect(isBudgetThresholdValid(0)).toBe(false)
    expect(isBudgetThresholdValid(101)).toBe(false)
  })
})