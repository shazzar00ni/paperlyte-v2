import { describe, it, expect } from 'vitest'
import { WAITLIST_COUNT_NUMERIC, WAITLIST_COUNT } from './waitlist'

describe('WAITLIST_COUNT_NUMERIC', () => {
  it('should be a number', () => {
    expect(typeof WAITLIST_COUNT_NUMERIC).toBe('number')
  })

  it('should be a positive integer', () => {
    expect(WAITLIST_COUNT_NUMERIC).toBeGreaterThan(0)
    expect(Number.isInteger(WAITLIST_COUNT_NUMERIC)).toBe(true)
  })

  it('should have the expected value of 500', () => {
    expect(WAITLIST_COUNT_NUMERIC).toBe(500)
  })

  it('should produce WAITLIST_COUNT when formatted with a + suffix', () => {
    expect(`${WAITLIST_COUNT_NUMERIC}+`).toBe(WAITLIST_COUNT)
  })

  it('should be consistent with WAITLIST_COUNT', () => {
    const numericPart = WAITLIST_COUNT.replace(/\D/g, '')
    expect(parseInt(numericPart, 10)).toBe(WAITLIST_COUNT_NUMERIC)
  })
})
