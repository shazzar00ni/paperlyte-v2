import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  isValidEmail,
  normalizeEmail,
  validateEmailDomain,
  suggestEmailCorrection,
} from './validation'

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.com',
      'user+tag@example.co.uk',
      'user_name@example-domain.com',
      'user123@test.io',
    ]

    validEmails.forEach((email) => {
      const result = validateEmail(email)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      '',
      'not-an-email',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
      'user..name@example.com',
    ]

    invalidEmails.forEach((email) => {
      const result = validateEmail(email)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  it('should reject emails with consecutive dots', () => {
    const result = validateEmail('user..name@example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('valid email')
  })

  it('should reject emails with dots at the start of local part', () => {
    const result = validateEmail('.user@example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('valid email')
  })

  it('should reject emails with dots at the end of local part', () => {
    const result = validateEmail('user.@example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('valid email')
  })

  it('should reject emails that are too long', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    const result = validateEmail(longEmail)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('too long')
  })

  it('should reject disposable email domains', () => {
    const result = validateEmail('user@tempmail.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('permanent email')
  })

  it('should handle whitespace in email addresses', () => {
    const result = validateEmail('  user@example.com  ')
    expect(result.isValid).toBe(true)
  })
})

describe('normalizeEmail', () => {
  it('should normalize valid email addresses', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com')
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
  })

  it('should return null for invalid email addresses', () => {
    expect(normalizeEmail('not-an-email')).toBeNull()
    expect(normalizeEmail('')).toBeNull()
  })

  it('should trim and lowercase emails', () => {
    const normalized = normalizeEmail('  TEST.User@Example.COM  ')
    expect(normalized).toBe('test.user@example.com')
  })
})

describe('suggestEmailCorrection', () => {
  it('should suggest corrections for common typos', () => {
    expect(suggestEmailCorrection('user@gmial.com')).toBe('user@gmail.com')
    expect(suggestEmailCorrection('user@gmai.com')).toBe('user@gmail.com')
    expect(suggestEmailCorrection('user@yahooo.com')).toBe('user@yahoo.com')
    expect(suggestEmailCorrection('user@hotmial.com')).toBe('user@hotmail.com')
  })

  it('should return null for correct domains', () => {
    expect(suggestEmailCorrection('user@gmail.com')).toBeNull()
    expect(suggestEmailCorrection('user@yahoo.com')).toBeNull()
    expect(suggestEmailCorrection('user@example.com')).toBeNull()
  })

  it('should return null for invalid email format', () => {
    expect(suggestEmailCorrection('not-an-email')).toBeNull()
    expect(suggestEmailCorrection('')).toBeNull()
  })

  it('should preserve local part when suggesting correction', () => {
    const suggestion = suggestEmailCorrection('test.user+tag@gmial.com')
    expect(suggestion).toBe('test.user+tag@gmail.com')
  })
})

describe('isValidEmail', () => {
  it('returns true for a valid email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('test.user+tag@example.co.uk')).toBe(true)
  })

  it('returns false for an invalid email address', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('returns false for a disposable-domain email', () => {
    expect(isValidEmail('user@mailinator.com')).toBe(false)
  })
})

describe('validateEmail — Unicode and IDN edge cases', () => {
  it('should reject Unicode characters in the local part', () => {
    // EMAIL_REGEX only allows [a-zA-Z0-9._+-], so non-ASCII is invalid
    const result = validateEmail('用户@example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject Internationalized Domain Names (IDN) with non-ASCII characters', () => {
    // EMAIL_REGEX domain pattern only allows [a-zA-Z0-9.-], so non-ASCII domains are invalid
    const result = validateEmail('user@例子.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject emoji characters in the local part', () => {
    const result = validateEmail('user🙂@example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  // TODO: EMAIL_REGEX only allows a single separator character between alphanumerics,
  // so punycode-encoded IDN domains (e.g. xn--fiq228c) containing "--" are rejected.
  // This is a known limitation of the current regex. If IDN support is needed, EMAIL_REGEX
  // should be updated to allow consecutive hyphens in domain labels (per RFC 5891).
  it('should reject punycode-encoded IDN domains due to consecutive hyphens', () => {
    const result = validateEmail('user@xn--fiq228c.com')
    expect(result.isValid).toBe(false)
  })

  it('should accept standard plus-sign subaddressing', () => {
    // user+tag@gmail.com is a standard and widely-used email format
    const result = validateEmail('user+tag@gmail.com')
    expect(result.isValid).toBe(true)
  })
})

describe('validateEmailDomain', () => {
  it('should return true for valid email (placeholder implementation)', async () => {
    const result = await validateEmailDomain('user@example.com')
    expect(result).toBe(true)
  })

  it('should return false for invalid email format', async () => {
    const result = await validateEmailDomain('invalid-email')
    expect(result).toBe(false)
  })

  it('should return false for email with consecutive dots', async () => {
    const result = await validateEmailDomain('user..name@example.com')
    expect(result).toBe(false)
  })

  it('should return false for empty email', async () => {
    const result = await validateEmailDomain('')
    expect(result).toBe(false)
  })
})
