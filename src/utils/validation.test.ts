import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  normalizeEmail,
  sanitizeInput,
  encodeHtmlEntities,
  validateForm,
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
    expect(result.error).toContain('consecutive dots')
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

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    // Note: quotes and ampersands are encoded as HTML entities
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      'scriptalert(&quot;xss&quot;)/script'
    )
    expect(sanitizeInput('<div>Hello</div>')).toBe('divHello/div')
  })

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert("xss")')).toBe('alert(&quot;xss&quot;)')
    expect(sanitizeInput('JAVASCRIPT:alert("xss")')).toBe('alert(&quot;xss&quot;)')
  })

  it('should remove data: protocol', () => {
    expect(sanitizeInput('data:text/html,<script>alert("xss")</script>')).toBe(
      'text/html,scriptalert(&quot;xss&quot;)/script'
    )
    expect(sanitizeInput('DATA:text/plain,test')).toBe('text/plain,test')
  })

  it('should remove vbscript: protocol', () => {
    expect(sanitizeInput('vbscript:msgbox("xss")')).toBe('msgbox(&quot;xss&quot;)')
    expect(sanitizeInput('VBSCRIPT:msgbox("xss")')).toBe('msgbox(&quot;xss&quot;)')
  })

  it('should remove file: and about: protocols', () => {
    // Note: file:/// removes protocol AND all slashes for safety
    expect(sanitizeInput('file:///etc/passwd')).toBe('etc/passwd')
    expect(sanitizeInput('about:blank')).toBe('blank')
  })

  it('should remove event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onload=malicious()')).toBe('malicious()')
    expect(sanitizeInput('onerror=bad()')).toBe('bad()')
  })

  it('should remove event handlers with spaces', () => {
    expect(sanitizeInput('onclick = alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onload  =  malicious()')).toBe('malicious()')
  })

  it('should encode HTML entities', () => {
    expect(sanitizeInput('test & check')).toBe('test &amp; check')
    expect(sanitizeInput('say "hello"')).toBe('say &quot;hello&quot;')
    expect(sanitizeInput("it's")).toBe('it&#x27;s')
  })

  it('should handle nested/repeated attack patterns', () => {
    // Test nested onclick pattern (ononclick= becomes onclick= after first pass)
    expect(sanitizeInput('ononclick=alert(1)')).toBe('alert(1)')
    // Test multiple nested patterns
    expect(sanitizeInput('onononclick=alert(1)')).toBe('alert(1)')
    // Test nested javascript: protocol
    expect(sanitizeInput('javascript:javascript:alert(1)')).toBe('alert(1)')
    // Test mixed nested patterns
    expect(sanitizeInput('ononmouseover=javascript:javascript:alert(1)')).toBe('alert(1)')
  })

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('should limit input length', () => {
    const longInput = 'a'.repeat(600)
    const result = sanitizeInput(longInput)
    expect(result.length).toBe(500)
  })

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('should handle complex XSS attempts', () => {
    const xss = '<img src=x onerror=alert(1)>'
    const result = sanitizeInput(xss)
    // Should remove < >, encode quotes, and remove onerror
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('onerror')
  })

  it('should prevent nested event handler bypass attacks', () => {
    // ononclick= should be fully removed, not leave onclick=
    expect(sanitizeInput('ononclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onononclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('ononload=bad()')).toBe('bad()')
  })

  it('should prevent nested protocol bypass attacks', () => {
    // javascript:javascript: should be fully removed
    expect(sanitizeInput('javascript:javascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('jajavascript:vascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('data:data:text/html,test')).toBe('text/html,test')
  })

  it('should handle deeply nested bypass attempts', () => {
    // Multiple layers of nesting
    expect(sanitizeInput('ononononclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('jajajavascript:vascript:vascript:alert(1)')).toBe('alert(1)')
  })
})

describe('encodeHtmlEntities', () => {
  it('should encode HTML special characters', () => {
    const result = encodeHtmlEntities('<script>alert("xss")</script>')
    expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
  })

  it('should preserve text content while encoding', () => {
    const result = encodeHtmlEntities('Hello <b>World</b>')
    expect(result).toBe('Hello &lt;b&gt;World&lt;/b&gt;')
  })

  it('should handle empty input', () => {
    expect(encodeHtmlEntities('')).toBe('')
  })

  it('should limit output length', () => {
    const longInput = 'a'.repeat(600)
    const result = encodeHtmlEntities(longInput)
    expect(result.length).toBe(500)
  })

  it('should encode ampersands', () => {
    const result = encodeHtmlEntities('Tom & Jerry')
    expect(result).toBe('Tom &amp; Jerry')
  })
})

describe('validateForm', () => {
  it('should validate form with all valid fields', () => {
    const formData = {
      email: 'user@example.com',
      name: 'John Doe',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })

  it('should return errors for invalid email', () => {
    const formData = {
      email: 'invalid-email',
      name: 'John Doe',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBeDefined()
  })

  it('should return errors for invalid name', () => {
    const formData = {
      email: 'user@example.com',
      name: 'J',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toContain('at least 2 characters')
  })

  it('should return errors for name that is too long', () => {
    const formData = {
      email: 'user@example.com',
      name: 'a'.repeat(101),
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toContain('too long')
  })

  it('should return errors when terms are not accepted', () => {
    const formData = {
      email: 'user@example.com',
      name: 'John Doe',
      acceptTerms: false,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.acceptTerms).toContain('accept the terms')
  })

  it('should return multiple errors when multiple fields are invalid', () => {
    const formData = {
      email: 'invalid',
      name: 'J',
      acceptTerms: false,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(Object.keys(result.errors).length).toBeGreaterThan(1)
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
