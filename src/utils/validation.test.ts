import { describe, it, expect } from 'vitest'
import { validateName } from './validation'

describe('validateName', () => {
  it('accepts a normal name', () => {
    expect(validateName('Ada Lovelace')).toEqual({ isValid: true })
  })

  it('rejects a name shorter than 2 characters after trimming', () => {
    const result = validateName(' a ')
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/at least 2 characters/i)
  })

  it('rejects a name longer than 100 characters', () => {
    const result = validateName('a'.repeat(101))
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/too long/i)
  })

  it('rejects an empty string', () => {
    const result = validateName('')
    expect(result.isValid).toBe(false)
  })
})
