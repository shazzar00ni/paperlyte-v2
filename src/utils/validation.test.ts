import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  validateEmail,
  normalizeEmail,
  sanitizeInput,
  encodeHtmlEntities,
  validateForm,
  suggestEmailCorrection,
  validateEmailDomain,
  debounce,
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

  it('should prevent bypass attacks with nested protocols', () => {
    // Test for "jajavascript:vascript:" bypass - removes all "javascript:" instances iteratively
    expect(sanitizeInput('jajavascript:vascript:alert("xss")')).toBe('alert(&quot;xss&quot;)')
    // Test for "daddata:ata:" bypass - removes all "data:" instances, leaving harmless "da" prefix
    expect(sanitizeInput('daddata:ata:text/html,malicious')).toBe('datext/html,malicious')
    // Test for "vbvbscript:script:" bypass - removes all "vbscript:" instances iteratively
    expect(sanitizeInput('vbvbscript:script:msgbox("xss")')).toBe('msgbox(&quot;xss&quot;)')
    // Test for mixed case nested bypass
    expect(sanitizeInput('jaJAVASCRIPT:vascript:alert(1)')).toBe('alert(1)')
    // Test for multiple layers of nesting (javajavascript:script: -> javascript: -> empty)
    expect(sanitizeInput('javajavascript:script:alert(1)')).toBe('alert(1)')
    // Verify the dangerous protocols are completely removed
    expect(sanitizeInput('daddata:ata:text/html')).not.toContain('data:')
    expect(sanitizeInput('jajavascript:vascript:alert')).not.toContain('javascript:')
    expect(sanitizeInput('vbvbscript:script:msgbox')).not.toContain('vbscript:')
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

  it('should prevent bypass attacks with nested event handlers', () => {
    // Greedy regex matching prevents simple nesting bypasses
    // "ononclick=" matches as one token, leaving "click=" which is harmless
    expect(sanitizeInput('ononclick=click=alert(1)')).toBe('click=alert(1)')
    // Multiple passes still remove all valid event handlers
    expect(sanitizeInput('onload=onclick=alert(1)')).toBe('alert(1)')
    // Verify dangerous event handlers are removed
    const result = sanitizeInput('onclick=onload=test')
    expect(result).not.toContain('onclick=')
    expect(result).not.toContain('onload=')
  })

  it('should handle deeply nested patterns without hanging', () => {
    // Create a deeply nested pattern (would require many iterations)
    const deeplyNested = 'ja'.repeat(20) + 'javascript:' + 'va'.repeat(20) + 'script:alert(1)'
    const result = sanitizeInput(deeplyNested)
    // Should complete without hanging (max 10 iterations)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })

  it('should prevent incomplete multi-character sanitization bypasses', () => {
    // Test for overlapping patterns that could bypass single-pass sanitization
    // 'ononclick=' -> after removing 'onclick=' -> 'on=' (still dangerous without iterative approach)
    expect(sanitizeInput('ononclick=alert(1)')).toBe('alert(1)')
    // 'onononclick=' -> multiple nested patterns
    expect(sanitizeInput('onononclick=alert(1)')).toBe('alert(1)')
    // 'jajavascript:vascript:' -> after removing 'javascript:' -> 'javascript:' (still dangerous)
    expect(sanitizeInput('jajavascript:vascript:alert(1)')).toBe('alert(1)')
  })

  it('should handle complex nested patterns without performance issues', () => {
    // Test that the function handles complex inputs efficiently
    // Create a pattern with multiple nested layers that requires several iterations
    // Pattern: 'on<nested>aclick=' where nested also contains similar patterns
    let complexInput = 'alert(1)'
    for (let i = 0; i < 15; i++) {
      const char = String.fromCharCode(97 + (i % 26)) // a-z
      complexInput = 'on' + complexInput + char + 'click='
    }
    
    const result = sanitizeInput(complexInput)
    
    // Should complete sanitization without hanging
    expect(result).toBeDefined()
    // Should not contain any remaining dangerous patterns
    expect(result).not.toMatch(/on\w+\s*=/)
    expect(result).not.toMatch(/javascript:/i)
    // Should respect length limit
    expect(result.length).toBeLessThanOrEqual(500)
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

  it('should preserve legitimate words beginning with "on"', () => {
    // Common legitimate words that start with "on"
    expect(sanitizeInput('information')).toBe('information')
    expect(sanitizeInput('Online')).toBe('Online')
    expect(sanitizeInput('ongoing')).toBe('ongoing')
    expect(sanitizeInput('onboard')).toBe('onboard')
    expect(sanitizeInput('once')).toBe('once')
    expect(sanitizeInput('one')).toBe('one')
    expect(sanitizeInput('only')).toBe('only')
  })

  it('should preserve phrases containing words with "on"', () => {
    expect(sanitizeInput('based on research')).toBe('based on research')
    expect(sanitizeInput('John Online is my name')).toBe('John Online is my name')
    expect(sanitizeInput('The ongoing discussion')).toBe('The ongoing discussion')
    expect(sanitizeInput('We are onboarding new users')).toBe('We are onboarding new users')
    expect(sanitizeInput('This information is important')).toBe('This information is important')
  })

  it('should still remove event handlers while preserving legitimate text', () => {
    // Event handlers should be removed
    expect(sanitizeInput('information onclick=alert(1)')).toBe('information alert(1)')
    expect(sanitizeInput('Online onerror=bad()')).toBe('Online bad()')
    expect(sanitizeInput('Click here onclick=hack() for information')).toBe(
      'Click here hack() for information'
    )
  })
})

describe('encodeHtmlEntities', () => {
  it('should encode HTML special characters', () => {
    const result = encodeHtmlEntities('<script>alert("xss")</script>')
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
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

  it('should handle non-string email with type guard error', () => {
    // Intentionally pass wrong type to test runtime type guard
    const formData = {
      email: 12345 as unknown as string, // Type cast to bypass TS checking
      name: 'John Doe',
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Email must be a string')
  })

  it('should handle non-string name with type guard error', () => {
    // Intentionally pass wrong type to test runtime type guard
    const formData = {
      email: 'user@example.com',
      name: { firstName: 'John', lastName: 'Doe' } as unknown as string, // Type cast to bypass TS checking
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBe('Name must be a string')
  })

  it('should handle multiple type guard violations', () => {
    const formData = {
      email: ['test@example.com'] as unknown as string, // Array instead of string
      name: 123 as unknown as string, // Number instead of string
      acceptTerms: true,
    }

    const result = validateForm(formData)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Email must be a string')
    expect(result.errors.name).toBe('Name must be a string')
    expect(Object.keys(result.errors).length).toBe(2)
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

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delay function execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous execution on rapid calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('call1')
    vi.advanceTimersByTime(100)

    debouncedFn('call2')
    vi.advanceTimersByTime(100)

    debouncedFn('call3')
    vi.advanceTimersByTime(300)

    // Should only be called once with the last value
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('call3')
  })

  it('should execute multiple times if delay elapses between calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('call1')
    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('call1')

    debouncedFn('call2')
    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('call2')

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should preserve function arguments', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('arg1', 'arg2', 123)
    vi.advanceTimersByTime(300)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should handle zero delay', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 0)

    debouncedFn('test')
    vi.advanceTimersByTime(0)

    expect(mockFn).toHaveBeenCalledWith('test')
  })
})
